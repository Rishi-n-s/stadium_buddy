import React from "react";
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AlertTriangle, Circle, RefreshCw, CheckCircle } from 'lucide-react';

export default function StaffAlerts(props) {
  const {
    alerts,
    onResolveAlert,
    onDispatchAlert,
    selectedStadium
  } = props || {};
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-gutter mt-8 space-y-12 pb-24 bg-surface min-h-screen text-on-surface">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 border border-primary flex items-center justify-center text-primary rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-display-md font-display-md uppercase italic text-on-surface">StadiumIQ</h1>
            <p className="text-label-caps font-label-caps text-on-surface-variant">Volunteer & Staff Feed</p>
          </div>
        </div>

        <Badge variant="info" className="px-4 py-2 border border-secondary-fixed">
          <Circle className="h-4 w-4 mr-2 animate-pulse" />
          STAFF STATUS: ON DUTY
        </Badge>
      </header>

      {/* Main Alert List */}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant/30 pb-4">
          <h2 className="text-headline-md font-headline-md uppercase italic text-on-surface">Active Dispatch Alerts</h2>
          <Badge variant="neutral">
            {alerts.length} ALERTS ACTIVE
          </Badge>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <Card 
                key={alert.id}
                className="relative overflow-hidden group border-l-4 p-6"
                style={{
                  borderLeftColor: alert.severity === "CRITICAL" 
                    ? "var(--error)" 
                    : alert.severity === "MODERATE"
                      ? "var(--primary)"
                      : "var(--outline-variant)"
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <Badge variant={alert.severity === "CRITICAL" ? "error" : alert.severity === "MODERATE" ? "info" : "neutral"}>
                        {alert.severity}
                      </Badge>
                      <span className="text-label-caps font-label-caps text-on-surface-variant border-b border-outline-variant border-dashed">ZONE ID: {alert.zoneId.toUpperCase()}</span>
                    </div>
                    <h3 className="text-headline-sm font-headline-sm uppercase text-on-surface">{alert.title}</h3>
                  </div>
                  
                  {alert.status === "dispatched" && (
                    <Badge variant="success">
                      <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                      DISPATCHED
                    </Badge>
                  )}
                </div>

                <div className="mb-6 text-body-md font-body-md text-on-surface-variant leading-relaxed">
                  <p>{alert.description}</p>
                  {alert.instruction && (
                    <div className="mt-4 p-4 bg-primary-container text-on-primary-container rounded-lg border-l-4 border-primary font-mono text-sm shadow-inner">
                      "AI Guidance: {alert.instruction}"
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-end">
                  {alert.status === "active" && (
                    <Button
                      onClick={() => onDispatchAlert(alert.id)}
                      variant="primary"
                    >
                      DISPATCH TEAM
                    </Button>
                  )}
                  <Button
                    onClick={() => onResolveAlert(alert.id)}
                    variant="outline"
                  >
                    MARK RESOLVED
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center border-dashed">
            <CheckCircle className="text-secondary-fixed h-16 w-16 mb-6" />
            <h3 className="text-headline-md font-headline-md uppercase italic mb-2 text-on-surface">No Active Incidents</h3>
            <p className="text-body-md font-body-md text-on-surface-variant">
              All volunteer feeds are clear. General Operations are running smoothly.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
