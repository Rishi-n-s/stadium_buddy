import React, { useState, useEffect } from "react";
import { findShortestPath, generateDirections, VENUE_NODES } from "../services/navigationEngine";
import { LANGUAGES, translate, getDir } from "../services/translationEngine";
import Map from "../components/ui/Map";
import LocationConsentModal from "../components/ui/LocationConsentModal";
import { hasLocationConsent } from "../services/locationBroadcast";
import Button from '../components/ui/Button';

// Map relative coordinates to percentage values for SVG overlay
const MAP_COORDS = {
  gate_4: { x: 20, y: 78 },
  gate_5: { x: 49, y: 26 },
  section_102: { x: 36, y: 55 },
  section_c: { x: 73, y: 44 },
  restroom_north: { x: 48, y: 38 },
  restroom_east: { x: 84, y: 62 },
  titan_snacks: { x: 39, y: 34 },
  merchandise_stand: { x: 60, y: 55 },
  medical_bay: { x: 25, y: 62 }
};

export default function Wayfinding(props) {
  const {
    currentUser,
    language,
    setLanguage,
    congestedZones = [],
    onSimulateCongestion,
    selectedStadium,
    onNavigateHome
  } = props || {};
  const dir = getDir(language);
  const [startNode, setStartNode] = useState("section_102");
  const [endNode, setEndNode] = useState("gate_4");
  const [mapMode, setMapMode] = useState("indoor"); // "indoor" or "outdoor"
  const [showConsent, setShowConsent] = useState(!hasLocationConsent());
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "user",
      text: "Where is the nearest exit?"
    },
    {
      sender: "ai",
      text: "Nearest exit is Gate 4. Here are your step-by-step directions:",
      steps: [
        "Turn right at Section 102 and head towards the North concourse.",
        "Pass the merchandise stand and continue straight for 50 meters.",
        "Gate 4 will be on your left, past the security checkpoint."
      ]
    }
  ]);
  const [zoom, setZoom] = useState(100);

  // Calculate current path
  const routingResult = findShortestPath(startNode, endNode, congestedZones);
  const path = routingResult ? routingResult.path : [];
  const directions = routingResult ? generateDirections(path, congestedZones) : [];

  // Update AI Chat when endNode changes
  useEffect(() => {
    if (startNode && endNode) {
      const startName = VENUE_NODES[startNode]?.name;
      const endName = VENUE_NODES[endNode]?.name;
      const actionText = `How do I get to ${endName} from ${startName}?`;
      
      const newMessages = [
        ...chatMessages,
        { sender: "user", text: actionText }
      ];

      const aiText = `To get to **${endName}** from **${startName}**, follow this route:`;
      const routeSteps = generateDirections(path, congestedZones);
      
      newMessages.push({
        sender: "ai",
        text: aiText,
        steps: routeSteps
      });

      setChatMessages(newMessages);
    }
  }, [endNode]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newMessages = [...chatMessages, { sender: "user", text }];
    setChatInput("");

    // Simulate AI understanding destinations
    const lowerText = text.toLowerCase();
    let detectedEnd = null;

    if (lowerText.includes("exit") || lowerText.includes("gate 4") || lowerText.includes("out")) {
      detectedEnd = "gate_4";
    } else if (lowerText.includes("north gate") || lowerText.includes("gate 5")) {
      detectedEnd = "gate_5";
    } else if (lowerText.includes("snack") || lowerText.includes("food") || lowerText.includes("titan")) {
      detectedEnd = "titan_snacks";
    } else if (lowerText.includes("merchandise") || lowerText.includes("shop") || lowerText.includes("store")) {
      detectedEnd = "merchandise_stand";
    } else if (lowerText.includes("restroom") || lowerText.includes("toilet") || lowerText.includes("washroom")) {
      if (lowerText.includes("accessible") || lowerText.includes("north")) {
        detectedEnd = "restroom_north";
      } else {
        detectedEnd = "restroom_east";
      }
    } else if (lowerText.includes("medical") || lowerText.includes("doctor") || lowerText.includes("clinic")) {
      detectedEnd = "medical_bay";
    } else if (lowerText.includes("seat") || lowerText.includes("section 102")) {
      detectedEnd = "section_102";
    } else if (lowerText.includes("section c") || lowerText.includes("east")) {
      detectedEnd = "section_c";
    }

    if (detectedEnd) {
      setEndNode(detectedEnd);
    } else {
      newMessages.push({
        sender: "ai",
        text: "I can guide you anywhere in the stadium! Ask me about Restrooms, Concessions, medical aid, or nearest Gates.",
        steps: []
      });
      setChatMessages(newMessages);
    }
  };

  const handleQuickPrompt = (topic) => {
    if (topic === "Food & Drink") {
      handleSendMessage("Where is the nearest food stall?");
    } else if (topic === "My Seat") {
      handleSendMessage("Guide me to Section 102");
    } else if (topic === "Restrooms") {
      handleSendMessage("Where is the nearest accessible restroom?");
    }
  };

  return (
    <div dir={dir} className="w-full max-w-[1440px] mx-auto p-4 md:p-8">
      {/* Top Header */}
        <header className="flex justify-between items-center pb-6 border-b border-outline-variant/30 mb-6">
          <div className="flex items-center gap-3">
            <Button onClick={onNavigateHome} className="material-symbols-outlined hover:bg-surface-bright transition-colors p-2" title="Back to Hub">
              arrow_back
            </Button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high">
              <span className="material-symbols-outlined text-primary text-xl flex items-center justify-center h-full">explore</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-primary">StadiumIQ</h1>
              <p className="text-[10px] text-on-surface-variant font-mono uppercase tracking-widest">
                {selectedStadium ? selectedStadium.stadium : "AI Wayfinding"}
              </p>
            </div>
          </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-surface-container-highest border border-outline/30 text-on-surface text-xs rounded-lg px-2 py-1.5 focus:outline-none"
          >
            {Object.values(LANGUAGES).map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Real-time Advisory Banner */}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-primary/20 bg-surface-container-low shadow-lg glass-overlay mechanical-border">
        {routingResult?.isRerouted && (
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-[pulse_3s_infinite]" />
        )}
        <div className="relative z-10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${routingResult?.isRerouted ? 'bg-secondary animate-pulse shadow-[0_0_8px_#4ae176]' : 'bg-primary'}`} />
            <span className="text-sm font-medium">
              {routingResult?.isRerouted 
                ? translate("Venue B is congested, rerouting via North Concourse.", language)
                : translate("Route search active. Adjust destination to bypass obstacles.", language)}
            </span>
          </div>
        </div>
      </div>

      {/* === MOBILE: Controls stacked above/below map === */}
      {/* Indoor/Outdoor Mode Switcher — always above map */}
      <div className="flex gap-1.5 bg-surface-container/95 border border-outline-variant/60 p-1.5 rounded-lg backdrop-blur-md shadow-md mb-2 lg:hidden mechanical-border">
          <Button
            onClick={() => setMapMode("indoor")}
            className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
              mapMode === "indoor"
                ? "bg-primary-container text-white shadow-sm tactile-button"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            🏢 Indoor Map
          </Button>
          <Button
            onClick={() => setMapMode("outdoor")}
            className={`flex-1 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 ${
              mapMode === "outdoor"
                ? "bg-secondary-container text-white shadow-sm tactile-button"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            🌐 Outdoor GPS
          </Button>
        </div>

        {/* Route selector (mobile) — above map, compact */}
        {mapMode === "indoor" && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-gray-300 shadow-md text-gray-800 mb-2 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1a73e8] flex-shrink-0" />
              <span className="text-[9px] text-gray-500 font-mono">FROM:</span>
              <select
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
                className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-bold text-gray-800 cursor-pointer focus:outline-none"
              >
                {Object.keys(VENUE_NODES).map(key => (
                  <option key={key} value={key} className="bg-white">{VENUE_NODES[key].name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ea4335] flex-shrink-0" />
              <span className="text-[9px] text-gray-500 font-mono">TO:</span>
              <select
                value={endNode}
                onChange={(e) => setEndNode(e.target.value)}
                className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-bold text-gray-800 cursor-pointer focus:outline-none"
              >
                {Object.keys(VENUE_NODES).map(key => (
                  <option key={key} value={key} className="bg-white">{VENUE_NODES[key].name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Map container — clean, no internal overlays on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-xl overflow-hidden glass-overlay mechanical-border h-[50vh] md:h-[60vh] min-h-[400px] relative group bg-surface-container-low">
          
          {/* Indoor/Outdoor switcher — desktop only, inside map */}
          <div className="hidden lg:flex absolute top-4 left-4 z-30 gap-1.5 bg-surface-container/95 border border-outline-variant/60 p-1.5 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto mechanical-border">
            <Button
              onClick={() => setMapMode("indoor")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
                mapMode === "indoor"
                  ? "bg-primary-container text-white shadow-sm tactile-button"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              🏢 Indoor Map
            </Button>
            <Button
              onClick={() => setMapMode("outdoor")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                mapMode === "outdoor"
                  ? "bg-secondary-container text-white shadow-sm tactile-button"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              🌐 Outdoor GPS Tracker
            </Button>
          </div>

          {mapMode === "indoor" ? (
            <div className="absolute inset-0 z-0 bg-surface-container-lowest">
              <Map 
                currentUser={currentUser}
                isIndoor={true}
                selectedStadium={selectedStadium}
                startNode={startNode}
                endNode={endNode}
                path={path}
                congestedZones={congestedZones}
                onNodeSelect={setEndNode}
                directions={directions}
              />
              
              {/* Route Switcher — desktop only, inside map */}
              <div className="hidden lg:block absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-300 max-w-xs shadow-lg text-gray-800">
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]" />
                    <span className="text-[10px] text-gray-500 font-mono">FROM:</span>
                    <select 
                      value={startNode} 
                      onChange={(e) => setStartNode(e.target.value)} 
                      className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      {Object.keys(VENUE_NODES).map(key => (
                        <option key={key} value={key} className="bg-white">{VENUE_NODES[key].name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea4335]" />
                    <span className="text-[10px] text-gray-500 font-mono">TO:</span>
                    <select 
                      value={endNode} 
                      onChange={(e) => setEndNode(e.target.value)} 
                      className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold text-gray-800 cursor-pointer focus:outline-none"
                    >
                      {Object.keys(VENUE_NODES).map(key => (
                        <option key={key} value={key} className="bg-white">{VENUE_NODES[key].name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-surface-container-lowest">
              <Map 
                currentUser={currentUser}
                selectedStadium={selectedStadium} 
                darkMode={true} 
                startNode={startNode}
                endNode={endNode}
                path={path}
                congestedZones={congestedZones}
                directions={directions}
              />
            </div>
          )}
        </div>
        {/* Chat & Directions (Bento Side) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          

          {/* Quick Metrics Widget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-overlay mechanical-border p-4 rounded-xl">
              <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase tracking-wider">
                {translate("CONGESTION", language)}
              </span>
              <div className="flex items-end gap-1.5">
                <span className={`text-lg font-bold ${congestedZones.length > 0 ? "text-error" : "text-secondary"}`}>
                  {congestedZones.length > 0 ? translate("HIGH", language) : "LOW"}
                </span>
                <span className="text-[10px] font-mono text-outline mb-0.5">
                  {congestedZones.length > 0 ? VENUE_NODES[congestedZones[0]]?.name || "Zone B" : "Clear"}
                </span>
              </div>
            </div>
            <div className="glass-overlay mechanical-border p-4 rounded-xl">
              <span className="font-mono text-[10px] text-on-surface-variant block mb-1 uppercase tracking-wider">
                {translate("ETA TO EXIT", language)}
              </span>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-bold text-secondary">
                  {routingResult ? `${Math.round(routingResult.totalDistance / 20)} MIN` : "0 MIN"}
                </span>
                <span className="text-[10px] font-mono text-secondary/60 mb-0.5">
                  {translate("Active", language)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {showConsent && (
        <LocationConsentModal 
          onConsent={() => setShowConsent(false)}
          onDecline={() => setShowConsent(false)} 
        />
      )}
    </div>
  );
}
