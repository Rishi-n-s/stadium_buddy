/**
 * LocationConsentModal.jsx
 * Privacy consent dialog for live location tracking.
 * Required before connecting to the WebSocket broadcast server.
 */

import React, { useState } from "react";
import { grantLocationConsent, revokeLocationConsent, hasLocationConsent } from "../../services/locationBroadcast";

export default function LocationConsentModal({ onConsent, onDecline, userName = "You" }) {
  const [loading, setLoading] = useState(false);

  const handleAllow = () => {
    setLoading(true);
    grantLocationConsent();
    setTimeout(() => {
      setLoading(false);
      onConsent?.();
    }, 400);
  };

  const handleDecline = () => {
    revokeLocationConsent();
    onDecline?.();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-high border border-outline-variant/40 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="bg-primary/10 border-b border-outline-variant/30 px-6 py-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              location_on
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">Enable Live Location Sharing</h2>
            <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">Required for real-time tracking</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-on-surface leading-relaxed">
            StadiumIQ wants to share <span className="font-bold text-primary-light">{userName}'s</span> live location with:
          </p>

          <ul className="space-y-2.5">
            {[
              { icon: "groups", label: "Staff & security personnel", sub: "To assist you in the venue" },
              { icon: "dashboard", label: "Organizer dashboard", sub: "For crowd flow monitoring" },
              { icon: "explore", label: "Wayfinding system", sub: "To guide you to your destination" },
            ].map(({ icon, label, sub }) => (
              <li key={icon} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-base mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-on-surface">{label}</p>
                  <p className="text-[10px] text-on-surface-variant font-mono">{sub}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Privacy details */}
          <div className="bg-surface-container-highest/60 border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-1.5">
            <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1">Data Policy</p>
            {[
              "Location data is only stored for the duration of your session",
              "Automatically deleted when you log out or close the app",
              "Never sold or shared outside StadiumIQ",
              "You can revoke access at any time from Settings",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[12px] mt-0.5 flex-shrink-0">check_circle</span>
                <p className="text-[10px] text-on-surface/80">{line}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest text-sm font-semibold rounded-xl transition-all"
          >
            Use Offline Mode
          </button>
          <button
            onClick={handleAllow}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary hover:brightness-110 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {loading ? (
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
            )}
            Allow Live Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
