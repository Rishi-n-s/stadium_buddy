/**
 * locationService.js
 * Platform-agnostic GPS location service for StadiumIQ (Web/Browser).
 * 
 * Features:
 * - Continuous watchPosition with high accuracy
 * - Kalman filter for GPS noise smoothing
 * - Battery-efficient: only emits updates if moved >5m OR >3s elapsed
 * - Graceful error handling: permission denied, signal loss, unsupported
 */

// ─── Kalman Filter for 1D GPS coordinate smoothing ───────────────────────────
// Reduces jitter from consecutive GPS pings without adding lag.
class KalmanFilter {
  constructor({ R = 1, Q = 3 } = {}) {
    this.R = R;   // sensor noise covariance (higher = trust GPS less)
    this.Q = Q;   // process noise covariance (higher = faster to react)
    this.P = null;
    this.x = null;
    this.K = null;
  }

  filter(measurement) {
    if (this.x === null) {
      this.x = measurement;
      this.P = 1;
      return measurement;
    }
    // Predict
    this.P = this.P + this.Q;
    // Update
    this.K = this.P / (this.P + this.R);
    this.x = this.x + this.K * (measurement - this.x);
    this.P = (1 - this.K) * this.P;
    return this.x;
  }

  reset() {
    this.P = null;
    this.x = null;
    this.K = null;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MIN_DISTANCE_METERS = 5;    // Ignore updates if moved less than this
const MIN_INTERVAL_MS = 3000;     // Always emit at least every 3s regardless
const HIGH_ACCURACY_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 2000,
};

// ─── Haversine distance in meters ─────────────────────────────────────────────
function haversine(lon1, lat1, lon2, lat2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Module state ─────────────────────────────────────────────────────────────
let watchId = null;
let lastEmittedPos = null;
let lastEmittedTime = 0;
let callback = null;

const latFilter = new KalmanFilter({ R: 1, Q: 3 });
const lonFilter = new KalmanFilter({ R: 1, Q: 3 });

// ─── Status codes for error handling ──────────────────────────────────────────
export const GPS_STATUS = {
  ACTIVE: "active",
  PERMISSION_DENIED: "permission_denied",
  POSITION_UNAVAILABLE: "position_unavailable",
  TIMEOUT: "timeout",
  UNSUPPORTED: "unsupported",
  STOPPED: "stopped",
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start continuous GPS tracking.
 * @param {Function} onUpdate - Called with { lat, lng, heading, speed, accuracy, timestamp, status }
 * @param {Function} onError  - Called with { status, message }
 */
export function startTracking(onUpdate, onError) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    onError?.({ status: GPS_STATUS.UNSUPPORTED, message: "Geolocation is not supported by this browser." });
    return;
  }

  stopTracking(); // clear any previous watch
  latFilter.reset();
  lonFilter.reset();
  callback = onUpdate;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, heading, speed, accuracy } = position.coords;
      const now = Date.now();

      // Apply Kalman smoothing
      const smoothLat = latFilter.filter(latitude);
      const smoothLon = lonFilter.filter(longitude);

      // Battery-efficient gate: only emit if moved enough OR enough time passed
      const movedEnough =
        !lastEmittedPos ||
        haversine(lastEmittedPos.lng, lastEmittedPos.lat, smoothLon, smoothLat) >= MIN_DISTANCE_METERS;
      const timeElapsed = now - lastEmittedTime >= MIN_INTERVAL_MS;

      if (!movedEnough && !timeElapsed) return;

      lastEmittedPos = { lat: smoothLat, lng: smoothLon };
      lastEmittedTime = now;

      onUpdate?.({
        lat: smoothLat,
        lng: smoothLon,
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        timestamp: now,
        status: GPS_STATUS.ACTIVE,
      });
    },
    (err) => {
      let status = GPS_STATUS.POSITION_UNAVAILABLE;
      let message = "Unable to get location.";

      switch (err.code) {
        case err.PERMISSION_DENIED:
          status = GPS_STATUS.PERMISSION_DENIED;
          message = "Location permission denied. Please enable location access in your browser settings.";
          break;
        case err.POSITION_UNAVAILABLE:
          status = GPS_STATUS.POSITION_UNAVAILABLE;
          message = "Location signal lost. Please move to an open area.";
          break;
        case err.TIMEOUT:
          status = GPS_STATUS.TIMEOUT;
          message = "Location request timed out. Retrying...";
          break;
        default:
          message = err.message || message;
      }

      onError?.({ status, message });
    },
    HIGH_ACCURACY_OPTIONS
  );
}

/**
 * Stop GPS tracking and clean up.
 */
export function stopTracking() {
  if (watchId !== null) {
    navigator.geolocation?.clearWatch(watchId);
    watchId = null;
  }
  callback = null;
  lastEmittedPos = null;
  lastEmittedTime = 0;
}

/**
 * Get a single one-shot position (for initial map centering, etc.)
 * @returns {Promise<{lat, lng, accuracy}>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ status: GPS_STATUS.UNSUPPORTED, message: "Geolocation not supported." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject({ status: GPS_STATUS.PERMISSION_DENIED, message: err.message }),
      HIGH_ACCURACY_OPTIONS
    );
  });
}

/**
 * Check if location permission is already granted (without prompting).
 * @returns {Promise<"granted"|"denied"|"prompt">}
 */
export async function checkLocationPermission() {
  if (!navigator.permissions) return "prompt";
  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state; // "granted" | "denied" | "prompt"
  } catch {
    return "prompt";
  }
}
