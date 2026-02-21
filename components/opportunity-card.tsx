import type { Opportunity } from "@/data/opportunities";

type Props = {
  opportunity: Opportunity;
  saved?: boolean;
  fitScore?: number;
  onToggleSave?: (opportunityId: string) => void;
  onTrack?: (opportunity: Opportunity) => void;
};

export function OpportunityCard({ opportunity, saved = false, fitScore, onToggleSave, onTrack }: Props) {
  const deadlineDate = new Date(opportunity.deadline);
  const today = new Date();
  const msInDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - today.getTime()) / msInDay));

  return (
    <article className="card opportunity-card">
      <div className="row-between opp-head">
        <p className={`eyebrow type-pill ${opportunity.type.toLowerCase().replace(" ", "-")}`}>{opportunity.type}</p>
        <p className="deadline">Due {opportunity.deadline}</p>
      </div>
      <h3 className="opp-title">{opportunity.title}</h3>
      <p className="muted opp-meta">
        {opportunity.org} · {opportunity.location}
      </p>
      <p className="pay">{opportunity.compensation}</p>
      <p className="fit">{opportunity.matchReason}</p>
      <div className="chip-row">
        {opportunity.tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
        {typeof fitScore === "number" ? <span className="chip fit-chip">Fit {fitScore}%</span> : null}
        <span className={daysLeft <= 7 ? "chip urgency-chip urgent" : "chip urgency-chip"}>{daysLeft}d left</span>
      </div>
      <div className="button-row inline">
        <button className="button button-secondary" onClick={() => onToggleSave?.(opportunity.id)}>
          {saved ? "Saved" : "Bookmark"}
        </button>
        <button className="button" onClick={() => onTrack?.(opportunity)}>
          Track in Pipeline
        </button>
      </div>
    </article>
  );
}
