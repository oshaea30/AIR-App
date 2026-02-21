type Props = {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "highlight";
};

export function StatCard({ label, value, note, tone = "default" }: Props) {
  return (
    <article className={tone === "highlight" ? "stat-card stat-highlight" : "stat-card"}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {note ? <p className="stat-note">{note}</p> : null}
    </article>
  );
}
