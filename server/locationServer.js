/**
 * WebSocket Location Broadcast Server
 * 
 * Runs on Node.js. Receives location pings from all connected clients,
 * stores the latest position per user (in-memory), and broadcasts the full
 * user map to all clients in the same stadiumId room.
 * 
 * Start: node server/locationServer.js
 * 
 * Environment variables:
 *   PORT=4000          (default: 4000)
 *   STALE_TTL_MS=30000 (drop user if no update for 30s, default: 30000)
 */

const { WebSocketServer } = require("ws");
const { EventEmitter } = require("events");

const PORT = process.env.PORT || 4000;
const STALE_TTL_MS = parseInt(process.env.STALE_TTL_MS || "30000", 10);
const CLEANUP_INTERVAL_MS = 10000;

// ─── In-memory store ──────────────────────────────────────────────────────────
// Structure: Map<stadiumId, Map<userId, { ...locationData, ws, lastSeen }>>
const rooms = new Map();

function getRoom(stadiumId) {
  if (!rooms.has(stadiumId)) rooms.set(stadiumId, new Map());
  return rooms.get(stadiumId);
}

// ─── Broadcast helpers ───────────────────────────────────────────────────────
function broadcastRoomUsers(stadiumId) {
  const room = rooms.get(stadiumId);
  if (!room) return;

  const users = [];
  room.forEach((user) => {
    users.push({
      userId: user.userId,
      name: user.name,
      role: user.role,
      lat: user.lat,
      lng: user.lng,
      heading: user.heading,
      speed: user.speed,
      accuracy: user.accuracy,
      ts: user.ts,
    });
  });

  const payload = JSON.stringify({ type: "users_update", users });

  room.forEach((user) => {
    if (user.ws && user.ws.readyState === 1 /* OPEN */) {
      user.ws.send(payload);
    }
  });
}

// ─── Stale user cleanup ───────────────────────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  let changed = false;

  rooms.forEach((room, stadiumId) => {
    room.forEach((user, userId) => {
      if (now - user.lastSeen > STALE_TTL_MS) {
        console.log(`[Server] Removing stale user ${userId} from ${stadiumId}`);
        room.delete(userId);
        changed = true;
      }
    });

    // Broadcast if anything changed
    if (changed) broadcastRoomUsers(stadiumId);
    changed = false;
  });
}, CLEANUP_INTERVAL_MS);

// ─── WebSocket Server ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

console.log(`[Server] StadiumIQ Location Server running on ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  let joinedStadiumId = null;
  let joinedUserId = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return; // ignore malformed messages
    }

    switch (msg.type) {
      // ── User joins a stadium room ──
      case "join": {
        const { userId, role, name, stadiumId } = msg;
        if (!userId || !stadiumId) return;

        joinedUserId = userId;
        joinedStadiumId = stadiumId;

        const room = getRoom(stadiumId);
        room.set(userId, {
          userId,
          name: name || "Unknown",
          role: role || "fan",
          lat: null,
          lng: null,
          heading: 0,
          speed: 0,
          accuracy: 0,
          ts: Date.now(),
          lastSeen: Date.now(),
          ws,
        });

        console.log(`[Server] User ${userId} (${role}) joined stadium: ${stadiumId} | Total: ${room.size}`);
        broadcastRoomUsers(stadiumId);
        break;
      }

      // ── Location update ──
      case "location": {
        const { userId, stadiumId, lat, lng, heading, speed, accuracy, ts } = msg;
        if (!userId || !stadiumId || lat == null || lng == null) return;

        const room = rooms.get(stadiumId);
        if (!room || !room.has(userId)) return;

        const user = room.get(userId);
        Object.assign(user, { lat, lng, heading, speed, accuracy, ts, lastSeen: Date.now() });

        broadcastRoomUsers(stadiumId);
        break;
      }

      default:
        break;
    }
  });

  ws.on("close", () => {
    if (joinedStadiumId && joinedUserId) {
      const room = rooms.get(joinedStadiumId);
      if (room) {
        room.delete(joinedUserId);
        console.log(`[Server] User ${joinedUserId} disconnected from ${joinedStadiumId} | Remaining: ${room.size}`);
        broadcastRoomUsers(joinedStadiumId);
      }
    }
  });

  ws.on("error", (err) => {
    console.error(`[Server] WebSocket error for user ${joinedUserId}:`, err.message);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("[Server] Shutting down...");
  wss.close(() => process.exit(0));
});
