"use client";

import { useMemo, useState } from "react";
import { rolePresets } from "@/data/rates";

export default function RatesPage() {
  const [roleId, setRoleId] = useState(rolePresets[0].id);
  const [days, setDays] = useState("3");
  const [revisionRounds, setRevisionRounds] = useState("1");
  const [rush, setRush] = useState(false);
  const [travelDays, setTravelDays] = useState("0");

  const quote = useMemo(() => {
    const role = rolePresets.find((item) => item.id === roleId) ?? rolePresets[0];
    const parsedDays = Math.max(1, Number(days) || 1);
    const parsedRevisions = Math.max(0, Number(revisionRounds) || 0);
    const parsedTravel = Math.max(0, Number(travelDays) || 0);

    const base = role.dayRate * parsedDays;
    const revisionLoad = parsedRevisions * 125;
    const travelLoad = parsedTravel * 250;
    const rushLoad = rush ? Math.round(base * 0.2) : 0;
    const target = base + revisionLoad + travelLoad + rushLoad;

    return {
      min: Math.round(target * 0.9),
      target,
      stretch: Math.round(target * 1.15)
    };
  }, [days, revisionRounds, roleId, rush, travelDays]);

  return (
    <section className="screen rates-screen">
      <article className="rates-hero">
        <p className="eyebrow">Rates</p>
        <h2>Fair-rate assistant</h2>
        <p className="screen-copy">Estimate a grounded quote before accepting a project or contract revision.</p>
      </article>

      <article className="card">
        <p className="eyebrow">Project Inputs</p>
        <div className="form-grid">
          <label className="label">
            Role
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              {rolePresets.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          <label className="label">
            Work Days
            <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" />
          </label>

          <label className="label">
            Revision Rounds
            <input value={revisionRounds} onChange={(e) => setRevisionRounds(e.target.value)} inputMode="numeric" />
          </label>

          <label className="label">
            Travel Days
            <input value={travelDays} onChange={(e) => setTravelDays(e.target.value)} inputMode="numeric" />
          </label>
        </div>

        <label className="toggle">
          <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} />
          Rush turnaround (+20%)
        </label>
      </article>

      <article className="card">
        <p className="eyebrow">Quote Guidance</p>
        <h3>${quote.target.toLocaleString("en-US")} target</h3>
        <p className="muted">
          Floor: ${quote.min.toLocaleString("en-US")} · Stretch: ${quote.stretch.toLocaleString("en-US")}
        </p>
        <div className="chip-row">
          <span className="chip">Base Scope</span>
          <span className="chip">Negotiation Ready</span>
          {rush ? <span className="chip">Rush Premium Applied</span> : null}
        </div>
      </article>
    </section>
  );
}
