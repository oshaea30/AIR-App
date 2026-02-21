export type RolePreset = {
  id: string;
  label: string;
  dayRate: number;
};

export const rolePresets: RolePreset[] = [
  { id: "producer", label: "Producer", dayRate: 700 },
  { id: "editor", label: "Audio Editor", dayRate: 650 },
  { id: "reporter", label: "Reporter", dayRate: 600 },
  { id: "sound-designer", label: "Sound Designer", dayRate: 800 }
];
