import React, { useState, useEffect } from "react";
import { queryCopilot, OPERATIONAL_KNOWLEDGE } from "../services/copilotEngine";
import { getAdvisories } from "../services/crowdEngine";
import Map from "../components/ui/Map";
import WeatherWidget from "../components/ui/WeatherWidget";

import Button from '../components/ui/Button';

export default function OrganizerDashboard(props) {
  const {
    zones,
    onExecuteAdvisoryAction,
    onSimulateSpill,
    selectedStadium
  } = props || {};

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
  const [liveUsers, setLiveUsers] = useState(new Map());
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [showRagInfo, setShowRagInfo] = useState(false);

  // Subscribe to real-time live GPS users
  useEffect(() => {
    let unsubscribe = null;
    import("../services/locationBroadcast").then(module => {
      unsubscribe = module.subscribeToUsers((usersMap) => {
        setLiveUsers(usersMap);
        setTotalAttendees(usersMap.size);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Compute "True Data" for zones based on live users.
  const liveZoneNorth = Math.floor(totalAttendees * 0.4);
  const liveZoneEast = totalAttendees - liveZoneNorth;

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
    <div className="w-full max-w-7xl mx-auto p-4 md:px-gutter mt-8 space-y-12 pb-24 min-h-screen">
      {/* Top Header bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high mechanical-border p-1 glass-overlay flex items-center justify-center overflow-hidden">
            <img 
              className="w-full h-full object-cover rounded-lg" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCijkT4EJ7_JaheOUBrU0P3miW5VFbD_1S5NlI2Vnnj_y1n7DWzdwMdfrerTFyweotPzQ--Qxv7wDDaM_BA1S_Dgz9VaicOsthMgUf6zYoS8NfHP82a9cRDzHGT8d-G06nQCcyiKqNGz4ariOEG8YgHB4RmZpVdlwgIaUMaLnXcWbIQTr1x93ht6mhFkj3OUyKk6MoTvCtiNx5CezkS738dWW5Eht9L_g9P6KSULfQrx8Q1Gj1cBMC9BA"
              alt="Manager Avatar"
            />
          </div>
          <div>
            <h1 className="text-display-md font-display-md uppercase italic text-on-surface">
              StadiumIQ — {selectedStadium ? selectedStadium.ioc : "OPS"}
            </h1>
            <p className="text-label-caps font-label-caps text-on-surface-variant">
              {selectedStadium ? selectedStadium.stadium : "Control Room Operator"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-secondary-fixed/20 border border-secondary-fixed px-4 py-2 rounded-full shadow-[0_0_10px_rgba(183,196,255,0.2)]">
          <span className="w-2 h-2 bg-secondary-fixed rounded-full animate-pulse shadow-[0_0_5px_#b7c4ff]"></span>
          <span className="text-label-caps font-label-caps text-secondary-fixed">LIVE TELEMETRY: EN</span>
        </div>
      </header>

      {/* Operations Dashboard Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-headline-md font-headline-md uppercase italic text-on-surface mb-4">
            {selectedStadium ? `${selectedStadium.stadium} Command` : "Live Operations Overview"}
          </h2>
          <div className="flex gap-4 flex-wrap">
            <div className="glass-overlay rounded-lg mechanical-border px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></span>
              <span className="text-label-caps font-label-caps text-on-surface">{totalAttendees.toLocaleString()} ATTENDEES</span>
            </div>
            <div className="glass-overlay rounded-lg mechanical-border px-4 py-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#0047fa]"></span>
              <span className="text-label-caps font-label-caps text-on-surface">{capacityPct}% CAPACITY</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <WeatherWidget city={selectedStadium ? selectedStadium.city : 'London'} />
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleGenerateReport}
              className="bg-primary-container text-white px-6 py-2 text-label-caps font-label-caps rounded-lg tactile-button hover:bg-primary-container/80 transition-all h-full"
            >
              GENERATE REPORT
            </Button>
            <Button 
              onClick={onSimulateSpill}
              className="bg-error text-on-error px-6 py-2 text-label-caps font-label-caps rounded-lg tactile-button hover:bg-error/80 transition-all h-full"
            >
              SIMULATE EMERGENCY SPILL
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid: Stadium Zones */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        {/* Zone A: Major Congestion Container */}
        <div className="md:col-span-8 glass-overlay rounded-2xl mechanical-border p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-error/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="bg-error/20 border border-error px-4 py-1 rounded-md flex items-center gap-2 mb-4">
                <span className="text-label-caps font-label-caps text-error">ZONE NORTH GATE</span>
              </div>
              <span className="material-symbols-outlined text-error animate-pulse text-4xl">error</span>
            </div>
            <h3 className="text-headline-lg font-headline-lg italic uppercase mt-2">High Congestion Warning</h3>
            
            <div className="mt-8 flex flex-col md:flex-row gap-8 items-end justify-between">
              <div>
                <p className="text-label-caps font-label-caps text-on-surface-variant">CURRENT OCCUPANCY</p>
                <p className="text-display-xl font-display-xl text-primary mt-2">
                  {((liveZoneNorth / zones.north_gate.capacity) * 100).toFixed(1)}%
                </p>
                <p className="text-body-lg font-body-lg text-on-surface-variant mt-2 font-mono">
                  ({liveZoneNorth.toLocaleString()} / {zones.north_gate.capacity.toLocaleString()})
                </p>
              </div>
              
              <div className="flex-grow max-w-sm h-32 w-full border-b border-outline-variant/30 border-l pl-2 pb-2">
                {/* Simulated Sparkline chart */}
                <div className="flex items-end justify-between h-full w-full gap-2">
                  <div className="bg-primary/60 rounded-t-sm w-full h-[30%]"></div>
                  <div className="bg-primary/60 rounded-t-sm w-full h-[40%]"></div>
                  <div className="bg-primary/60 rounded-t-sm w-full h-[55%]"></div>
                  <div className="bg-primary/60 rounded-t-sm w-full h-[50%]"></div>
                  <div className="bg-error/60 rounded-t-sm w-full h-[70%] shadow-[0_0_8px_rgba(255,84,73,0.4)]"></div>
                  <div className="bg-error rounded-t-sm w-full h-[85%] animate-pulse shadow-[0_0_12px_rgba(255,84,73,0.6)]"></div>
                  <div className="bg-error/80 rounded-t-sm w-full h-[98%] shadow-[0_0_10px_rgba(255,84,73,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone B: Secondary status card */}
        <div className="md:col-span-4 glass-overlay rounded-2xl mechanical-border p-6 flex flex-col justify-between">
          <div>
            <div className="bg-surface-variant/50 border border-outline-variant px-4 py-1 rounded-md mb-6 w-fit">
               <span className="text-label-caps font-label-caps text-on-surface uppercase">
                 {zones.east_stand.name}
               </span>
            </div>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="text-on-surface-variant text-label-caps font-label-caps">CAPACITY</span>
                <span className="font-bold text-on-surface">{zones.east_stand.capacity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                <span className="text-on-surface-variant text-label-caps font-label-caps">CURRENT</span>
                <span className="font-bold text-on-surface">{liveZoneEast.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-on-surface-variant text-label-caps font-label-caps">TREND</span>
                <span className={`font-bold flex items-center gap-1 ${zones.east_stand.trend > 0 ? 'text-secondary-fixed' : 'text-primary'}`}>
                  <span className="material-symbols-outlined text-sm">
                    {zones.east_stand.trend > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  {zones.east_stand.trend > 0 ? `+${zones.east_stand.trend.toFixed(0)}% (5m)` : `${zones.east_stand.trend.toFixed(0)}% (5m)`}
                </span>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => onExecuteAdvisoryAction("adv-2")}
            className="w-full mt-6 py-3 bg-primary-container text-white rounded-lg font-label-caps text-label-caps tactile-button hover:bg-primary-container/80 transition-all"
          >
            MANAGE TURNSTILES
          </Button>
        </div>
      </div>

      {/* Small metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="glass-overlay rounded-xl mechanical-border p-5 flex items-center gap-6">
          <div className="w-14 h-14 bg-secondary-fixed/20 border border-secondary-fixed rounded-lg flex items-center justify-center text-secondary-fixed">
            <span className="material-symbols-outlined text-3xl">fastfood</span>
          </div>
          <div>
            <p className="text-label-caps font-label-caps text-on-surface-variant mb-1">CONCESSIONS STATUS</p>
            <p className="text-headline-sm font-headline-sm uppercase text-secondary-fixed">Optimal (3m Avg)</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-overlay rounded-xl mechanical-border p-5 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/20 border border-primary rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">local_police</span>
          </div>
          <div>
            <p className="text-label-caps font-label-caps text-on-surface-variant mb-1">STAFF ON DUTY</p>
            <p className="text-headline-sm font-headline-sm uppercase text-primary">1,420 Active</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-overlay rounded-xl mechanical-border p-5 flex items-center gap-6">
          <div className="w-14 h-14 bg-tertiary/20 border border-tertiary rounded-lg flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-3xl">network_check</span>
          </div>
          <div>
            <p className="text-label-caps font-label-caps text-on-surface-variant mb-1">WIFI MESH INTEGRITY</p>
            <p className="text-headline-sm font-headline-sm uppercase text-tertiary">99.8% Online</p>
          </div>
        </div>
      </div>

      {/* Copilot and Insights Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Decision Support Copilot Chat */}
        <div className="lg:col-span-8 glass-overlay rounded-2xl mechanical-border p-6 flex flex-col h-[70vh] min-h-[400px] lg:h-[600px] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-9xl">smart_toy</span>
           </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-primary/20 text-primary border border-primary px-4 py-2 rounded-md flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              <h3 className="text-label-caps font-label-caps">COPILOT OS</h3>
            </div>
            
            <Button 
              onClick={() => setShowRagInfo(!showRagInfo)}
              className="text-label-caps font-label-caps bg-surface-variant/50 border border-outline-variant px-4 py-1 rounded-md hover:bg-surface-variant transition-all"
            >
              {showRagInfo ? "HIDE CORPUS" : "VIEW RAG CORPUS"}
            </Button>
          </div>

          {/* RAG corpus inspect box */}
          {showRagInfo && (
            <div className="mb-4 p-4 bg-surface-container-highest/50 rounded-lg border border-outline-variant max-h-32 overflow-y-auto text-body-sm font-mono space-y-2">
              <p className="text-secondary-fixed font-bold bg-black w-fit px-2 py-0.5 rounded-sm">CITED CORPUS DATA SOURCE:</p>
              {OPERATIONAL_KNOWLEDGE.map(k => (
                <div key={k.id} className="border-b border-outline-variant/30 pb-2 last:border-b-0">
                  <span className="text-primary font-bold">[{k.id}] {k.title}: </span>
                  <span className="text-on-surface-variant">{k.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 z-10">
            {copilotMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-3 max-w-[80%] rounded-xl ${
                  msg.sender === "user" 
                    ? "bg-primary-container text-white" 
                    : "bg-surface-container-high text-on-surface border border-outline-variant/50"
                }`}>
                  <p className={`text-body-md`}>{msg.text}</p>
                  
                  {/* Citations List */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {msg.citations.map((cite) => (
                         <span 
                         key={cite} 
                         className="font-mono text-[10px] bg-black text-secondary-fixed px-2 py-1 rounded font-bold"
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
          <div className="flex gap-4 relative z-10 mt-auto">
            <input 
              type="text" 
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCopilotMessage()}
              placeholder="QUERY SYSTEM KNOWLEDGE..."
              className="flex-grow bg-surface-container-highest/50 border border-outline-variant p-3 rounded-lg text-label-caps font-label-caps focus:outline-none focus:border-primary transition-colors text-on-surface"
            />
            <Button 
              onClick={() => handleSendCopilotMessage()}
              className="bg-primary-container text-white px-6 rounded-lg tactile-button hover:bg-primary-container/80 transition-all flex items-center justify-center"
            >
              <span className="material-symbols-outlined">send</span>
            </Button>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Active Advisories Box */}
          <div className="p-6 glass-overlay rounded-2xl mechanical-border relative overflow-hidden">
            <div className="bg-primary-container text-white px-4 py-1 rounded-md w-fit flex items-center gap-2 mb-6">
               <span className="material-symbols-outlined text-sm">warning</span>
               <span className="text-label-caps font-label-caps">ADVISORIES</span>
            </div>
            
            {activeAdvisories.length > 0 ? (
              <div className="space-y-6">
                {activeAdvisories.map((adv) => (
                  <div key={adv.id} className="border-b border-outline-variant/30 pb-4 last:border-b-0 last:pb-0">
                    <p className={`text-label-caps font-label-caps mb-2 px-2 py-0.5 rounded w-fit ${adv.severity === "CRITICAL" ? "bg-error/20 border border-error text-error" : "bg-secondary-fixed/20 border border-secondary-fixed text-secondary-fixed"}`}>
                      {adv.severity} ALERT
                    </p>
                    <p className="text-body-md text-on-surface mb-4">{adv.text}</p>
                    <Button 
                      onClick={() => onExecuteAdvisoryAction(adv.id)}
                      className="w-full py-2 bg-surface-container-high text-primary border border-primary/50 rounded-lg hover:bg-primary hover:text-white font-label-caps text-label-caps transition-all tactile-button"
                    >
                      <span className="block">{adv.actionLabel}</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant italic">All stadium operations running optimal. No alerts active.</p>
            )}
          </div>

          {/* Live Dispatch GPS Map */}
          <div className="p-1 glass-overlay rounded-2xl mechanical-border flex flex-col h-auto min-h-[300px] overflow-hidden">
            <div className="bg-surface-container-highest/50 px-4 py-2 border-b border-outline-variant/30 flex items-center gap-2">
               <span className="w-2 h-2 bg-secondary-fixed rounded-full animate-pulse shadow-[0_0_8px_#b7c4ff]"></span>
               <span className="text-label-caps font-label-caps text-on-surface">LIVE GPS MAP</span>
            </div>
            <div className="flex-grow overflow-hidden relative">
              <Map selectedStadium={selectedStadium} darkMode={true} />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
