import { findShortestPath, VENUE_NODES } from "./src/services/navigationEngine.js";
import { getAdvisories } from "./src/services/crowdEngine.js";
import { translate, getDir } from "./src/services/translationEngine.js";
import { queryCopilot } from "./src/services/copilotEngine.js";
import assert from "assert";

console.log("=== Running StadiumIQ Core Services Test Suite ===");

// 1. Test Navigation Engine: Standard pathfinding
console.log("Testing Pathfinding: standard route...");
const route1 = findShortestPath("section_102", "gate_4", []);
assert(route1 !== null, "Route should exist");
assert.deepStrictEqual(route1.path, ["section_102", "gate_4"], "Standard path should be straight to gate_4");
console.log("✓ Route 1 Success");

// 2. Test Navigation Engine: Pathfinding with detour around congested titan_snacks
console.log("Testing Pathfinding: detour around congested titan_snacks...");
const route2 = findShortestPath("section_102", "gate_5", []);
assert.deepStrictEqual(route2.path, ["section_102", "titan_snacks", "gate_5"], "Standard path to gate_5");

const route3 = findShortestPath("section_102", "gate_5", ["titan_snacks"]);
assert(route3 !== null, "Route should exist");
assert(!route3.path.includes("titan_snacks"), "Rerouted path must detour around congested titan_snacks");
console.log("✓ Route 2/3 Success");

// 3. Test Crowd Engine advisories
console.log("Testing Crowd Engine advisories...");
const mockZones = {
  north_gate: { current: 14760, capacity: 15000 },
  east_stand: { current: 8210, capacity: 12500, trend: 15.0 }
};
const advisories = getAdvisories(mockZones);
assert(advisories.length >= 2, "Should generate capacity and rush advisories");
assert(advisories[0].severity === "CRITICAL", "North gate advisory must be critical");
console.log("✓ Advisories Success");

// 4. Test Translation Engine
console.log("Testing Translation Engine...");
assert.strictEqual(translate("Where is the nearest exit?", "es"), "¿Dónde está la salida más cercana?");
assert.strictEqual(getDir("ar"), "rtl");
console.log("✓ Translation Success");

// 5. Test Copilot RAG citations
console.log("Testing Copilot RAG citation system...");
const copilotResult = queryCopilot("How many staff are near North Gate?");
assert(copilotResult.citations.includes("Record #123"), "Answer must cite staff record #123");
console.log("✓ Copilot Success");

console.log("\n*** ALL TESTS PASSED SUCCESSFULLY! ***");
