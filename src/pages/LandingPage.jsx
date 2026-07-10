import React, { useState, useEffect, useMemo } from "react";
import { STADIUMS } from "../data/stadiums";

import Button from '../components/ui/Button';

// List of popular stadiums for quick-select chips
const FEATURED_STADIUMS = [
  { stadium: "Wembley Stadium", city: "London", country: "England", capacity: 90000, hometeams: "England", confederation: "UEFA" },
  { stadium: "Camp Nou", city: "Barcelona", country: "Spain", capacity: 99354, hometeams: "FC Barcelona", confederation: "UEFA" },
  { stadium: "Santiago Bernabéu", city: "Madrid", country: "Spain", capacity: 81044, hometeams: "Real Madrid", confederation: "UEFA" },
  { stadium: "Maracanã", city: "Rio de Janeiro", country: "Brazil", capacity: 78838, hometeams: "Flamengo, Fluminense", confederation: "CONMEBOL" },
  { stadium: "Allianz Arena", city: "Munich", country: "Germany", capacity: 75000, hometeams: "Bayern Munich", confederation: "UEFA" },
  { stadium: "San Siro", city: "Milan", country: "Italy", capacity: 80018, hometeams: "AC Milan, Inter Milan", confederation: "UEFA" }
];

export default function LandingPage({ onDeploy }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStadium, setSelectedStadium] = useState(FEATURED_STADIUMS[0]);
  
  // Deployment simulation states
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);

  // Global search states (All world stadiums via OSM)
  const [globalResults, setGlobalResults] = useState([]);
  const [isSearchingGlobally, setIsSearchingGlobally] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setGlobalResults([]);
      return;
    }

    setIsSearchingGlobally(true);
    const delayDebounceFn = setTimeout(() => {
      // Fetch sports stadiums matching search query globally from Nominatim OSM API
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ' stadium')}&format=json&addressdetails=1&limit=5`;
      
      fetch(searchUrl, {
        headers: {
          "User-Agent": "StadiumIQ-Hackathon-App/1.0"
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data) {
            // Map OSM objects to StadiumIQ schema
            const mapped = data.map(item => {
              const address = item.address || {};
              const name = item.display_name.split(',')[0];
              const city = address.city || address.town || address.village || address.suburb || address.state || "";
              const country = address.country || "";
              
              return {
                s_no: `global-${item.place_id}`,
                confederation: item.class === "leisure" ? "Global Leisure" : "Global Venue",
                stadium: name,
                city: city,
                country: country,
                capacity: 50000, // default placeholder capacity for dynamic scaling
                hometeams: "Local Teams / Multi-Sport",
                ioc: address.country_code?.toUpperCase() || "GL"
              };
            });
            setGlobalResults(mapped);
          }
        })
        .catch(err => console.error("Global search failed:", err))
        .finally(() => setIsSearchingGlobally(false));
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const deployMessages = [
    "Injecting local stadium node graph...",
    "Calibrating crowd-density sensors...",
    "Activating decision-support RAG logs...",
    "Tuning locale-aware multilingual helpers...",
    "StadiumIQ Operations Engine online!"
  ];

  // Search filter
  const filteredStadiums = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return STADIUMS.filter(
      (s) =>
        s.stadium.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) ||
        (s.hometeams && s.hometeams.toLowerCase().includes(query))
    ).slice(0, 8); // cap results for clean dropdown UI
  }, [searchQuery]);

  const handleSelectStadium = (stadium) => {
    setSelectedStadium(stadium);
    setSearchQuery(""); // close dropdown
  };

  const handleDeployClick = () => {
    setIsDeploying(true);
    setDeployStep(0);

    const stepInterval = setInterval(() => {
      setDeployStep((s) => {
        if (s < deployMessages.length - 1) {
          return s + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            onDeploy(selectedStadium);
          }, 800);
          return s;
        }
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col relative overflow-hidden px-4 py-8 md:p-12">
      {/* Background neon blur overlays */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[150px] pointer-events-none" />

      {/* Header bar */}
      <header className="max-w-[1200px] w-full mx-auto flex justify-between items-center mb-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary/20 bg-surface-container flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">sports_soccer</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-primary-light">STADIUMIQ</h1>
            <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-[0.2em]">Smart Venue OS</p>
          </div>
        </div>
        <div className="flex gap-1.5 px-3 py-1 rounded-full border border-outline-variant bg-surface-container-high/50 text-[10px] font-mono text-on-surface">
          <span>DATA ENGINE: CONNECTED</span>
        </div>
      </header>

      {/* Main hero & search layout */}
      <main className="max-w-[1200px] w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left column: Hero & Search dropdown */}
        <div className="lg:col-span-7 flex flex-col">
          <span className="text-secondary font-mono text-xs font-bold tracking-widest uppercase mb-3">
            GenAI Smart Stadium Hackathon Release
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
            Instantly Orchestrate <br />
            Any Stadium on Earth.
          </h2>
          <p className="text-on-surface-variant text-base leading-relaxed max-w-xl mb-10">
            Select any venue from our catalog of 1,820 global stadiums. StadiumIQ leverages Generative AI to map wayfinding paths, draft live crowd advisories, deploy security personnel, and handle fans in 5+ languages.
          </p>

          {/* SEARCH COMPONENT */}
          <div className="relative w-full max-w-xl mb-6">
            <div className="flex items-center bg-surface-container border border-outline-variant/60 focus-within:border-primary/60 rounded-xl px-4 py-3 shadow-xl transition-all">
              <span className="material-symbols-outlined text-outline mr-3">search</span>
              <input
                type="text"
                placeholder="Search 1,820+ catalog stadiums or any sports arena in the world..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-on-surface text-sm w-full outline-none focus:ring-0 placeholder-on-surface-variant/50"
              />
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} className="material-symbols-outlined text-outline-variant hover:text-white text-lg">
                  close
                </Button>
              )}
            </div>

            {/* Dropdown results */}
            {searchQuery && (
              <div className="absolute left-0 right-0 mt-2 bg-surface-container-high border border-outline-variant/50 rounded-xl overflow-hidden shadow-2xl z-50 backdrop-blur-xl max-h-[360px] overflow-y-auto">
                
                {/* Catalog matches */}
                {filteredStadiums.length > 0 && (
                  <div>
                    <div className="px-5 py-1.5 bg-surface-container-highest/60 text-[9px] font-mono font-bold text-outline-variant uppercase tracking-wider">
                      Catalog Venues
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {filteredStadiums.map((s, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleSelectStadium(s)}
                          className="w-full text-left px-5 py-2.5 hover:bg-primary-container/20 flex justify-between items-center transition-colors group"
                        >
                          <div>
                            <div className="font-bold text-on-surface group-hover:text-primary-light text-sm">{s.stadium}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {s.city}, {s.country}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-outline-variant">
                              {s.capacity ? s.capacity.toLocaleString() : "N/A"} seats
                            </span>
                            <span className="material-symbols-outlined text-outline-variant text-sm group-hover:translate-x-1 transition-all">
                              arrow_forward
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Global OSM Live matches */}
                {globalResults.length > 0 && (
                  <div className="border-t border-outline-variant/20">
                    <div className="px-5 py-1.5 bg-surface-container-highest/60 text-[9px] font-mono font-bold text-outline-variant uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      <span>Global World Venues (OSM Live)</span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {globalResults.map((s, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleSelectStadium(s)}
                          className="w-full text-left px-5 py-2.5 hover:bg-secondary-container/20 flex justify-between items-center transition-colors group"
                        >
                          <div>
                            <div className="font-bold text-on-surface group-hover:text-secondary text-sm">{s.stadium}</div>
                            <div className="text-xs text-on-surface-variant mt-0.5">
                              {s.city || "Unknown City"}, {s.country || "Unknown Country"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-outline-variant">
                              World Map
                            </span>
                            <span className="material-symbols-outlined text-outline-variant text-sm group-hover:translate-x-1 transition-all">
                              arrow_forward
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isSearchingGlobally && (
                  <div className="p-3 text-center text-xs text-outline-variant font-mono flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                    <span>SEARCHING GLOBALLY...</span>
                  </div>
                )}

                {filteredStadiums.length === 0 && globalResults.length === 0 && !isSearchingGlobally && (
                  <div className="p-4 text-center text-xs text-on-surface-variant font-mono">
                    NO STADIUMS FOUND
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick select chips */}
          <div className="flex flex-wrap items-center gap-2 max-w-xl">
            <span className="text-[10px] text-outline font-mono uppercase mr-1">Popular:</span>
            {FEATURED_STADIUMS.map((item, idx) => {
              return (
                <Button
                  key={idx}
                  onClick={() => handleSelectStadium(item)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedStadium.stadium === item.stadium
                      ? "bg-secondary/15 border-secondary text-secondary"
                      : "bg-surface-container/50 border-outline-variant/30 hover:border-outline text-on-surface-variant hover:text-white"
                  }`}
                >
                  {item.stadium}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Right column: Stadium card & Deploy simulation */}
        <div className="lg:col-span-5 relative w-full max-w-md mx-auto">
          {isDeploying ? (
            /* DEPLOYMENT PROCESS STATUS CARD */
            <div className="bg-surface-container border border-primary/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[380px] flex flex-col justify-between">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                  <h3 className="font-mono text-xs font-bold text-primary-light uppercase tracking-widest">
                    INITIALIZING DEPLOYMENT
                  </h3>
                  <span className="material-symbols-outlined text-secondary animate-spin">sync</span>
                </div>

                <div className="space-y-4">
                  {deployMessages.slice(0, deployStep + 1).map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-sm leading-relaxed transition-all duration-300 ${
                        idx === deployStep ? "text-secondary font-bold" : "text-on-surface-variant/65"
                      }`}
                    >
                      <span className="text-secondary font-mono">&gt;</span>
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress bar at bottom of deployment card */}
              <div className="pt-6 mt-6 border-t border-outline-variant/20 flex flex-col gap-2">
                <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${((deployStep + 1) / deployMessages.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* SELECTED STADIUM PROFILE CARD */
            <div className="bg-surface-container border border-outline-variant/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-primary/30 flex flex-col min-h-[380px] justify-between">
              {/* Profile Card Header overlay */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-mono bg-primary/10 border border-primary/20 text-primary-light px-2.5 py-0.5 rounded-full font-bold uppercase">
                      {selectedStadium.confederation}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2 leading-tight">
                      {selectedStadium.stadium}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {selectedStadium.city}, {selectedStadium.country}
                    </p>
                  </div>
                </div>

                {/* Profile attributes */}
                <div className="space-y-3.5 border-t border-b border-outline-variant/30 py-5 my-5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Home Team(s)</span>
                    <span className="font-semibold text-right max-w-[200px] truncate text-white">
                      {selectedStadium.hometeams || "Various clubs / National team"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">Capacity Limit</span>
                    <span className="font-mono font-bold text-secondary text-right text-base">
                      {selectedStadium.capacity.toLocaleString()} Seats
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">IOC Code</span>
                    <span className="font-mono text-white text-right">
                      {selectedStadium.ioc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleDeployClick}
                className="w-full py-4 bg-primary-container hover:brightness-110 active:scale-95 text-white rounded-xl font-mono text-sm font-bold tracking-wider transition-all duration-200 flex justify-center items-center gap-2 shadow-lg shadow-primary-container/25"
              >
                <span className="material-symbols-outlined text-sm">bolt</span>
                DEPLOY STADIUMIQ LAYER
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1200px] w-full mx-auto text-center text-[10px] text-outline font-mono uppercase tracking-[0.2em] mt-12 relative z-10 pt-6 border-t border-outline-variant/20">
        STADIUMIQ DATACENTER CATALOG • 1,820 NODES ONLINE
      </footer>
    </div>
  );
}
