export type Opportunity = {
  id: string;
  title: string;
  org: string;
  type: "Job" | "Grant" | "Pitch Call" | "Fellowship";
  location: string;
  compensation: string;
  deadline: string;
  tags: string[];
  matchReason: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "opp-001",
    title: "Audio Producer: Climate Desk",
    org: "Signal Public Media",
    type: "Job",
    location: "Remote (US)",
    compensation: "$2,200 per episode",
    deadline: "2026-03-05",
    tags: ["Audio", "Editing", "Investigative"],
    matchReason: "Matches your profile tags: audio editing, field reporting."
  },
  {
    id: "opp-002",
    title: "Short-Run Narrative Grant",
    org: "Horizon Story Fund",
    type: "Grant",
    location: "US + Canada",
    compensation: "$15,000 grant",
    deadline: "2026-03-18",
    tags: ["Narrative", "Independent", "Series"],
    matchReason: "High fit due to your documentary and pilot episode history."
  },
  {
    id: "opp-003",
    title: "Open Pitch: Culture and Place",
    org: "National Audio Review",
    type: "Pitch Call",
    location: "Remote",
    compensation: "$1.25 per published word",
    deadline: "2026-02-28",
    tags: ["Pitch", "Culture", "Essay"],
    matchReason: "Fast-turn pitch aligned with your active beat preferences."
  },
  {
    id: "opp-004",
    title: "Mentored Editing Fellowship",
    org: "AIR Studio Lab",
    type: "Fellowship",
    location: "Hybrid (NYC)",
    compensation: "$8,000 stipend",
    deadline: "2026-03-12",
    tags: ["Mentorship", "Editing", "Career Growth"],
    matchReason: "You marked mentorship as a top priority in your profile."
  }
];
