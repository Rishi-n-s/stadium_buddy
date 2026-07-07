/**
 * locationService.native.js
 * React Native GPS location service for StadiumIQ.
 * Compatible with both Expo (expo-location) and bare React Native (react-native-geolocation-service).
 *
 * Usage:
 *   import { startTracking, stopTracking } from './locationService.native';
 *   startTracking(onUpdate, onError);
 */

// ─── Detect Expo vs Bare RN ───────────────────────────────────────────────────
let ExpoLocation = null;
let RNGeolocation = null;

try {
  ExpoLocation = require("expo-location");
} catch {
  try {
    RNGeolocation = require("react-native-geolocation-service").default;
  } catch {
    console.warn("[LocationService.Native] No geolocation library found. Install expo-location or react-native-geolocation-service.");
  }
}

// ─── Kalman Filter (same as web version) ─────────────────────────────────────
class KalmanFilter {
  constructor({ R = 1, Q = 3 } = {}) {
    this.R = R;
    this.Q = Q;
    this.P = null;
    this.x = null;
  }
  filter(m) {
    if (this.x === null) { this.x = m; this.P = 1; return m; }
    this.P += this.Q;
    const K = this.P / (this.P + this.R);
    this.x = this.x + K * (m - this.x);
    this.P = (1 - K) * this.P;
    return this.x;
  }
  reset() { this.P = null; this.x = null; }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_DISTANCE_M = 5;
const MIN_INTERVAL_MS = 3000;

export const GPS_STATUS = {
  ACTIVE: "active",
  PERMISSION_DENIED: "permission_denied",
  POSITION_UNAVAILABLE: "position_unavailable",
  TIMEOUT: "timeout",
  UNSUPPORTED: "unsupported",
  STOPPED: "stopped",
};

// ─── Haversine distance ───────────────────────────────────────────────────────
function haversine(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Module state ─────────────────────────────────────────────────────────────
let watchSubscription = null; // for expo-location
let watchId = null;           // for react-native-geolocation-service
let lastPos = null;
let lastTime = 0;
const latFilter = new KalmanFilter();
const lonFilter = new KalmanFilter();

// ─── Permission Handling ──────────────────────────────────────────────────────
/**
 * Request foreground location permission.
 * @returns {Promise<boolean>} true if granted
 */
export async function requestForegroundPermission() {
  if (ExpoLocation) {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    return status === "granted";
  }
  // react-native-geolocation-service on Android requires runtime permission
  // handled automatically via the library on iOS; on Android you need react-native-permissions
  return true;
}

/**
 * Request background location permission (for tracking when app is backgrounded).
 * IMPORTANT: Must call requestForegroundPermission() first.
 * @returns {Promise<boolean>} true if granted
 */
export async function requestBackgroundPermission() {
  if (ExpoLocation) {
    const { status } = await ExpoLocation.requestBackgroundPermissionsAsync();
    return status === "granted";
  }
  // For bare RN, background permission needs react-native-permissions
  console.warn("[LocationService.Native] Background permission in bare RN requires react-native-permissions.");
  return false;
}

// ─── Foreground Tracking ──────────────────────────────────────────────────────
/**
 * Start continuous foreground GPS tracking.
 * @param {Function} onUpdate - called with location object
 * @param {Function} onError  - called with error object
 */
export async function startTracking(onUpdate, onError) {
  stopTracking();
  latFilter.reset();
  lonFilter.reset();
  lastPos = null;
  lastTime = 0;

  const granted = await requestForegroundPermission();
  if (!granted) {
    onError?.({ status: GPS_STATUS.PERMISSION_DENIED, message: "Location permission denied." });
    return;
  }

  function handlePosition(raw) {
    const lat = raw.coords?.latitude ?? raw.latitude;
    const lng = raw.coords?.longitude ?? raw.longitude;
    const heading = raw.coords?.heading ?? raw.heading ?? 0;
    const speed = raw.coords?.speed ?? raw.speed ?? 0;
    const accuracy = raw.coords?.accuracy ?? raw.accuracy ?? 0;
    const now = Date.now();

    const smoothLat = latFilter.filter(lat);
    const smoothLng = lonFilter.filter(lng);

    const moved = !lastPos || haversine(lastPos.lng, lastPos.lat, smoothLng, smoothLat) >= MIN_DISTANCE_M;
    const elapsed = now - lastTime >= MIN_INTERVAL_MS;

    if (!moved && !elapsed) return;

    lastPos = { lat: smoothLat, lng: smoothLng };
    lastTime = now;

    onUpdate?.({
      lat: smoothLat,
      lng: smoothLng,
      heading,
      speed,
      accuracy,
      timestamp: now,
      status: GPS_STATUS.ACTIVE,
    });
  }

  if (ExpoLocation) {
    watchSubscription = await ExpoLocation.watchPositionAsync(
      {
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 3,
      },
      handlePosition
    );
  } else if (RNGeolocation) {
    watchId = RNGeolocation.watchPosition(
      handlePosition,
      (err) => onError?.({ status: GPS_STATUS.POSITION_UNAVAILABLE, message: err.message }),
      {
        enableHighAccuracy: true,
        distanceFilter: 3,
        interval: 1000,
        fastestInterval: 500,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  } else {
    onError?.({ status: GPS_STATUS.UNSUPPORTED, message: "No geolocation library available." });
  }
}

/**
 * Stop foreground GPS tracking.
 */
export function stopTracking() {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
  if (watchId !== null && RNGeolocation) {
    RNGeolocation.clearWatch(watchId);
    watchId = null;
  }
}

// ─── Background Tracking (Expo only) ──────────────────────────────────────────
const BACKGROUND_TASK = "STADIAMIQ_LOCATION_TASK";

/**
 * Start background location updates (continues when app is backgrounded).
 * Requires expo-task-manager to be set up in your app entry file.
 * 
 * Example TaskManager definition (add to app entry file _layout.tsx or App.js):
 * 
 *   import * as TaskManager from 'expo-task-manager';
 *   TaskManager.defineTask('STADIAMIQ_LOCATION_TASK', ({ data, error }) => {
 *     if (error) return;
 *     const { locations } = data;
 *     // send locations[0] to locationBroadcast.sendLocation(...)
 *   });
 */
export async function startBackgroundTracking() {
  if (!ExpoLocation) {
    console.warn("[LocationService.Native] Background tracking only supported with expo-location.");
    return false;
  }

  const bgGranted = await requestBackgroundPermission();
  if (!bgGranted) {
    console.warn("[LocationService.Native] Background permission not granted.");
    return false;
  }

  const isRegistered = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_TASK).catch(() => false);
  if (!isRegistered) {
    await ExpoLocation.startLocationUpdatesAsync(BACKGROUND_TASK, {
      accuracy: ExpoLocation.Accuracy.Balanced,
      timeInterval: 5000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: "StadiumIQ is tracking your location",
        notificationBody: "Tap to return to the app.",
        notificationColor: "#7c3aed",
      },
      activityType: ExpoLocation.ActivityType.Fitness,
      pausesUpdatesAutomatically: false,
    });
  }
  return true;
}

/**
 * Stop background location tracking.
 */
export async function stopBackgroundTracking() {
  if (!ExpoLocation) return;
  const isRegistered = await ExpoLocation.hasStartedLocationUpdatesAsync(BACKGROUND_TASK).catch(() => false);
  if (isRegistered) {
    await ExpoLocation.stopLocationUpdatesAsync(BACKGROUND_TASK);
  }
}
