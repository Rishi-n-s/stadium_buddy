import React, { useState, useEffect } from "react";
import { queryCopilot, OPERATIONAL_KNOWLEDGE } from "../services/copilotEngine";
import { getAdvisories } from "../services/crowdEngine";

export default function OrganizerDashboard({
  zones,
  onExecuteAdvisoryAction,
  onSimulateSpill,
  selectedStadium
}) {
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: "user",
      text: "How many staff are near North Gate?"
    },
    {
      sender: "ai",
      text: "There are currently **42** active personnel within 100m of the North Gate. This includes 28 Security, 8 Medics, and 6 Crowd Control Officers.",
      citations: ["Record #123", "Log #A-42"]
    }
  ]);
  
  const baseCapacity = selectedStadium ? selectedStadium.capacity : 80000;
  const [totalAttendees, setTotalAttendees] = useState(() => 
    selectedStadium ? Math.round(selectedStadium.capacity * 0.925) : 74203
  );
  const [showRagInfo, setShowRagInfo] = useState(false);

  // Dynamic attendee count simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalAttendees(a => {
        const delta = Math.floor(Math.random() * 9 - 4);
        const next = a + delta;
        // Keep within 85% to 99% of base capacity
        if (next > baseCapacity * 0.99) return a - 2;
        if (next < baseCapacity * 0.85) return a + 2;
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [baseCapacity]);

  const activeAdvisories = getAdvisories(zones);

  const handleSendCopilotMessage = () => {
    if (!copilotInput.trim()) return;

    const query = copilotInput;
    const newMessages = [...copilotMessages, { sender: "user", text: query }];
    setCopilotInput("");

    // Process using simulated RAG Engine
    const result = queryCopilot(query);
    
    newMessages.push({
      sender: "ai",
      text: result.answer,
      citations: result.citations
    });

    setCopilotMessages(newMessages);
  };

  const handleGenerateReport = () => {
    alert(`Post-Event Shift Handover Summary for ${selectedStadium ? selectedStadium.stadium : "StadiumIQ Arena"} exported! (Generated via StadiumIQ AI Reporter). Check download folder.`);
  };

  const capacityPct = ((totalAttendees / baseCapacity) * 100).toFixed(0);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8">
      {/* Top Header bar */}
      <header className="flex justify-between items-center pb-6 border-b border-outline-variant/30 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCijkT4EJ7_JaheOUBrU0P3miW5VFbD_1S5NlI2Vnnj_y1n7DWzdwMdfrerTFyweotPzQ--Qxv7wDDaM_BA1S_Dgz9VaicOsthMgUf6zYoS8NfHP82a9cRDzHGT8d-G06nQCcyiKqNGz4ariOEG8YgHB4RmZpVdlwgIaUMaLnXcWbIQTr1x93ht6mhFkj3OUyKk6MoTvCtiNx5CezkS738dWW5Eht9L_g9P6KSULfQrx8Q1Gj1cBMC9BA"
              alt="Manager Avatar"
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-primary-light">
              StadiumIQ — {selectedStadium ? selectedStadium.ioc : "OPS"}
            </h1>
            <p className="text-[10px] text-on-surface-variant font-mono uppercase">
              {selectedStadium ? selectedStadium.stadium : "Control Room Operator"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-highest px-3 py-1.5 rounded-full border border-outline-variant">
          <span className="material-symbols-outlined text-secondary text-sm animate-pulse">circle</span>
          <span className="font-mono text-xs font-bold text-on-surface">LIVE TELEMETRY: EN</span>
        </div>
      </header>

      {/* Operations Dashboard Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-on-surface mb-2">
            {selectedStadium ? `${selectedStadium.stadium} Command` : "Live Operations Overview"}
          </h2>
          <div className="flex gap-4">

            <span className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span className="font-mono text-xs font-bold text-on-surface">{totalAttendees.toLocaleString()} ATTENDEES</span>
            </span>
            <span className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span className="font-mono text-xs font-bold text-on-surface">{capacityPct}% CAPACITY</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateReport}
            className="bg-primary-container text-white px-4 py-2 font-mono text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            GENERATE REPORT
          </button>
          <button 
            onClick={onSimulateSpill}
            className="border border-error/50 text-error px-4 py-2 font-mono text-xs font-bold rounded-lg hover:bg-error/10 active:scale-95 transition-all"
          >
            SIMULATE EMERGENCY SPILL
          </button>
        </div>
      </div>

      {/* Bento Grid: Stadium Zones */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Zone A: Major Congestion Container */}
        <div className="md:col-span-8 bg-surface-container border border-primary/10 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-mono text-xs font-bold text-primary-light tracking-widest mb-1">ZONE NORTH GATE</h3>
                <p className="text-xl font-bold">High Congestion Warning</p>
              </div>
              <span className="material-symbols-outlined text-error animate-pulse text-2xl">error</span>
            </div>
            
            <div className="mt-8 flex flex-col md:flex-row gap-8 items-end justify-between">
              <div>
                <p className="font-mono text-[10px] text-on-surface-variant uppercase">CURRENT OCCUPANCY</p>
                <p className="text-4xl font-black text-primary-light">
                  {((zones.north_gate.current / zones.north_gate.capacity) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-on-surface-variant font-mono mt-1">
                  ({zones.north_gate.current.toLocaleString()} / {zones.north_gate.capacity.toLocaleString()})
                </p>
              </div>
              
              <div className="flex-grow max-w-sm h-28 w-full">
                {/* Simulated Sparkline chart */}
                <div className="flex items-end justify-between h-full w-full gap-1">
                  <div className="bg-primary/20 w-full h-[30%] rounded-sm"></div>
                  <div className="bg-primary/20 w-full h-[40%] rounded-sm"></div>
                  <div className="bg-primary/30 w-full h-[55%] rounded-sm"></div>
                  <div className="bg-primary/40 w-full h-[50%] rounded-sm"></div>
                  <div className="bg-primary/50 w-full h-[70%] rounded-sm"></div>
                  <div className="bg-primary/70 w-full h-[85%] rounded-sm animate-pulse"></div>
                  <div className="bg-primary-container w-full h-[98%] rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone B: Secondary status card */}
        <div className="md:col-span-4 bg-surface-container border border-outline-variant/60 rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-5">
              {zones.east_stand.name}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2 text-sm">
                <span className="text-on-surface-variant">Capacity</span>
                <span className="font-mono font-bold">{zones.east_stand.capacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2 text-sm">
                <span className="text-on-surface-variant">Current Occupancy</span>
                <span className="font-mono font-bold">{zones.east_stand.current.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Trend</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${zones.east_stand.trend > 0 ? 'text-secondary' : 'text-primary'}`}>
                  <span className="material-symbols-outlined text-xs">
                    {zones.east_stand.trend > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  {zones.east_stand.trend > 0 ? `+${zones.east_stand.trend.toFixed(0)}% (5m)` : `${zones.east_stand.trend.toFixed(0)}% (5m)`}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onExecuteAdvisoryAction("adv-2")}
            className="w-full py-2.5 bg-surface-container-highest border border-outline-variant text-on-surface rounded-lg font-mono text-xs font-bold hover:bg-primary-container hover:text-white transition-all active:scale-95"
          >
            MANAGE TURNSTILES
          </button>
        </div>
      </div>

      {/* Small metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-5 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 bg-tertiary-container/20 rounded-lg flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-2xl">fastfood</span>
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">CONCESSIONS STATUS</p>
            <p className="text-lg font-bold">Optimal (3m Avg Wait)</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-5 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center text-primary-light">
            <span className="material-symbols-outlined text-2xl">local_police</span>
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">STAFF ON DUTY</p>
            <p className="text-lg font-bold">1,420 Personnel Check-In</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container border border-outline-variant/50 rounded-xl p-5 flex items-center gap-4 shadow-md">
          <div className="w-12 h-12 bg-secondary-container/20 rounded-lg flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl">network_check</span>
          </div>
          <div>
            <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">WIFI MESH INTEGRITY</p>
            <p className="text-lg font-bold">99.8% Connectivity</p>
          </div>
        </div>
      </div>

      {/* Copilot and Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Decision Support Copilot Chat */}
        <div className="lg:col-span-8 ai-glass rounded-xl p-5 flex flex-col h-[420px] bg-surface-container-low border border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">Decision Support Copilot</h3>
            </div>
            
            <button 
              onClick={() => setShowRagInfo(!showRagInfo)}
              className="text-[10px] font-mono text-primary-light bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50 hover:bg-surface-variant transition-all"
            >
              {showRagInfo ? "HIDE CORPUS" : "VIEW RAG CORPUS"}
            </button>
          </div>

          {/* RAG corpus inspect box */}
          {showRagInfo && (
            <div className="mb-3 p-3 bg-surface-container-highest border border-outline-variant/60 rounded-lg max-h-32 overflow-y-auto text-[10px] font-mono space-y-1">
              <p className="text-secondary font-bold mb-1">CITED CORPUS DATA SOURCE:</p>
              {OPERATIONAL_KNOWLEDGE.map(k => (
                <div key={k.id} className="border-b border-outline-variant/30 pb-1 last:border-b-0">
                  <span className="text-primary-light font-bold">[{k.id}] {k.title}: </span>
                  <span className="text-on-surface-variant">{k.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4">
            {copilotMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2.5 rounded-xl max-w-[80%] text-sm ${
                  msg.sender === "user" 
                    ? "bg-primary-container text-white rounded-tr-none" 
                    : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant"
                }`}>
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Citations List */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {msg.citations.map((cite) => (
                        <span 
                          key={cite} 
                          className="font-mono text-[9px] bg-background px-2 py-0.5 rounded border border-outline-variant text-primary-light"
                          title={OPERATIONAL_KNOWLEDGE.find(k => k.id === cite)?.content || ""}
                        >
                          [{cite}]
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input bar */}
          <div className="flex gap-2 p-2 bg-surface-dim rounded-lg border border-outline-variant/80 focus-within:border-primary-light transition-colors">
            <input 
              type="text" 
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCopilotMessage()}
              placeholder="Ask AI about staff counts, incidents, Wi-Fi mesh..."
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm text-on-surface px-2 focus:outline-none"
            />
            <button 
              onClick={() => handleSendCopilotMessage()}
              className="w-9 h-9 bg-primary-container hover:brightness-110 text-white rounded flex items-center justify-center transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm font-bold">send</span>
            </button>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Active Advisories Box */}
          <div className="p-5 border-2 border-primary-container/60 rounded-xl bg-surface-container-high relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <span className="material-symbols-outlined text-3xl text-primary-light">auto_awesome</span>
            </div>
            
            <h3 className="font-mono text-xs font-bold text-primary-light uppercase tracking-wider mb-3">AI Insights & Advisories</h3>
            
            {activeAdvisories.length > 0 ? (
              <div className="space-y-4">
                {activeAdvisories.map((adv) => (
                  <div key={adv.id} className="border-b border-outline-variant/30 pb-3 last:border-b-0 last:pb-0">
                    <p className={`font-mono text-[10px] font-bold mb-1 ${adv.severity === "CRITICAL" ? "text-error" : "text-tertiary"}`}>
                      {adv.severity} ALERT
                    </p>
                    <p className="text-sm text-on-surface mb-3 leading-snug">{adv.text}</p>
                    <button 
                      onClick={() => onExecuteAdvisoryAction(adv.id)}
                      className="w-full py-2 bg-secondary text-on-secondary hover:brightness-110 rounded font-mono text-xs font-bold transition-all active:scale-95"
                    >
                      {adv.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant italic">All stadium operations running optimal. No alerts active.</p>
            )}
          </div>

          {/* Upcoming Schedule Card */}
          <div className="p-5 border border-outline-variant rounded-xl bg-surface-container-low opacity-90 shadow-md">
            <h3 className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">UPCOMING EVENT LOG</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">schedule</span>
                <div>
                  <p className="text-sm font-bold">VIP Arrival: Team Bus</p>
                  <p className="text-[11px] text-on-surface-variant">Scheduled in 14 mins | Routing via Gate 3B</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">cloud</span>
                <div>
                  <p className="text-sm font-bold">Rain Front Approaching</p>
                  <p className="text-[11px] text-on-surface-variant">ETA: 45 mins | Intensity: Light | Dynamic roof closing scheduled</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
