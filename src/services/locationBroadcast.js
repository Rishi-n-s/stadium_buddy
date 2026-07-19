/**
 * locationBroadcast.js
 * WebSocket client for broadcasting & receiving live location updates.
 * 
 * Features:
 * - Auto-connects and auto-reconnects with exponential backoff
 * - Throttles outbound updates: only sends if moved >10m OR >5s elapsed
 * - Receives other users' positions and calls onUsersUpdate callback
 * - Consent-gated: won't connect unless user has accepted tracking
 */

import { GPS_STATUS } from "./locationService";

// ─── Constants ────────────────────────────────────────────────────────────────
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:4000";
const CONSENT_KEY = "stadiamiq_location_consent";
const MIN_SEND_DISTANCE_M = 10;
const MIN_SEND_INTERVAL_MS = 5000;
const MAX_RECONNECT_DELAY_MS = 30000;

// ─── Haversine distance ───────────────────────────────────────────────────────
function haversine(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Module state ─────────────────────────────────────────────────────────────
let ws = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
let retryCount = 0;
const MAX_RETRIES = 3;
let userId = null;
let userRole = null;
let userName = null;
let stadiumId = null;
const userSubscribers = new Set();
const statusSubscribers = new Set();
let lastSentPos = null;
let lastSentTime = 0;
let isManuallyDisconnected = false;

// ─── Connection Status ────────────────────────────────────────────────────────
export const BROADCAST_STATUS = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected",
  NO_CONSENT: "no_consent",
};

// ─── Consent helpers ─────────────────────────────────────────────────────────
export function hasLocationConsent() {
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export function grantLocationConsent() {
  localStorage.setItem(CONSENT_KEY, "true");
}

export function revokeLocationConsent() {
  localStorage.setItem(CONSENT_KEY, "false");
  disconnect();
}

// ─── Connect ─────────────────────────────────────────────────────────────────
/**
 * Connect to the WebSocket broadcast server.
 * @param {Object} opts
 * @param {string} opts.userId       - unique user ID
 * @param {string} opts.role         - "fan" | "staff" | "organizer"
 * @param {string} opts.name         - display name
 * @param {string} opts.stadiumId    - stadium slug for room partitioning
 * @param {Function} opts.onUsers    - called with Map<userId, userLocation> on updates
 * @param {Function} opts.onStatus   - called with BROADCAST_STATUS on connection changes
 */
export function subscribeToUsers(callback) {
  userSubscribers.add(callback);
  return () => userSubscribers.delete(callback);
}

export function subscribeToStatus(callback) {
  statusSubscribers.add(callback);
  return () => statusSubscribers.delete(callback);
}

export function connect({ userId: uid, role, name, stadiumId: sid, onUsers, onStatus }) {
  if (!hasLocationConsent()) {
    onStatus?.(BROADCAST_STATUS.NO_CONSENT);
    return;
  }

  userId = uid;
  userRole = role;
  userName = name;
  stadiumId = sid;
  if (onUsers) userSubscribers.add(onUsers);
  if (onStatus) statusSubscribers.add(onStatus);
  isManuallyDisconnected = false;
  retryCount = 0;

  openSocket();
}

function openSocket() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  statusSubscribers.forEach(cb => cb(BROADCAST_STATUS.CONNECTING));

  try {
    ws = new WebSocket(WS_URL);
  } catch (err) {
    console.warn("[LocationBroadcast] WebSocket creation failed:", err);
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    reconnectDelay = 1000; // reset backoff on success
    retryCount = 0;
    statusSubscribers.forEach(cb => cb(BROADCAST_STATUS.CONNECTED));

    // Register with server
    send({ type: "join", userId, role: userRole, name: userName, stadiumId });
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "users_update") {
        // Convert array to Map<userId, data>
        const usersMap = new Map(msg.users.map((u) => [u.userId, u]));
        userSubscribers.forEach(cb => cb(usersMap));
      }
    } catch (e) {
      console.warn("[LocationBroadcast] Failed to parse message:", e);
    }
  };

  ws.onerror = (err) => {
    // We suppress the console.warn here because the browser natively logs net::ERR_CONNECTION_REFUSED
    // which is noisy enough. 
  };

  ws.onclose = () => {
    statusSubscribers.forEach(cb => cb(BROADCAST_STATUS.DISCONNECTED));
    if (!isManuallyDisconnected) {
      scheduleReconnect();
    }
  };
}

function scheduleReconnect() {
  if (retryCount >= MAX_RETRIES) {
    console.warn(`[LocationBroadcast] Max retries (${MAX_RETRIES}) reached. Disabling live location broadcast to prevent spam.`);
    return;
  }
  
  retryCount++;
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY_MS);
    openSocket();
  }, reconnectDelay);
}

// ─── Send location update ────────────────────────────────────────────────────
/**
 * Send the user's current location to the server (throttled).
 * @param {Object} pos - { lat, lng, heading, speed, accuracy, timestamp }
 */
export function sendLocation(pos) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (!hasLocationConsent()) return;

  const now = Date.now();
  const movedEnough =
    !lastSentPos ||
    haversine(lastSentPos.lng, lastSentPos.lat, pos.lng, pos.lat) >= MIN_SEND_DISTANCE_M;
  const timeElapsed = now - lastSentTime >= MIN_SEND_INTERVAL_MS;

  if (!movedEnough && !timeElapsed) return;

  lastSentPos = { lat: pos.lat, lng: pos.lng };
  lastSentTime = now;

  send({
    type: "location",
    userId,
    role: userRole,
    name: userName,
    stadiumId,
    lat: pos.lat,
    lng: pos.lng,
    heading: pos.heading || 0,
    speed: pos.speed || 0,
    accuracy: pos.accuracy || 0,
    ts: pos.timestamp || now,
  });
}

function send(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────
export function disconnect() {
  isManuallyDisconnected = true;
  clearTimeout(reconnectTimer);
  if (ws) {
    ws.close();
    ws = null;
  }
  statusSubscribers.forEach(cb => cb(BROADCAST_STATUS.DISCONNECTED));
}

export function getBroadcastStatus() {
  if (!ws) return BROADCAST_STATUS.DISCONNECTED;
  if (ws.readyState === WebSocket.OPEN) return BROADCAST_STATUS.CONNECTED;
  if (ws.readyState === WebSocket.CONNECTING) return BROADCAST_STATUS.CONNECTING;
  return BROADCAST_STATUS.DISCONNECTED;
}
