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
    <div className="min-h-screen flex flex-col bg-surface text-on-surface pb-28">
      {/* PERSISTENT DEVELOPER ROLE & SIMULATION CONTROL PANEL */}
      <div className="bg-surface-container-highest border-b border-primary/20 p-3 z-[100] sticky top-0 shadow-md">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          <div className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
            StadiumIQ Simulator Control Panel
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

      {/* Floating Bottom Nav Bar */}
      <div className="nav-wrapper">
        <div className="menu">
          <a onClick={() => setCurrentView("fan")} className={currentView === "fan" ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
            <span>Home</span>
          </a>
          <a onClick={() => setCurrentView("staff")} className={currentView === "staff" ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
            </svg>
            <span>Files</span>
          </a>
          <a onClick={() => setCurrentView("wayfinding")} className={currentView === "wayfinding" ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
            <span>Plans</span>
          </a>
          <a onClick={() => setCurrentView("organizer")} className={currentView === "organizer" ? "active" : ""}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 0 1-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 0 1 6.126 3.537ZM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 0 1 0 .75l-1.732 3c-.229.397-.76.5-1.067.161A5.23 5.23 0 0 1 6.75 12a5.23 5.23 0 0 1 1.37-3.536ZM10.878 17.13c-.447-.098-.623-.608-.394-1.004l1.733-3.002a.75.75 0 0 1 .65-.375h3.465c.457 0 .81.407.672.842a5.252 5.252 0 0 1-6.126 3.539Z" />
              <path fillRule="evenodd" d="M21 12.75a.75.75 0 1 0 0-1.5h-.783a8.22 8.22 0 0 0-.237-1.357l.734-.267a.75.75 0 1 0-.513-1.41l-.735.268a8.24 8.24 0 0 0-.689-1.192l.6-.503a.75.75 0 1 0-.964-1.149l-.6.504a8.3 8.3 0 0 0-1.054-.885l.391-.678a.75.75 0 1 0-1.299-.75l-.39.676a8.188 8.188 0 0 0-1.295-.47l.136-.77a.75.75 0 0 0-1.477-.26l-.136.77a8.36 8.36 0 0 0-1.377 0l-.136-.77a.75.75 0 1 0-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 0 0-1.3.75l.392.678a8.29 8.29 0 0 0-1.054.885l-.6-.504a.75.75 0 1 0-.965 1.149l.6.503a8.243 8.243 0 0 0-.689 1.192L3.8 8.216a.75.75 0 1 0-.513 1.41l.735.267a8.222 8.222 0 0 0-.238 1.356h-.783a.75.75 0 0 0 0 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 0 0 .513 1.41l.735-.268c.197.417.428.816.69 1.191l-.6.504a.75.75 0 0 0 .963 1.15l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 0 0 1.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.77a.75.75 0 0 0 1.477.261l.137-.772a8.332 8.332 0 0 0 1.376 0l.136.772a.75.75 0 1 0 1.477-.26l-.136-.771a8.19 8.19 0 0 0 1.294-.47l.391.677a.75.75 0 0 0 1.3-.75l-.393-.679a8.29 8.29 0 0 0 1.054-.885l.601.504a.75.75 0 0 0 .964-1.15l-.6-.503c.261-.375.492-.774.69-1.191l.735.267a.75.75 0 1 0 .512-1.41l-.734-.267c.115-.439.195-.892.237-1.356h.784Zm-2.657-3.06a6.744 6.744 0 0 0-1.19-2.053 6.784 6.784 0 0 0-1.82-1.51A6.705 6.705 0 0 0 12 5.25a6.8 6.8 0 0 0-1.225.11 6.7 6.7 0 0 0-2.15.793 6.784 6.784 0 0 0-2.952 3.489.76.76 0 0 1-.036.098A6.74 6.74 0 0 0 5.251 12a6.74 6.74 0 0 0 3.366 5.842l.009.005a6.704 6.704 0 0 0 2.18.798l.022.003a6.792 6.792 0 0 0 2.368-.004 6.704 6.704 0 0 0 2.205-.811 6.785 6.785 0 0 0 1.762-1.484l.009-.01.009-.01a6.743 6.743 0 0 0 1.18-2.066c.253-.707.39-1.469.39-2.263a6.74 6.74 0 0 0-.408-2.309Z" clipRule="evenodd" />
            </svg>
            <span>Settings</span>
          </a>
        </div>
      </div>

      {/* Global footer */}
      <footer className="py-4 border-t border-outline-variant/20 bg-surface-container-lowest text-center text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mt-auto">
        StadiumIQ Operational Platform • Hackathon Build 1.0
      </footer>
    </div>
  );
}

