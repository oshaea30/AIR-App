"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { rolePresets } from "@/data/rates";
import { contractTemplates, negotiationScripts } from "@/data/toolkit";

export default function ToolkitPage() {
  const [roleId, setRoleId] = useState(rolePresets[0].id);
  const [days, setDays] = useState("3");
  const [copied, setCopied] = useState("");

  const quote = useMemo(() => {
    const role = rolePresets.find((item) => item.id === roleId) ?? rolePresets[0];
    const parsedDays = Math.max(1, Number(days) || 1);
    return Math.round(role.dayRate * parsedDays);
  }, [days, roleId]);

  async function copyText(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(""), 1400);
  }

  return (
    <section className="screen toolkit-screen">
      <article className="toolkit-hero">
        <p className="eyebrow">Toolkit</p>
        <h2>Contracts, rates, and scripts</h2>
        <p className="screen-copy">Use AIR-ready language to protect your rates, scope, and payment terms.</p>
      </article>

      <article className="card">
        <p className="eyebrow">Quick Rate Check</p>
        <h3>${quote.toLocaleString("en-US")} estimated</h3>
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
        </div>
        <div className="button-row">
          <Link className="button button-secondary" href="/rates">
            Open full rate assistant
          </Link>
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Contract Templates</p>
        <div className="stack">
          {contractTemplates.map((template) => (
            <section key={template.id} className="resource-item">
              <h3>{template.title}</h3>
              <p className="muted">{template.purpose}</p>
              <p className="fit">{template.clause}</p>
              <button className="button button-secondary" onClick={() => copyText(template.id, template.clause)}>
                {copied === template.id ? "Copied" : "Copy clause"}
              </button>
            </section>
          ))}
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Negotiation Scripts</p>
        <div className="stack">
          {negotiationScripts.map((script) => (
            <section key={script.id} className="resource-item">
              <h3>{script.title}</h3>
              <p className="fit">{script.script}</p>
              <button className="button button-secondary" onClick={() => copyText(script.id, script.script)}>
                {copied === script.id ? "Copied" : "Copy script"}
              </button>
            </section>
          ))}
        </div>
      </article>
    </section>
  );
}
