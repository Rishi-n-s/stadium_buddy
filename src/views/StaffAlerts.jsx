import React from "react";

export default function StaffAlerts({
  alerts,
  onResolveAlert,
  onDispatchAlert
}) {
  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8">
      {/* Top Header */}
      <header className="flex justify-between items-center pb-6 border-b border-outline-variant/30 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">warning</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary-light">StadiumIQ</h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">Volunteer & Staff Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-highest px-3 py-1 rounded-full border border-outline-variant">
          <span className="material-symbols-outlined text-secondary text-sm">circle</span>
          <span className="font-mono text-xs font-bold text-on-surface">STAFF STATUS: ON DUTY</span>
        </div>
      </header>

      {/* Main Alert List */}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-on-surface">Active Dispatch Alerts</h2>
          <span className="text-xs font-mono bg-surface-container px-2.5 py-1 rounded-full text-on-surface-variant border border-outline-variant/30">
            {alerts.length} ALERTS ACTIVE
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-6 rounded-xl border relative overflow-hidden bg-surface-container shadow-lg transition-all duration-300 ${
                  alert.severity === "CRITICAL" 
                    ? "border-error/30 hover:border-error/50" 
                    : alert.severity === "MODERATE"
                      ? "border-tertiary/30 hover:border-tertiary/50"
                      : "border-outline-variant hover:border-outline"
                }`}
              >
                {/* Visual urgency left stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  alert.severity === "CRITICAL" 
                    ? "bg-error" 
                    : alert.severity === "MODERATE"
                      ? "bg-tertiary"
                      : "bg-outline"
                }`} />

                <div className="flex justify-between items-start mb-3 pl-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        alert.severity === "CRITICAL" 
                          ? "bg-error/10 text-error border border-error/20" 
                          : alert.severity === "MODERATE"
                            ? "bg-tertiary/10 text-tertiary border border-tertiary/20"
                            : "bg-surface-container-highest text-on-surface-variant border border-outline-variant"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-outline-variant">ZONE ID: {alert.zoneId.toUpperCase()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">{alert.title}</h3>
                  </div>
                  
                  {alert.status === "dispatched" && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                      <span className="material-symbols-outlined text-[10px] animate-spin">refresh</span>
                      DISPATCHED
                    </span>
                  )}
                </div>

                <div className="pl-2 mb-4 text-sm text-on-surface-variant leading-relaxed">
                  <p>{alert.description}</p>
                  {alert.instruction && (
                    <div className="mt-3 p-3 bg-surface-container-low rounded border border-outline-variant/30 text-xs italic text-on-surface">
                      "AI Guidance: {alert.instruction}"
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pl-2">
                  {alert.status === "active" && (
                    <button
                      onClick={() => onDispatchAlert(alert.id)}
                      className="px-4 py-1.5 bg-primary-container hover:brightness-110 text-white rounded font-mono text-xs font-bold transition-all"
                    >
                      DISPATCH TEAM
                    </button>
                  )}
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-4 py-1.5 bg-surface-container-highest border border-outline-variant text-on-surface hover:bg-secondary hover:text-on-secondary hover:border-secondary rounded font-mono text-xs font-bold transition-all"
                  >
                    MARK RESOLVED
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-outline-variant/35 bg-surface-container text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-secondary text-5xl mb-3">check_circle</span>
            <h3 className="text-base font-bold mb-1">No Active Incidents</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All volunteer feeds are clear. General Operations are running smoothly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
