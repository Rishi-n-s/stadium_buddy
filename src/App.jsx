import React, { useState, useEffect } from "react";
const FanHome = React.lazy(() => import("./pages/FanHome"));
const ArenaHome = React.lazy(() => import("./pages/ArenaHome"));
const Wayfinding = React.lazy(() => import("./pages/Wayfinding"));
const OrganizerDashboard = React.lazy(() => import("./pages/OrganizerDashboard"));
const StaffAlerts = React.lazy(() => import("./pages/StaffAlerts"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const AuthPortal = React.lazy(() => import("./pages/AuthPortal"));
const MatchDayOffer = React.lazy(() => import("./pages/MatchDayOffer"));
import { getCurrentSession, logoutUser } from "./services/authService";
import { INITIAL_ZONES, updateOccupancy } from "./services/crowdEngine";
import Button from './components/ui/Button';
import GlobalChatBot from './components/ui/GlobalChatBot';
import { Menu, LogOut, Bell, LayoutDashboard, AlertCircle, ArrowLeft } from 'lucide-react';

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

  // Navigation flow state (Landing -> Dashboard)
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [stitchUrl, setStitchUrl] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      // Check for the special hardcoded developer admin session first
      const localAdmin = localStorage.getItem("dev_admin_session");
      if (localAdmin) {
        const session = JSON.parse(localAdmin);
        setCurrentUser(session);
        setCurrentView('organizer'); // Admin defaults to organizer dashboard
        return;
      }

      const session = await getCurrentSession();
      setCurrentUser(session);
      if (session) {
        if (session.role === 'admin' || session.role === 'organizer') {
          setCurrentView('organizer');
        } else if (session.role === 'staff') {
          setCurrentView('staff');
        } else {
          setCurrentView('fan');
        }
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    // Clear special developer admin session if it exists
    localStorage.removeItem("dev_admin_session");

    await logoutUser();
    setCurrentUser(null);
    setSelectedStadium(null);
    setCurrentView("fan");
  };

  // Simulated operational states
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [congestedZones, setCongestedZones] = useState(["gate_4"]); // Start with gate_4 blocked due to the starting critical spill alert
  const [systemToast, setSystemToast] = useState(null);

  const showToast = React.useCallback((msg) => {
    setSystemToast(msg);
    setTimeout(() => setSystemToast(null), 4500);
  }, []);

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
      showToast("Overflow Gate 3B opened. Diverting North Gate crowd flow.");
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
      showToast("Extra turnstiles opened at East Stand. Entry queue cleared.");
    }
  };

  // ----------------------------------------------------
  // ADVANCED SIMULATION ENGINE (Dynamic Scenarios)
  // ----------------------------------------------------

  const triggerMatchEnd = () => {
    // Spikes density at exits, empties seating areas
    setZones(prev => ({
      ...prev,
      east_stand: { ...prev.east_stand, current: 0, trend: -20.0 }, // Empties instantly
      north_gate: { ...prev.north_gate, current: Math.round(prev.north_gate.capacity * 0.98), trend: 15.0 }, // Massive surge
      south_gate: { ...prev.south_gate, current: Math.round(prev.south_gate.capacity * 0.95), trend: 12.0 }
    }));

    const exodusAlert = {
      id: `alert-exodus-${Date.now()}`,
      severity: "CRITICAL",
      zoneId: "north_gate",
      title: "Match Ended: Mass Exodus",
      description: "Severe surge detected at all primary exits. Seating areas emptying rapidly.",
      instruction: "Deploy crowd control barriers at North and South Plazas immediately.",
      status: "active"
    };

    setAlerts(prev => [exodusAlert, ...prev.filter(a => a.id !== exodusAlert.id)]);
    showToast("Simulation: Match End triggered. Exit queues surging!");
  };

  const triggerWeatherEmergency = () => {
    // Empties outdoor zones, spikes indoor concourses
    setZones(prev => ({
      ...prev,
      east_stand: { ...prev.east_stand, current: 0, trend: -30.0 },
      concourse_b: { ...prev.concourse_b, current: Math.round(prev.concourse_b.capacity * 1.1), trend: 25.0 } // 110% capacity
    }));

    const weatherAlert = {
      id: `alert-weather-${Date.now()}`,
      severity: "CRITICAL",
      zoneId: "concourse_b",
      title: "Severe Weather: Lightning",
      description: "Lightning detected within 8 miles. Fans rushing indoor concourses.",
      instruction: "Initiate Shelter-in-Place protocol. Dispatch medical standby to Concourse B.",
      status: "active"
    };

    setAlerts(prev => [weatherAlert, ...prev.filter(a => a.id !== weatherAlert.id)]);
    showToast("Simulation: Severe Weather triggered. Outdoor zones evacuated to concourses!");
  };

  const triggerVIPLockdown = () => {
    // Locks down specific pathways by dropping capacity to 0 (forcing wayfinding detours)
    setZones(prev => ({
      ...prev,
      gate_4: { ...prev.gate_4, current: prev.gate_4.capacity, capacity: 1, trend: 0 }, // Artificial choke
      south_gate: { ...prev.south_gate, current: prev.south_gate.capacity, capacity: 1, trend: 0 }
    }));

    const vipAlert = {
      id: `alert-vip-${Date.now()}`,
      severity: "MODERATE",
      zoneId: "gate_4",
      title: "VIP Security Lockdown",
      description: "High-security movement in progress. Gate 4 and South Gate locked.",
      instruction: "Reroute all fan traffic away from southern perimeter.",
      status: "active"
    };

    setAlerts(prev => [vipAlert, ...prev.filter(a => a.id !== vipAlert.id)]);
    showToast("Simulation: VIP Lockdown active. Southern routes completely blocked!");
  };

  const resetAllIncidents = () => {
    setAlerts([]);
    showToast("Simulation: All active incident logs cleared and network status reset.");
  };


  if (!currentUser) {
    return <AuthPortal onLoginSuccess={(user) => {
      setCurrentUser(user);
      if (user.role === 'admin' || user.role === 'organizer') {
        setCurrentView('organizer');
      } else if (user.role === 'staff') {
        setCurrentView('staff');
      } else {
        setCurrentView('fan');
      }
    }} />;
  }

  if (!selectedStadium) {
    return <LandingPage onDeploy={handleDeployStadium} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface font-body-md selection:bg-primary selection:text-on-primary">
      {/* UNIFIED PREMIUM TOP NAVIGATION HEADER */}
      <header className="bg-surface/80 backdrop-blur-md flex flex-wrap justify-between items-center w-full px-4 md:px-margin-desktop py-4 max-w-full sticky top-0 z-[100] gap-y-2 border-b border-outline-variant/30">
        <div className="flex items-center gap-4">
          <div className="flex flex-col cursor-pointer" onClick={() => setCurrentView(currentUser?.role === 'staff' ? 'staff' : (currentUser?.role === 'organizer' || currentUser?.role === 'admin' ? 'organizer' : 'fan'))}>
            <h1 className="text-display-sm md:text-headline-md font-display-sm md:font-headline-md uppercase tracking-widest text-primary flex items-center gap-2 leading-none">
              STADIUM<span className="text-on-surface">IQ</span>
            </h1>
            {selectedStadium && (
              <span className="text-[10px] font-mono text-on-surface-variant uppercase mt-1 tracking-widest">
                {selectedStadium.stadium}
              </span>
            )}
          </div>
        </div>

        <nav className="hidden md:flex gap-4 items-center">
          <Button
            onClick={() => setCurrentView("fan")}
            variant={currentView === "fan" ? "primary" : "ghost"}
          >
            <Home className="h-4 w-4 mr-2" />
            HUB
          </Button>
          {["staff", "organizer", "admin"].includes(currentUser?.role) && (
            <Button
              onClick={() => setCurrentView("staff")}
              variant={currentView === "staff" ? "primary" : "ghost"}
            >
              <Bell className="h-4 w-4 mr-2" />
              ALERTS
            </Button>
          )}
          <Button
            onClick={() => setCurrentView("wayfinding")}
            variant={currentView === "wayfinding" ? "primary" : "ghost"}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            MAP
          </Button>
          {["organizer", "admin"].includes(currentUser?.role) && (
            <Button
              onClick={() => setCurrentView("organizer")}
              variant={currentView === "organizer" ? "primary" : "ghost"}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              DASHBOARD
            </Button>
          )}
          {currentUser?.role === "admin" && (
            <Button
              onClick={() => setShowSimulator(!showSimulator)}
              variant={showSimulator ? "danger" : "ghost"}
            >
              SIMULATOR
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden hidden sm:block">
                <div className="w-full h-full bg-surface-container flex items-center justify-center text-sm font-bold text-on-surface">
                  {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Simulation Sub-drawer */}
        {showSimulator && (
          <div className="absolute top-full left-0 w-full bg-surface-container-highest/95 border-t border-outline-variant/40 px-4 py-2.5 transition-all">
            <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[10px] font-mono text-outline uppercase tracking-wider">
                🛠️ Active Stadium Simulation Variables
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={triggerMatchEnd}
                  className="bg-error-container hover:brightness-110 text-on-error-container border border-error/20 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
                >
                  🏁 MATCH END EXODUS
                </Button>
                <Button
                  onClick={triggerWeatherEmergency}
                  className="bg-tertiary-container hover:brightness-110 text-on-tertiary-container border border-tertiary/20 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
                >
                  ⛈️ SEVERE WEATHER
                </Button>
                <Button
                  onClick={triggerVIPLockdown}
                  className="bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/40 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
                >
                  🚨 VIP LOCKDOWN
                </Button>
                <Button
                  onClick={resetAllIncidents}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant text-[10px] font-mono font-bold px-2.5 py-1.5 rounded transition-all"
                >
                  ♻️ RESET ALL
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Canvas view renderer */}
      <main className="flex-grow flex flex-col">
        <React.Suspense fallback={<div className="flex-grow flex items-center justify-center p-8"><span className="animate-pulse font-mono text-primary text-sm tracking-widest uppercase">Loading Module...</span></div>}>
        {currentView === "fan" && (
          <FanHome
            language={language}
            setLanguage={setLanguage}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            zones={zones}
            onNavigateToWayfinding={() => setCurrentView("wayfinding")}
            onNavigateToOffer={() => setCurrentView("offer")}
            onNavigateToArena={() => setCurrentView("arena")}
            onNavigateToStitch={(url) => { setStitchUrl(url); setCurrentView("stitch"); }}
            selectedStadium={selectedStadium}
          />
        )}
        {currentView === "wayfinding" && (
          <Wayfinding
            currentUser={currentUser}
            language={language}
            setLanguage={setLanguage}
            congestedZones={congestedZones}
            onSimulateCongestion={triggerVIPLockdown}
            selectedStadium={selectedStadium}
            onNavigateHome={() => setCurrentView("fan")}
          />
        )}
        {currentView === "organizer" && (
          <OrganizerDashboard
            zones={zones}
            onExecuteAdvisoryAction={handleExecuteAdvisoryAction}
            onSimulateSpill={triggerMatchEnd} // Keeping the prop name for compatibility, but triggering a dynamic event instead
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
        {currentView === "offer" && (
          <MatchDayOffer onBack={() => setCurrentView("fan")} />
        )}
        {currentView === "arena" && (
          <ArenaHome
            currentUser={currentUser}
            language={language}
            setLanguage={setLanguage}
            selectedStadium={selectedStadium}
            onNavigateHome={() => setCurrentView("fan")}
          />
        )}
        {currentView === "stitch" && (
          <div className="w-full flex-grow flex flex-col relative bg-surface">
            <div className="w-full bg-surface/80 backdrop-blur-sm border-b border-outline-variant/30 p-4 flex items-center justify-between sticky top-0 z-50">
              <Button 
                onClick={() => setCurrentView("fan")} 
                variant="ghost"
                size="sm"
                className="text-on-surface hover:text-primary transition-colors p-2"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <span className="text-label-caps font-label-caps uppercase text-primary tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                PARTNER EXPERIENCE
              </span>
              <div className="w-8"></div>
            </div>
            <iframe src={stitchUrl} className="w-full flex-grow border-0" title="Stitch Interactive View" />
          </div>
        )}
        </React.Suspense>
      </main>

      {/* Global footer */}
      <footer className="py-4 border-t-2 border-outline-variant bg-surface-container-lowest text-center text-[10px] text-on-surface-variant font-mono uppercase tracking-widest mt-auto mb-[60px] md:mb-0">
        StadiumIQ Operational Platform • Hackathon Build 1.0
      </footer>

      {/* Bottom Nav Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 md:hidden pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button
          onClick={() => setCurrentView("fan")}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-all rounded-lg p-2 ${currentView === "fan" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
        >
          <Home className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-mono tracking-widest uppercase">HUB</span>
        </button>
        {["staff", "organizer", "admin"].includes(currentUser?.role) && (
          <button
            onClick={() => setCurrentView("staff")}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-all rounded-lg p-2 ${currentView === "staff" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
          >
            <Bell className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-mono tracking-widest uppercase">ALERTS</span>
          </button>
        )}
        <button
          onClick={() => setCurrentView("wayfinding")}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-all rounded-lg p-2 ${currentView === "wayfinding" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
        >
          <MapIcon className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-mono tracking-widest uppercase">MAP</span>
        </button>
        {["organizer", "admin"].includes(currentUser?.role) && (
          <button
            onClick={() => setCurrentView("organizer")}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-all rounded-lg p-2 ${currentView === "organizer" ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
          >
            <LayoutDashboard className="h-6 w-6 mb-1" />
            <span className="text-[10px] font-mono tracking-widest uppercase">CROWD</span>
          </button>
        )}
      </nav>

      {/* High-Tech System Toast Overlay */}
      {systemToast && (
        <div
          className="fixed bottom-24 right-6 z-[9999] transition-all duration-300"
          style={{ animation: 'slideInRight 0.3s ease-out forwards' }}
        >
          <div className="bg-surface-container-highest/95 backdrop-blur-md border-l-4 border-primary text-on-surface p-4 sm:pr-8 rounded shadow-2xl flex items-center gap-4">
            <AlertCircle className="text-primary h-8 w-8 animate-pulse" />
            <div>
              <p className="text-[10px] text-primary uppercase font-mono tracking-widest font-bold mb-0.5">SYSTEM DISPATCH</p>
              <p className="text-body-sm font-body-sm font-medium leading-tight">{systemToast}</p>
            </div>
          </div>
          <style>{`
            @keyframes slideInRight {
              0% { transform: translateX(100%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Global Unified Assistant */}
      <GlobalChatBot />
    </div>
  );
}

