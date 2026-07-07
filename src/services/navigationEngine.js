/**
 * StadiumIQ Navigation Engine
 * Implements a venue graph with pathfinding that respects live congestion/incident updates.
 */

// Nodes in the stadium graph
export const VENUE_NODES = {
  gate_4: { id: "gate_4", name: "Gate 4 (West)", type: "gate", x: 200, y: 480 },
  gate_5: { id: "gate_5", name: "Gate 5 (North)", type: "gate", x: 450, y: 150 },
  section_102: { id: "section_102", name: "Section 102", type: "section", x: 300, y: 350 },
  section_c: { id: "section_c", name: "Section C (East)", type: "section", x: 600, y: 300 },
  restroom_north: { id: "restroom_north", name: "Accessible Restroom (North)", type: "restroom", x: 380, y: 220 },
  restroom_east: { id: "restroom_east", name: "East Restroom", type: "restroom", x: 680, y: 380 },
  titan_snacks: { id: "titan_snacks", name: "Titan Snacks", type: "food", x: 320, y: 200 },
  merchandise_stand: { id: "merchandise_stand", name: "Merchandise Stand 3", type: "shop", x: 500, y: 360 },
  medical_bay: { id: "medical_bay", name: "Medical Bay", type: "medical", x: 220, y: 380 }
};

// Edges in the stadium graph
export const VENUE_EDGES = [
  { from: "gate_4", to: "medical_bay", distance: 40 },
  { from: "medical_bay", to: "section_102", distance: 50 },
  { from: "gate_4", to: "section_102", distance: 80 },
  { from: "section_102", to: "titan_snacks", distance: 70 },
  { from: "titan_snacks", to: "gate_5", distance: 50 },
  { from: "restroom_north", to: "gate_5", distance: 40 },
  { from: "section_102", to: "merchandise_stand", distance: 90 },
  { from: "merchandise_stand", to: "section_c", distance: 60 },
  { from: "section_c", to: "restroom_east", distance: 40 },
  { from: "titan_snacks", to: "restroom_north", distance: 30 },
  { from: "merchandise_stand", to: "restroom_north", distance: 70 },
  { from: "merchandise_stand", to: "restroom_east", distance: 80 }
];

// Helper to find shortest path using Dijkstra's algorithm
export const findShortestPath = (startId, endId, congestedZones = []) => {
  const nodes = Object.keys(VENUE_NODES);
  
  if (!VENUE_NODES[startId] || !VENUE_NODES[endId]) return null;

  const distances = {};
  const previous = {};
  const queue = [];

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    queue.push(node);
  });

  distances[startId] = 0;

  while (queue.length > 0) {
    // Find node with smallest distance
    queue.sort((a, b) => distances[a] - distances[b]);
    const u = queue.shift();

    if (u === endId) break;
    if (distances[u] === Infinity) break;

    // Find neighbors of u
    const neighbors = [];
    VENUE_EDGES.forEach(edge => {
      if (edge.from === u && queue.includes(edge.to)) {
        neighbors.push({ id: edge.to, dist: edge.distance });
      } else if (edge.to === u && queue.includes(edge.from)) {
        neighbors.push({ id: edge.from, dist: edge.distance });
      }
    });

    neighbors.forEach(neighbor => {
      // Calculate weight, penalizing congested zones heavily
      let weight = neighbor.dist;
      if (congestedZones.includes(neighbor.id)) {
        weight += 1000; // congestion penalty
      }

      const alt = distances[u] + weight;
      if (alt < distances[neighbor.id]) {
        distances[neighbor.id] = alt;
        previous[neighbor.id] = u;
      }
    });
  }

  // Build path
  const path = [];
  let curr = endId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  if (path[0] === startId) {
    return {
      path,
      totalDistance: distances[endId] >= 1000 ? distances[endId] % 1000 : distances[endId],
      isRerouted: distances[endId] >= 1000
    };
  }

  return null;
};

// Converts a list of node IDs into step-by-step walking directions
export const generateDirections = (path, congestedZones = []) => {
  if (!path || path.length < 2) return ["You have arrived at your destination."];

  const steps = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = VENUE_NODES[path[i]];
    const toNode = VENUE_NODES[path[i + 1]];
    
    let instruction = "";
    if (i === 0) {
      instruction += `Start at ${fromNode.name}. `;
    }

    if (toNode.type === "restroom") {
      instruction += `Head towards the ${toNode.name} on the side.`;
    } else if (toNode.type === "food") {
      instruction += `Walk along the concourse past ${toNode.name}.`;
    } else if (toNode.type === "shop") {
      instruction += `Continue past the ${toNode.name} souvenir area.`;
    } else if (toNode.type === "gate") {
      instruction += `Proceed straight to ${toNode.name}.`;
    } else {
      instruction += `Walk to ${toNode.name}.`;
    }

    // Mention detour if appropriate
    if (congestedZones.length > 0) {
      const avoids = congestedZones.map(id => VENUE_NODES[id]?.name || id).join(", ");
      if (i === 0) {
        instruction += ` (Detour active to bypass congested area: ${avoids})`;
      }
    }

    steps.push(instruction);
  }

  steps.push("You will reach your destination on the left.");
  return steps;
};
