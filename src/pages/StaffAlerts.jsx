import React from "react";
import Button from '../components/ui/Button';

export default function StaffAlerts(props) {
  const {
    alerts,
    onResolveAlert,
    onDispatchAlert,
    selectedStadium
  } = props || {};
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-gutter mt-8 space-y-12 pb-24 mesh-pattern min-h-screen">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-black pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-black bg-primary flex items-center justify-center text-white skew-x-negative-12 hard-shadow">
            <span className="material-symbols-outlined text-xl skew-x-positive-12">warning</span>
          </div>
          <div>
            <h1 className="text-display-md font-display-md uppercase italic text-on-surface">StadiumIQ</h1>
            <p className="text-label-caps font-label-caps text-on-surface-variant">Volunteer & Staff Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary-fixed border-2 border-black px-4 py-2 skew-x-negative-12 hard-shadow">
          <span className="material-symbols-outlined text-black text-sm animate-pulse">circle</span>
          <span className="text-label-caps font-label-caps text-black">STAFF STATUS: ON DUTY</span>
        </div>
      </header>

      {/* Main Alert List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <h2 className="text-headline-md font-headline-md uppercase italic text-on-surface">Active Dispatch Alerts</h2>
          <span className="text-label-caps font-label-caps bg-surface border-2 border-black px-4 py-2 skew-x-negative-12 hard-shadow">
            {alerts.length} ALERTS ACTIVE
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-6 border-4 border-black relative overflow-hidden bg-surface-container hard-shadow-lg transition-all duration-300 group`}
              >
                {/* Visual urgency left stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-4 border-r-4 border-black ${
                  alert.severity === "CRITICAL" 
                    ? "bg-error" 
                    : alert.severity === "MODERATE"
                      ? "bg-primary"
                      : "bg-surface-variant"
                }`} />

                <div className="flex justify-between items-start mb-4 pl-6">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`text-label-caps font-label-caps px-3 py-1 border-2 border-black skew-x-negative-12 hard-shadow ${
                        alert.severity === "CRITICAL" 
                          ? "bg-error text-white" 
                          : alert.severity === "MODERATE"
                            ? "bg-primary text-white"
                            : "bg-surface-variant text-black"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-label-caps font-label-caps text-on-surface-variant border-b-2 border-black border-dashed">ZONE ID: {alert.zoneId.toUpperCase()}</span>
                    </div>
                    <h3 className="text-headline-sm font-headline-sm uppercase">{alert.title}</h3>
                  </div>
                  
                  {alert.status === "dispatched" && (
                    <span className="flex items-center gap-2 text-label-caps font-label-caps bg-secondary-fixed text-black px-3 py-1 border-2 border-black skew-x-negative-12 hard-shadow">
                      <span className="material-symbols-outlined text-sm animate-spin skew-x-positive-12">refresh</span>
                      DISPATCHED
                    </span>
                  )}
                </div>

                <div className="pl-6 mb-6 text-body-md text-on-surface-variant leading-relaxed">
                  <p>{alert.description}</p>
                  {alert.instruction && (
                    <div className="mt-4 p-4 bg-primary-container border-l-4 border-black text-on-surface font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      "AI Guidance: {alert.instruction}"
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-end pl-6">
                  {alert.status === "active" && (
                    <Button
                      onClick={() => onDispatchAlert(alert.id)}
                      className="px-6 py-2 bg-primary text-white border-2 border-black font-label-caps text-label-caps skew-x-negative-12 hover:bg-primary-container hover:text-black transition-all hard-shadow active:translate-y-1 active:hard-shadow-none"
                    >
                      DISPATCH TEAM
                    </Button>
                  )}
                  <Button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-6 py-2 bg-surface text-primary border-2 border-primary font-label-caps text-label-caps skew-x-negative-12 hover:bg-primary hover:text-white transition-all hard-shadow active:translate-y-1 active:hard-shadow-none"
                  >
                    MARK RESOLVED
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 border-4 border-black bg-surface-container text-center max-w-lg mx-auto hard-shadow-lg flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-secondary-fixed text-6xl mb-6">check_circle</span>
            <h3 className="text-headline-md font-headline-md uppercase italic mb-2">No Active Incidents</h3>
            <p className="text-body-md text-on-surface-variant">
              All volunteer feeds are clear. General Operations are running smoothly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
