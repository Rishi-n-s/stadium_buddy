import React, { useState, useEffect } from "react";
import FanHome from "./views/FanHome";
import Wayfinding from "./views/Wayfinding";
import OrganizerDashboard from "./views/OrganizerDashboard";
import StaffAlerts from "./views/StaffAlerts";
import IntroAnimation from "./views/IntroAnimation";
import LandingPage from "./views/LandingPage";
import AuthPortal from "./views/AuthPortal";
import { getCurrentSession, logoutUser } from "./services/authService";
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
  const [showSimulator, setShowSimulator] = useState(false);
  
  // Navigation flow state (Intro -> Auth -> Landing -> Dashboard)
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getCurrentSession();
      setCurrentUser(session);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setSelectedStadium(null);
    setCurrentView("fan");
  };

  // Simulated operational states
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [congestedZones, setCongestedZones] = useState(["gate_4"]); // Start with gate_4 blocked due to the starting critical spill alert

  const handleDeployStadium = (stadium) => {
    setSelectedStadium(stadium);
    // Dynamically scale zones based on the selected stadium's capacity
    const totalBaseCap = 65500; // sum of initial capacities (15000+12500+8000+10000+20000)
    const ratio = stadium.capacity / totalBaseCap;
    
    setZones(prev => {
      const updated = {};
      Object.keys(INITIAL_ZONES).forEach(key => {
        const zone = INITIAL_ZONES[key];
        updated[key] = {
          ...zone,
          capacity: Math.round(zone.capacity * ratio),
          current: Math.round(zone.current * ratio)
        };
      });
      return updated;
    });
  };


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

  if (isIntroActive) {
    return <IntroAnimation onFinish={() => setIsIntroActive(false)} />;
  }

  if (!currentUser) {
    return <AuthPortal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (!selectedStadium) {
    return <LandingPage onDeploy={handleDeployStadium} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* UNIFIED PREMIUM TOP NAVIGATION HEADER */}
      <header className="bg-surface-container-high/95 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-[100] shadow-md">
        <div className="max-w-[1440px] mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Logo & Selected Stadium (And mobile profile badge) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 cursor-default">
                <span className="material-symbols-outlined text-primary text-xl font-extrabold" style={{ fontVariationSettings: "'FILL' 1" }}>sports_stadium</span>
                <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">STADIAMIQ</span>
              </div>
              <span className="text-outline/20">|</span>
              <button 
                onClick={() => setSelectedStadium(null)}
                title="Click to Switch Stadium"
                className="flex items-center gap-1.5 text-[10px] sm:text-xs text-on-surface-variant hover:text-white font-mono bg-surface-container-highest hover:bg-surface-container-low px-2.5 py-1 rounded-full border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer shadow-sm group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:bg-primary-light animate-pulse" />
                <span className="truncate max-w-[80px] sm:max-w-none">{selectedStadium.stadium.toUpperCase()}</span>
                <span className="material-symbols-outlined text-[12px] opacity-60 group-hover:opacity-100 transition-opacity">swap_horiz</span>
              </button>
            </div>

            {/* Mobile Profile & Logout */}
            {currentUser && (
              <div className="flex md:hidden items-center gap-2 bg-surface-container-highest px-2.5 py-1 rounded-full border border-outline-variant/30 shadow-inner">
                <span className="text-sm select-none">{currentUser.avatar}</span>
                <button 
                  onClick={handleLogout}
                  title="Log Out"
                  className="material-symbols-outlined text-[16px] text-outline hover:text-error ml-1 transition-colors cursor-pointer"
                >
                  logout
                </button>
              </div>
            )}
          </div>

          {/* Bottom Row on Mobile / Nav + Simulation actions */}
          <div className="flex items-center justify-between md:justify-center w-full md:w-auto gap-3 md:gap-4 border-t border-outline-variant/20 pt-2.5 md:pt-0 md:border-none">
            {/* Center Navigation Tabs */}
            <nav className="flex items-center bg-surface-container-lowest/80 border border-outline-variant/50 p-0.5 sm:p-1 rounded-full shadow-sm">
              <button 
                onClick={() => setCurrentView("fan")} 
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentView === "fan" ? "bg-primary-container text-white shadow-sm" : "text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">home</span>
                <span className="hidden md:inline">Home</span>
              </button>
              <button 
                onClick={() => setCurrentView("staff")} 
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentView === "staff" ? "bg-primary-container text-white shadow-sm" : "text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">notifications</span>
                <span className="hidden md:inline">Staff Alerts</span>
              </button>
              <button 
                onClick={() => setCurrentView("wayfinding")} 
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentView === "wayfinding" ? "bg-primary-container text-white shadow-sm" : "text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">explore</span>
                <span className="hidden md:inline">Wayfinding</span>
              </button>
              <button 
                onClick={() => setCurrentView("organizer")} 
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 sm:gap-1.5 ${
                  currentView === "organizer" ? "bg-primary-container text-white shadow-sm" : "text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[15px] sm:text-[16px]">dashboard</span>
                <span className="hidden md:inline">Dashboard</span>
              </button>
            </nav>

            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold font-mono border transition-all flex items-center gap-1 sm:gap-1.5 ${
                showSimulator 
                  ? "bg-[#1a73e8] border-[#1a73e8] text-white shadow-md" 
                  : "bg-surface-container hover:bg-surface-container-high border-outline-variant text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[15px] sm:text-[16px]">build</span>
              <span className="hidden md:inline">Simulation</span>
            </button>
          </div>

          {/* Desktop User Profile Badge & Logout */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 bg-surface-container-highest px-3 py-1 rounded-full border border-outline-variant/30 shadow-inner">
              <span className="text-sm select-none">{currentUser.avatar}</span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] font-bold text-white max-w-[80px] truncate">{currentUser.name}</span>
                <span className="text-[8px] font-mono text-outline-variant uppercase">{currentUser.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                title="Log Out"
                className="material-symbols-outlined text-[16px] text-outline hover:text-error ml-1 transition-colors cursor-pointer"
              >
                logout
              </button>
            </div>
          )}
        </div>

        {/* Simulation Sub-drawer */}
        {showSimulator && (
          <div className="bg-surface-container-highest/95 border-t border-outline-variant/40 px-4 py-2.5 transition-all">
            <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[10px] font-mono text-outline uppercase tracking-wider">
                🛠️ Active Stadium Simulation Variables
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedStadium(null)}
                  className="bg-surface-container-low hover:bg-surface-container text-primary-light border border-primary/30 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
                >
                  🏟️ SWITCH STADIUM
                </button>
                <span className="text-[10px] font-mono text-on-surface-variant/30">|</span>
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
        )}
      </header>

      {/* Main Canvas view renderer */}
      <main className="flex-grow flex flex-col">
        {currentView === "fan" && (
          <FanHome
            language={language}
            setLanguage={setLanguage}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            zones={zones}
            onNavigateToWayfinding={() => setCurrentView("wayfinding")}
            selectedStadium={selectedStadium}
          />
        )}
        {currentView === "wayfinding" && (
          <Wayfinding
            language={language}
            setLanguage={setLanguage}
            congestedZones={congestedZones}
            onSimulateCongestion={triggerGate4Spill}
            selectedStadium={selectedStadium}
          />
        )}
        {currentView === "organizer" && (
          <OrganizerDashboard
            zones={zones}
            onExecuteAdvisoryAction={handleExecuteAdvisoryAction}
            onSimulateSpill={triggerGate4Spill}
            selectedStadium={selectedStadium}
          />
        )}
        {currentView === "staff" && (
          <StaffAlerts
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            onDispatchAlert={handleDispatchAlert}
            selectedStadium={selectedStadium}
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

