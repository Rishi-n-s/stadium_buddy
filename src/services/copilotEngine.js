/**
 * StadiumIQ Decision Support Copilot (Simulated RAG Engine)
 * Grounds LLM-style operational questions in live structured records.
 */

// Simulated database records (the RAG corpus)
export const OPERATIONAL_KNOWLEDGE = [
  {
    id: "Record #123",
    title: "Personnel Positions - North Gate",
    content: "There are currently 42 active personnel within 100m of the North Gate. This includes 28 Security, 8 Medics, and 6 Crowd Control Officers."
  },
  {
    id: "Log #A-42",
    title: "Duty Roster - Sector A",
    content: "Staff deployments: 42 officers checked in near Zone North Gate. Shift Lead: Supervisor Arjun."
  },
  {
    id: "Incident #I-804",
    title: "Active Incident Report",
    content: "Liquid spill detected at Gate 4 near escalator. Status: Critical slip hazard. Custodial team dispatched at 17:05."
  },
  {
    id: "Dispatch Log #D-12",
    title: "Maintenance Dispatch",
    content: "Custodial crew C-3 dispatched to Gate 4 concourse with wet-vacuum equipment. Est. resolution: 15 minutes."
  },
  {
    id: "Safety Advisory #S-09",
    title: "Egress Routing Recommendations",
    content: "Due to the Gate 4 corridor spill, recommend redirecting egress traffic from Section B to Gate 5 (North Gate)."
  },
  {
    id: "Turnstile Feed #T-02",
    title: "Turnstile Status - Gate 2",
    content: "Gate 2 (East) turnstiles are operating at NORMAL capacity (34% occupancy, 12 turnstiles active). Average flow: 12 persons/min."
  },
  {
    id: "Mesh Status #M-88",
    title: "Network Telemetry",
    content: "WiFi mesh signal integrity is at 99.8%. 45/45 nodes reporting active. Normal bandwidth utilization."
  },
  {
    id: "Concessions Log #C-12",
    title: "Concessions Inventory",
    content: "Food stalls at Titan Snacks operating at optimal capacity. Wait times average 3 minutes. All main items in stock."
  }
];

export const queryCopilot = (query) => {
  const q = query.toLowerCase();
  
  let answer = "";
  const citations = [];

  if (q.includes("staff") || q.includes("personnel") || q.includes("officer") || q.includes("north gate")) {
    answer = "There are currently **42** active personnel within 100m of the North Gate. This includes 28 Security, 8 Medics, and 6 Crowd Control Officers.";
    citations.push("Record #123", "Log #A-42");
  } 
  else if (q.includes("incident") || q.includes("last 15") || q.includes("spill") || q.includes("gate 4")) {
    answer = "At 17:05, a **Critical** liquid spill was detected near the **Gate 4 escalator**. High slip risk during match egress. Custodial crew C-3 was dispatched with wet-vacuum equipment and is actively cleaning the area (est. 15m to resolve).";
    citations.push("Incident #I-804", "Dispatch Log #D-12");
  } 
  else if (q.includes("redirect") || q.includes("exit") || q.includes("section b")) {
    answer = "Due to the active liquid spill at Gate 4, you should **redirect Section B traffic to Gate 5 (North Gate)**. This avoids the slip hazard corridor and is currently reporting a low congestion queue.";
    citations.push("Safety Advisory #S-09", "Incident #I-804");
  } 
  else if (q.includes("gate 2") || q.includes("status near gate 2")) {
    answer = "Gate 2 (East) is currently at **NORMAL** status (34% occupancy). All 12 turnstiles are active, with transit times averaging under 2 minutes. No security warnings reported.";
    citations.push("Turnstile Feed #T-02");
  } 
  else if (q.includes("wifi") || q.includes("mesh") || q.includes("network")) {
    answer = "The stadium WiFi mesh network is running at **99.8% signal integrity**. All 45 access nodes are fully operational with normal bandwidth utilization levels.";
    citations.push("Mesh Status #M-88");
  } 
  else if (q.includes("food") || q.includes("concession") || q.includes("snack") || q.includes("eat")) {
    answer = "Concession stands are operating at **OPTIMAL** speed. Lines at Titan Snacks (Gate 5) have wait times of about 3 minutes. Regular items are fully in stock.";
    citations.push("Concessions Log #C-12");
  } 
  else {
    // Default fallback simulating an intelligent RAG response
    answer = "No matching direct logs found for your query. Based on stadium-wide telemetry, all gates (except Gate 4) are operating normally. Attendance is 74,203 (92% capacity). Please let me know if you need specific check-ins on staff counts or incident logs.";
    citations.push("Turnstile Feed #T-02", "Mesh Status #M-88");
  }

  return {
    answer,
    citations
  };
};
