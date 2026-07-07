import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Popular stadiums geocoding dictionary
const POPULAR_STADIUMS_COORDS = {
  "wembley stadium": [-0.2797, 51.5560],
  "camp nou": [2.1228, 41.3809],
  "santiago bernabéu": [-3.6883, 40.4531],
  "maracanã": [-43.2302, -22.9122],
  "allianz arena": [11.6247, 48.2188],
  "san siro": [9.1239, 45.4781],
  "old trafford": [-2.2913, 53.4631],
  "anfield": [-2.9608, 53.4308],
  "stade de france": [2.3598, 48.9245],
  "melbourne cricket ground": [144.9834, -37.8199]
};

// Relative coordinate offsets to distribute venue layout nodes inside the stadium footprint
const INDOOR_NODE_OFFSETS = {
  gate_4: { lon: -0.0012, lat: -0.0010, name: "Gate 4 (South Entrance)" },
  gate_5: { lon: 0.0002, lat: 0.0012, name: "Gate 5 (North Entrance)" },
  section_102: { lon: -0.0004, lat: -0.0002, name: "Section 102 (Lower Stand)" },
  section_c: { lon: 0.0009, lat: 0.0003, name: "Section C (Club Seating)" },
  restroom_north: { lon: -0.0001, lat: 0.0005, name: "Restroom (North Concourse)" },
  restroom_east: { lon: 0.0011, lat: -0.0005, name: "Restroom (East Concourse)" },
  titan_snacks: { lon: -0.0004, lat: 0.0007, name: "Titan Snacks" },
  merchandise_stand: { lon: 0.0004, lat: -0.0002, name: "Merchandise Stand" },
  medical_bay: { lon: -0.0010, lat: -0.0004, name: "Medical Bay" }
};

export default function Map({
  selectedStadium,
  darkMode = true,
  isIndoor = false,
  startNode = null,
  endNode = null,
  path = null,
  congestedZones = [],
  onNodeSelect = null
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState(isIndoor ? "satellite" : "roadmap"); // default to satellite for indoor view
  const [is3D, setIs3D] = useState(false);
  
  // Real-Time GPS Routing & Navigation HUD states
  const [directions, setDirections] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const userMarkerRef = useRef(null);
  const userCoordsRef = useRef(null);
  const indoorMarkersRef = useRef([]);

  const stadiumName = selectedStadium?.stadium || "Wembley Stadium";
  const city = selectedStadium?.city || "London";
  const country = selectedStadium?.country || "England";

  // 1. Resolve coordinates for the selected stadium
  useEffect(() => {
    let active = true;
    setLoading(true);
    setMapLoaded(false);
    setDirections([]);
    setActiveStepIndex(0);

    const lookupName = stadiumName.toLowerCase().trim();
    
    // Check local lookup first
    const matched = Object.keys(POPULAR_STADIUMS_COORDS).find(k => lookupName.includes(k));
    if (matched) {
      setCoords(POPULAR_STADIUMS_COORDS[matched]);
      setLoading(false);
      return;
    }

    const queries = [];
    const hasStadiumWord = /stadium|arena|park|field|ground|bowl|center|centre/i.test(stadiumName);
    
    if (!hasStadiumWord) {
      queries.push(`${stadiumName} Stadium, ${city}, ${country}`);
      queries.push(`${stadiumName} Arena, ${city}, ${country}`);
    } else {
      queries.push(`${stadiumName}, ${city}, ${country}`);
    }
    queries.push(`${stadiumName}, ${city}, ${country}`);
    queries.push(`${stadiumName}, ${city}`);
    queries.push(stadiumName);
    queries.push(`${city} stadium`);
    queries.push(`${city}, ${country}`);

    const tryGeocode = (queryList) => {
      if (queryList.length === 0) {
        return Promise.reject("All geocoding queries failed");
      }
      const q = queryList[0];
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=3`;
      
      return fetch(url, {
        headers: { "User-Agent": "StadiumIQ-Hackathon-App/1.0" }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            // Find a result that is tagged as stadium/sports/building
            const bestMatch = data.find(item => 
              item.class === "leisure" || 
              item.type === "stadium" || 
              item.type === "sports_centre" ||
              item.class === "building" ||
              item.display_name.toLowerCase().includes("stadium") ||
              item.display_name.toLowerCase().includes("arena")
            );
            const match = bestMatch || data[0];
            return [parseFloat(match.lon), parseFloat(match.lat)];
          }
          return tryGeocode(queryList.slice(1));
        })
        .catch(() => {
          return tryGeocode(queryList.slice(1));
        });
    };

    tryGeocode(queries)
      .then(coordinates => {
        if (active) {
          setCoords(coordinates);
        }
      })
      .catch(err => {
        console.error("Geocoding pipeline failed:", err);
        if (active) {
          setCoords([-0.2797, 51.5560]); // fallback to Wembley
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedStadium]);

  // Set default mapType if mode changes
  useEffect(() => {
    setMapType(isIndoor ? "satellite" : "roadmap");
  }, [isIndoor]);

  // 2. Initialize and configure map instance (Only runs when coords, mapType, or mode changes)
  useEffect(() => {
    if (!coords || !mapContainerRef.current) return;

    setMapLoaded(false);

    // Map Google Maps Tile layer based on selected type
    let layerType = "m";
    if (mapType === "satellite" || isIndoor) layerType = "y"; // always satellite in indoor mode
    else if (mapType === "terrain") layerType = "p";

    const googleMapsStyle = {
      version: 8,
      sources: {
        "google-tiles": {
          type: "raster",
          tiles: [
            `https://mt0.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`,
            `https://mt1.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`,
            `https://mt2.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`,
            `https://mt3.google.com/vt/lyrs=${layerType}&x={x}&y={y}&z={z}`
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: "google-raster",
          type: "raster",
          source: "google-tiles",
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };

    // Initialize MapLibre Map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: googleMapsStyle,
      center: coords,
      zoom: isIndoor ? 17.5 : (is3D ? 16 : 15), // Zoom in super close for indoor view
      minZoom: 3, // Prevent zooming out to repeating global layouts
      maxZoom: 20, // Prevent zooming in past raster limits
      pitch: isIndoor ? 25 : (is3D ? 60 : 0),
      bearing: isIndoor ? -15 : (is3D ? 45 : 0)
    });

    mapRef.current = map;

    // Controls
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (isIndoor) {
        // --- INDOOR MODE STUBS: Register route source and layer immediately ---
        map.addSource("indoor-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: []
            }
          }
        });

        map.addLayer({
          id: "indoor-route-line",
          type: "line",
          source: "indoor-route",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#34a853", // Google Maps green route
            "line-width": 6,
            "line-opacity": 0.9
          }
        });

      } else {
        // --- OUTDOOR MODE: Standard geolocated venue marker + real road GPS routing ---
        const el = document.createElement("div");
        el.className = "stadium-marker";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-secondary/20 border border-secondary rounded-full animate-ping"></div>
            <div class="absolute w-8 h-8 bg-secondary/40 border-2 border-secondary rounded-full flex items-center justify-center shadow-[0_0_15px_#4ae176]">
              <span class="material-symbols-outlined text-white text-xs select-none pointer-events-none">sports_soccer</span>
            </div>
          </div>
        `;

        new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2 text-on-surface-variant font-sans">
                  <h4 class="font-bold text-xs text-primary-light">${stadiumName}</h4>
                  <p class="text-[10px] opacity-80 mt-1">${city}, ${country}</p>
                  <p class="text-[10px] text-secondary font-mono mt-1">CAPACITY: ${selectedStadium?.capacity?.toLocaleString() || 'N/A'}</p>
                </div>
              `)
          )
          .addTo(map);

        // Generate start point around 1-2 km away from stadium
        const userStart = [coords[0] - 0.008 - Math.random() * 0.002, coords[1] - 0.008 - Math.random() * 0.002];
        userCoordsRef.current = userStart;

        // Register route source and layer immediately
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [userStart, coords]
            }
          }
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#1a73e8", // Google Maps blue
            "line-width": 6,
            "line-opacity": 0.8
          }
        });

        // User GPS dot
        const userEl = document.createElement("div");
        userEl.className = "user-gps-marker";
        userEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
            <div class="w-4.5 h-4.5 bg-blue-600 border-2 border-white rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]"></div>
          </div>
        `;

        const userMarker = new maplibregl.Marker({ element: userEl })
          .setLngLat(userStart)
          .addTo(map);

        userMarkerRef.current = userMarker;

        // Fetch real-world road route via Open Source Routing Machine (OSRM) API
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userStart[0]},${userStart[1]};${coords[0]},${coords[1]}?overview=full&geometries=geojson&steps=true`;
        
        fetch(osrmUrl)
          .then(res => res.json())
          .then(data => {
            let routeCoords = [userStart, coords]; // fallback to straight line
            let steps = ["Head towards stadium", "Arrive at destination"];

            if (data.routes && data.routes[0]) {
              routeCoords = data.routes[0].geometry.coordinates;
              
              if (data.routes[0].legs && data.routes[0].legs[0].steps) {
                steps = data.routes[0].legs[0].steps.map(s => s.maneuver.instruction);
              }
            }

            setDirections(steps);

            // Update route geometry on map
            const source = map.getSource("route");
            if (source) {
              source.setData({
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoords
                }
              });
            }

            // Animate user dot along OSRM street coordinates step-by-step
            let index = 0;
            const trackingInterval = setInterval(() => {
              if (index >= routeCoords.length) {
                index = 0; // restart transit loop
              }

              const currentPos = routeCoords[index];
              userCoordsRef.current = currentPos;

              if (userMarkerRef.current) {
                userMarkerRef.current.setLngLat(currentPos);
              }

              // Update active direction text index based on travel progress
              const progress = index / routeCoords.length;
              const activeStep = Math.min(
                Math.floor(progress * steps.length),
                steps.length - 1
              );
              setActiveStepIndex(activeStep);

              // Update remaining path line
              const src = map.getSource("route");
              if (src) {
                src.setData({
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: routeCoords.slice(index)
                  }
                });
              }

              index++;
            }, 350);

            mapRef.current.trackingInterval = trackingInterval;
          })
          .catch(err => {
            console.error("OSRM routing failed, using fallback:", err);
            // Fallback straight line animation
            let fraction = 0;
            const trackingInterval = setInterval(() => {
              fraction += 0.01;
              if (fraction > 1.0) fraction = 0;
              const currentPos = [
                userStart[0] + (coords[0] - userStart[0]) * fraction,
                userStart[1] + (coords[1] - userStart[1]) * fraction
              ];
              userCoordsRef.current = currentPos;
              if (userMarkerRef.current) userMarkerRef.current.setLngLat(currentPos);

              const src = map.getSource("route");
              if (src) {
                src.setData({
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: [currentPos, coords]
                  }
                });
              }
            }, 500);
            mapRef.current.trackingInterval = trackingInterval;
          });
      }

      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        if (mapRef.current.trackingInterval) {
          clearInterval(mapRef.current.trackingInterval);
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coords, mapType, isIndoor]);

  // 3. Dynamic Node & Pathfinding updates (Triggers instantly WITHOUT map recreation)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !isIndoor || !coords) return;

    const map = mapRef.current;

    // 1. Clear previous indoor markers
    indoorMarkersRef.current.forEach(m => m.remove());
    indoorMarkersRef.current = [];

    // 2. Add updated node pins
    Object.keys(INDOOR_NODE_OFFSETS).forEach(key => {
      const node = INDOOR_NODE_OFFSETS[key];
      const nodeCoords = [coords[0] + node.lon, coords[1] + node.lat];
      
      const isStart = key === startNode;
      const isEnd = key === endNode;
      const isCongested = congestedZones.includes(key);

      const el = document.createElement("button");
      el.className = "indoor-node-marker transition-all active:scale-95";
      
      let markerColor = "bg-white/90 border-gray-400 text-gray-700";
      let pingEffect = "";
      let label = "";

      if (isStart) {
        markerColor = "bg-[#1a73e8] border-white text-white font-bold ring-4 ring-blue-500/20 scale-110 shadow-lg";
        label = "S";
      } else if (isEnd) {
        markerColor = "bg-[#ea4335] border-white text-white font-bold ring-4 ring-red-500/20 scale-115 animate-bounce shadow-lg";
        label = "E";
      } else if (isCongested) {
        markerColor = "bg-[#f9ab00] border-white text-gray-900 scale-105 shadow-md";
        pingEffect = `<div class="absolute inset-0 rounded-full border border-yellow-500 animate-ping"></div>`;
      }

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] font-mono shadow-md ${markerColor}">
          ${pingEffect}
          <span>${label || key.substring(0, 2).toUpperCase()}</span>
        </div>
      `;

      el.addEventListener("click", () => {
        if (onNodeSelect) {
          onNodeSelect(key);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(nodeCoords)
        .setPopup(
          new maplibregl.Popup({ offset: 15 })
            .setHTML(`
              <div class="p-1 font-sans text-xs text-gray-800">
                <p class="font-bold">${node.name}</p>
                ${isCongested ? '<p class="text-xs text-red-600 font-bold mt-1">⚠️ CONGESTED ZONE</p>' : ""}
                <p class="text-[9px] text-gray-500 mt-0.5">Click to set as Destination</p>
              </div>
            `)
        )
        .addTo(map);

      indoorMarkersRef.current.push(marker);
    });

    // 3. Update route data dynamically on existing layer
    const source = map.getSource("indoor-route");
    if (source) {
      const pathCoordinates = path
        ? path
            .map(key => {
              const node = INDOOR_NODE_OFFSETS[key];
              return node ? [coords[0] + node.lon, coords[1] + node.lat] : null;
            })
            .filter(c => c !== null)
        : [];

      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: pathCoordinates
        }
      });
    }
  }, [mapLoaded, isIndoor, startNode, endNode, path, congestedZones, coords]);

  // 4. Smooth 3D Orbit Camera Rotation (only available in outdoor mode)
  useEffect(() => {
    if (!mapRef.current || !coords || !is3D || isIndoor) return;

    const map = mapRef.current;
    let animationFrameId;

    const rotateCamera = () => {
      if (!mapRef.current) return;
      const currentBearing = map.getBearing();
      map.setBearing((currentBearing + 0.15) % 360);
      animationFrameId = requestAnimationFrame(rotateCamera);
    };

    const timer = setTimeout(() => {
      rotateCamera();
    }, 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [is3D, coords, mapType, isIndoor]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-2xl min-h-[300px]">
        <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
        <span className="text-xs font-mono text-on-surface-variant mt-3 uppercase tracking-wider">
          GEOLOCATING VENUE COORDINATES...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] border border-outline-variant/30 rounded-2xl overflow-hidden shadow-xl">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />
      
      {/* Google Maps Style Panel (Only visible in Outdoor mode since Indoor is locked to Satellite) */}
      {!isIndoor && (
        <div className="absolute top-16 left-4 z-20 flex gap-2">
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden shadow-md font-sans text-xs text-gray-800">
            <button
              onClick={() => {
                setMapType("roadmap");
                setIs3D(false);
              }}
              className={`px-2.5 py-1.5 font-semibold ${mapType === "roadmap" && !is3D ? "bg-[#1a73e8] text-white" : "bg-white hover:bg-gray-100"}`}
            >
              Map
            </button>
            <button
              onClick={() => {
                setMapType("satellite");
                setIs3D(false);
              }}
              className={`px-2.5 py-1.5 font-semibold border-l border-r border-gray-300 ${mapType === "satellite" && !is3D ? "bg-[#1a73e8] text-white" : "bg-white hover:bg-gray-100"}`}
            >
              Satellite
            </button>
            <button
              onClick={() => {
                setMapType("terrain");
                setIs3D(false);
              }}
              className={`px-2.5 py-1.5 font-semibold ${mapType === "terrain" && !is3D ? "bg-[#1a73e8] text-white" : "bg-white hover:bg-gray-100"}`}
            >
              Terrain
            </button>
          </div>

          <button
            onClick={() => {
              const next3D = !is3D;
              setIs3D(next3D);
              if (next3D) {
                setMapType("satellite");
              } else {
                setMapType("roadmap");
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-sans text-xs font-semibold shadow-md transition-all ${
              is3D 
                ? "bg-[#1a73e8] border-[#1a73e8] text-white" 
                : "bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {is3D ? "map" : "3d_rotation"}
            </span>
            <span>{is3D ? "Common 2D View" : "3D Orbit View"}</span>
          </button>
        </div>
      )}

      {/* Turn-by-Turn Navigation HUD (Only in Outdoor mode when routes are loaded) */}
      {!isIndoor && directions.length > 0 && (
        <div className="absolute bottom-4 right-4 z-20 w-72 bg-white/95 border border-gray-300 rounded-xl p-3.5 shadow-lg max-h-56 overflow-y-auto font-sans text-xs text-gray-800 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-2">
            <span className="material-symbols-outlined text-[#1a73e8] text-sm animate-pulse">navigation</span>
            <span className="font-bold tracking-wide uppercase text-[10px] text-gray-500">GPS Turn Navigation</span>
          </div>
          <div className="space-y-2">
            {directions.map((step, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 items-start transition-all ${
                  idx === activeStepIndex 
                    ? "text-[#1a73e8] font-bold bg-blue-50/50 p-1 rounded-md border border-blue-100" 
                    : "opacity-60 text-gray-600"
                }`}
              >
                <span className="font-mono text-[9px] mt-0.5 bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{idx + 1}</span>
                <span className="leading-tight">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indoor Mode HUD label */}
      {isIndoor && (
        <div className="absolute top-16 left-4 z-20 bg-white/95 border border-gray-300 rounded-md px-3 py-1.5 shadow-md font-sans text-xs text-gray-800 flex items-center gap-2 pointer-events-none">
          <span className="material-symbols-outlined text-green-600 text-xs animate-pulse">satellite_alt</span>
          <span className="font-bold text-[10px] tracking-wide uppercase">Google Satellite Indoor Overlay</span>
        </div>
      )}

      {/* HUD overlay style indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-[9px] text-gray-800 flex items-center gap-2 pointer-events-none shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
        <span>GOOGLE MAPS: {coords ? `${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°E` : "INIT"}</span>
      </div>
    </div>
  );
}
