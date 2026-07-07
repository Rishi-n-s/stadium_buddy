/**
 * StadiumIQ Crowd Engine
 * Simulates occupancy sensor inputs and generates natural-language advisories.
 */

export const INITIAL_ZONES = {
  north_gate: {
    id: "north_gate",
    name: "Zone North Gate",
    capacity: 15000,
    current: 14760,
    trend: 0.8, // percentage points change per 5m
    severity: "CRITICAL",
    icon: "gate"
  },
  east_stand: {
    id: "east_stand",
    name: "Zone C - East Stand",
    capacity: 12500,
    current: 8210,
    trend: 15.0,
    severity: "NORMAL",
    icon: "grid_view"
  },
  concourse_b: {
    id: "concourse_b",
    name: "Concourse B",
    capacity: 8000,
    current: 4400,
    trend: 5.5,
    severity: "MODERATE",
    icon: "explore"
  },
  gate_4: {
    id: "gate_4",
    name: "Gate 4 (West)",
    capacity: 10000,
    current: 1500,
    trend: -1.2,
    severity: "LOW",
    icon: "gate"
  },
  south_gate: {
    id: "south_gate",
    name: "Zone South Gate",
    capacity: 20000,
    current: 12000,
    trend: 2.1,
    severity: "NORMAL",
    icon: "gate"
  }
};

export const getAdvisories = (zones) => {
  const advisories = [];

  // Check North Gate
  const northGatePct = (zones.north_gate.current / zones.north_gate.capacity) * 100;
  if (northGatePct > 90) {
    advisories.push({
      id: "adv-1",
      zoneId: "north_gate",
      title: "North Gate Capacity Advisory",
      text: `Gate 3 concourse is at ${northGatePct.toFixed(1)}% capacity and trending up — recommend opening overflow Gate 3B within 8 minutes.`,
      severity: "CRITICAL",
      actionLabel: "OPEN GATE 3B",
      actionExecuted: false
    });
  }

  // Check East Stand
  const eastStandPct = (zones.east_stand.current / zones.east_stand.capacity) * 100;
  if (zones.east_stand.trend >= 10) {
    advisories.push({
      id: "adv-2",
      zoneId: "east_stand",
      title: "East Stand Rush Advisory",
      text: `Trend: Zone C occupancy rising ${zones.east_stand.trend.toFixed(0)}% in 5 mins. Recommend opening extra turnstiles.`,
      severity: "MODERATE",
      actionLabel: "OPEN EXTRA TURNSTILES",
      actionExecuted: false
    });
  }

  // Check general spills/security events simulated
  return advisories;
};

export const updateOccupancy = (zones, timeStep) => {
  const newZones = { ...zones };

  Object.keys(newZones).forEach((key) => {
    const zone = { ...newZones[key] };
    // Simulate trend oscillation
    const noise = (Math.random() * 0.4 - 0.2); // slight random oscillation
    const change = (zone.trend / 100) * zone.capacity * (timeStep / 300) + (noise * 20);
    zone.current = Math.min(zone.capacity, Math.max(0, Math.round(zone.current + change)));

    // Recalculate severity status
    const pct = (zone.current / zone.capacity) * 100;
    if (pct >= 90) {
      zone.severity = "CRITICAL";
    } else if (pct >= 70) {
      zone.severity = "MODERATE";
    } else if (pct >= 40) {
      zone.severity = "NORMAL";
    } else {
      zone.severity = "LOW";
    }

    newZones[key] = zone;
  });

  return newZones;
};
