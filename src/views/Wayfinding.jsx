import React, { useState, useEffect } from "react";
import { findShortestPath, generateDirections, VENUE_NODES } from "../services/navigationEngine";
import { translate, getDir } from "../services/translationEngine";
import Map from "../components/ui/Map";


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

export default function Wayfinding({
  language,
  setLanguage,
  congestedZones = [],
  onSimulateCongestion,
  selectedStadium
}) {
  const dir = getDir(language);
  const [startNode, setStartNode] = useState("section_102");
  const [endNode, setEndNode] = useState("gate_4");
  const [mapMode, setMapMode] = useState("indoor"); // "indoor" or "outdoor"
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
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-surface-container-high">
            <span className="material-symbols-outlined text-primary text-xl flex items-center justify-center h-full">explore</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary-light">StadiumIQ</h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">
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
            <option value="en">EN</option>
            <option value="ar">AR</option>
            <option value="ur">UR</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
          </select>
        </div>
      </header>

      {/* Real-time Advisory Banner */}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-primary/20 bg-surface-container-low shadow-lg">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Map View (Bento Large) */}
        <div className="lg:col-span-8 rounded-xl overflow-hidden glass-panel h-[400px] md:h-[600px] relative group border border-outline-variant bg-surface-container-low flex flex-col justify-end">
          
          {/* Map mode switcher overlay */}
          <div className="absolute top-4 left-4 z-30 flex gap-1.5 bg-surface-container/95 border border-outline-variant/60 p-1.5 rounded-lg backdrop-blur-md shadow-lg pointer-events-auto">
            <button
              onClick={() => setMapMode("indoor")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all ${
                mapMode === "indoor"
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              🏢 Indoor Map
            </button>
            <button
              onClick={() => setMapMode("outdoor")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                mapMode === "outdoor"
                  ? "bg-secondary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              🌐 Outdoor GPS Tracker
            </button>
          </div>

          {mapMode === "indoor" ? (
            <div className="absolute inset-0 z-0 bg-surface-container-lowest">
              <Map 
                isIndoor={true}
                selectedStadium={selectedStadium}
                startNode={startNode}
                endNode={endNode}
                path={path}
                congestedZones={congestedZones}
                onNodeSelect={setEndNode}
                directions={directions}
              />
              
              {/* Quick Route Switcher (Bottom of Map) */}
              <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-300 max-w-xs shadow-lg text-gray-800">
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
          
          {/* AI Chat Box */}
          <div className="flex-grow glass-panel rounded-xl flex flex-col overflow-hidden border border-outline-variant h-[430px] bg-surface-container-low">
            <div className="p-4 border-b border-outline-variant bg-surface-container flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
              <span className="text-sm font-bold text-primary-light">
                {translate("Fan Assistant", language)}
              </span>
            </div>
            
            {/* Messages Thread */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "self-end" : "self-start"}`}
                >
                  {msg.sender === "ai" && (
                    <span className="text-[10px] text-primary font-mono mb-1">{translate("AI Navigator", language)}</span>
                  )}
                  
                  <div className={`p-3 rounded-xl ${
                    msg.sender === "user" 
                      ? "bg-primary-container text-white rounded-tr-none" 
                      : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant"
                  }`}>
                    <p className="text-sm leading-relaxed">{translate(msg.text, language)}</p>
                    
                    {/* Navigation Steps */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-outline-variant/40 pt-2 text-xs">
                        {msg.steps.map((step, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start">
                            <span className="w-4 h-4 rounded-full bg-primary text-on-primary-fixed font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-[11px] text-on-surface/90">{translate(step, language)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-surface-container-low border-t border-outline-variant">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full bg-surface-container-highest border border-outline/30 focus:border-primary-light focus:ring-0 px-4 py-2.5 pr-10 rounded-lg text-xs transition-all text-on-surface focus:outline-none"
                  placeholder={translate("Type or ask by voice...", language)}
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="absolute right-2 text-primary hover:text-secondary transition-colors p-2"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {["Food & Drink", "My Seat", "Restrooms"].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleQuickPrompt(topic)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full border border-outline-variant/60 text-[9px] font-mono hover:bg-surface-variant text-on-surface-variant transition-all hover:text-on-surface"
                  >
                    {translate(topic, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Widget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-outline-variant bg-surface-container-low">
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
            <div className="glass-panel p-4 rounded-xl border border-outline-variant bg-surface-container-low">
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
    </div>
  );
}
