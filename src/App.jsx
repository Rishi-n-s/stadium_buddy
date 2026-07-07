import React, { useState, useEffect } from "react";
import FanHome from "./views/FanHome";
import Wayfinding from "./views/Wayfinding";
import OrganizerDashboard from "./views/OrganizerDashboard";
import StaffAlerts from "./views/StaffAlerts";
import { INITIAL_ZONES, updateOccupancy } from "./services/crowdEngine";

const INITIAL_ALERTS = [
  {
    id: "alert-1",
    severity: "CRITICAL",
    zoneId: "gate_4",
    title: "Spill at Gate 4",
    description: "Large liquid spill near escalator. High slip risk during egress.",
    instruction: "Redirect fans to Gate 5. Request custodial dispatch to Z-402 immediately.",
    status: "active"
  },
  {
    id: "alert-2",
    severity: "MODERATE",
    zoneId: "merchandise_stand",
    title: "Congestion Alert",
    description: "Unusually high density detected near Merchandise Stand 3.",
    instruction: "Open auxiliary queue rope-line. Advise fans of shorter lines at North Stand.",
    status: "active"
  },
  {
    id: "alert-3",
    severity: "LOW",
    zoneId: "south_gate",
    title: "Weather Advisory",
    description: "Wind gusts exceeding 15mph expected in 30 minutes. Secure temporary banners.",
    instruction: "Secure temporary venue flags and concessions umbrellas.",
    status: "active"
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState("organizer"); // default to operator dashboard
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(true);
  
  // Simulated operational states
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [congestedZones, setCongestedZones] = useState(["gate_4"]); // Start with gate_4 blocked due to the starting critical spill alert

  // Dark Mode class toggler
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Live telemetry simulator - updates every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setZones(prevZones => updateOccupancy(prevZones, 5));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync congestedZones with active critical/moderate alerts
  useEffect(() => {
    const blocked = alerts
      .filter(a => a.status !== "resolved" && (a.severity === "CRITICAL" || a.severity === "MODERATE"))
      .map(a => a.zoneId);
    setCongestedZones(blocked);
  }, [alerts]);

  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: "resolved" } : a).filter(a => a.status !== "resolved"));
  };

  const handleDispatchAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: "dispatched" } : a));
  };

  // Triggers from Operator Dashboard buttons
  const handleExecuteAdvisoryAction = (advisoryId) => {
    if (advisoryId === "adv-1") {
      // Resolve North Gate congestion
      setZones(prev => ({
        ...prev,
        north_gate: {
          ...prev.north_gate,
          current: Math.round(prev.north_gate.capacity * 0.75), // drop to 75%
          trend: -3.0
        }
      }));
      alert("Overflow Gate 3B opened. Diverting North Gate crowd flow.");
    } else if (advisoryId === "adv-2") {
      // Resolve East Stand turnstiles congestion
      setZones(prev => ({
        ...prev,
        east_stand: {
          ...prev.east_stand,
          current: Math.round(prev.east_stand.current * 0.85),
          trend: -1.5
        }
      }));
      alert("Extra turnstiles opened at East Stand. Entry queue cleared.");
    }
  };

  // Simulation controls trigger
  const triggerGate4Spill = () => {
    const exists = alerts.some(a => a.zoneId === "gate_4" && a.title.includes("Spill"));
    if (exists) {
      alert("Gate 4 Spill incident is already active!");
      return;
    }
    const newSpill = {
      id: `alert-${Date.now()}`,
      severity: "CRITICAL",
      zoneId: "gate_4",
      title: "Spill at Gate 4",
      description: "Large liquid spill near escalator. High slip risk during egress.",
      instruction: "Redirect fans to Gate 5. Request custodial dispatch to Z-402 immediately.",
      status: "active"
    };
    setAlerts(prev => [newSpill, ...prev]);
    alert("Simulation: Emergency Spill triggered at Gate 4. Wayfinding routes will detour through Gate 5!");
  };

  const triggerMerchandiseRush = () => {
    const exists = alerts.some(a => a.zoneId === "merchandise_stand" && a.title.includes("Congestion"));
    if (exists) {
      alert("Merchandise Stand Rush is already active!");
      return;
    }
    const newRush = {
      id: `alert-${Date.now()}`,
      severity: "MODERATE",
      zoneId: "merchandise_stand",
      title: "Merchandise Stand Rush",
      description: "Unusually high density detected near Merchandise Stand 3.",
      instruction: "Open auxiliary queue rope-line. Advise fans of shorter lines at North Stand.",
      status: "active"
    };
    setAlerts(prev => [newRush, ...prev]);
    alert("Simulation: Merchandise rush triggered. Wayfinding routes will avoid the central retail area!");
  };

  const resetAllIncidents = () => {
    setAlerts([]);
    alert("Simulation: All active incident logs cleared and network status reset.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* PERSISTENT DEVELOPER ROLE & SIMULATION CONTROL PANEL */}
      <div className="bg-surface-container-highest border-b border-primary/20 p-3 z-[100] sticky top-0 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Persona selector tabs */}
          <div className="flex flex-wrap gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/50">
            {[
              { id: "organizer", label: "Control Room", icon: "dashboard" },
              { id: "wayfinding", label: "AI Wayfinding", icon: "explore" },
              { id: "fan", label: "Fan App", icon: "sports_soccer" },
              { id: "staff", label: "Staff Feed", icon: "contact_support" }
            ].map((role) => (
              <button
                key={role.id}
                onClick={() => setCurrentView(role.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentView === role.id 
                    ? "bg-primary-container text-white shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: currentView === role.id ? "'FILL' 1" : "'FILL' 0" }}>
                  {role.icon}
                </span>
                {role.label}
              </button>
            ))}
          </div>

          {/* Simulator options */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-wider">
              Simulation controls:
            </span>
            <button
              onClick={triggerGate4Spill}
              className="bg-error-container hover:brightness-110 text-on-error-container border border-error/20 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
            >
              ⚡ GATE 4 SPILL
            </button>
            <button
              onClick={triggerMerchandiseRush}
              className="bg-tertiary-container hover:brightness-110 text-on-tertiary-container border border-tertiary/20 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
            >
              ⚡ MERCH RUSH
            </button>
            <button
              onClick={resetAllIncidents}
              className="bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
            >
              ♻️ RESET ALL
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas view renderer */}
      <main className="flex-1 flex flex-col">
        {currentView === "fan" && (
          <FanHome
            language={language}
            setLanguage={setLanguage}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            zones={zones}
            onNavigateToWayfinding={() => setCurrentView("wayfinding")}
          />
        )}
        {currentView === "wayfinding" && (
          <Wayfinding
            language={language}
            setLanguage={setLanguage}
            congestedZones={congestedZones}
            onSimulateCongestion={triggerGate4Spill}
          />
        )}
        {currentView === "organizer" && (
          <OrganizerDashboard
            zones={zones}
            onExecuteAdvisoryAction={handleExecuteAdvisoryAction}
            onSimulateSpill={triggerGate4Spill}
          />
        )}
        {currentView === "staff" && (
          <StaffAlerts
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onDispatchAlert={handleDispatchAlert}
          />
        )}
      </main>

      {/* Global footer */}
      <footer className="py-4 border-t border-outline-variant/20 bg-surface-container-lowest text-center text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mt-auto">
        StadiumIQ Operational Platform • Hackathon Build 1.0
      </footer>
    </div>
  );
}
