export type PipelineStage = "To Pitch" | "Applied" | "Interview" | "Booked" | "Invoiced" | "Paid";

export type PipelineItem = {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  value: number;
  stage: PipelineStage;
};

export const defaultPipeline: PipelineItem[] = [
  {
    id: "pipe-1",
    title: "Neighborhood Soundwalk Feature",
    client: "Northline Radio",
    dueDate: "2026-02-24",
    value: 1800,
    stage: "Applied"
  },
  {
    id: "pipe-2",
    title: "Rural Schools Mini-Doc",
    client: "Civic Audio House",
    dueDate: "2026-03-02",
    value: 3200,
    stage: "Interview"
  },
  {
    id: "pipe-3",
    title: "Election Prep Explainer",
    client: "Public Forum Daily",
    dueDate: "2026-03-10",
    value: 2500,
    stage: "Booked"
  }
];

export const stages: PipelineStage[] = ["To Pitch", "Applied", "Interview", "Booked", "Invoiced", "Paid"];
