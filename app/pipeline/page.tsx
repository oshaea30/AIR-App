"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultPipeline, stages, type PipelineItem, type PipelineStage } from "@/data/pipeline";
import { readDemoPipelineItems, writeDemoPipelineItems } from "@/lib/demo-store";
import { hasSupabaseConfig } from "@/lib/env";
import { getSessionUser, type SessionUser } from "@/lib/member-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { DbPipelineItem } from "@/lib/types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function mapPipelineFromDb(item: DbPipelineItem): PipelineItem {
  return {
    id: item.id,
    title: item.title,
    client: item.client,
    dueDate: item.due_date,
    value: Number(item.value),
    stage: item.stage
  };
}

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>(defaultPipeline);
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("Using seeded local data.");
  const [loading, setLoading] = useState(hasSupabaseConfig());
  const [error, setError] = useState("");
  const [session, setSession] = useState<SessionUser | null>(null);

  const totalValue = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);
  const bookedCount = useMemo(
    () => items.filter((item) => item.stage === "Booked" || item.stage === "Invoiced" || item.stage === "Paid").length,
    [items]
  );
  const paidCount = useMemo(() => items.filter((item) => item.stage === "Paid").length, [items]);

  useEffect(() => {
    void getSessionUser().then((activeSession) => {
      if (!activeSession) {
        setStatus("Sign in on the Auth tab to load your work tracker.");
        setLoading(false);
        return;
      }

      setSession(activeSession);

      if (activeSession.mode === "demo") {
        const localItems = readDemoPipelineItems();
        if (localItems.length > 0) {
          setItems(localItems);
        }
        setStatus("Demo mode active. Changes save on this device.");
        setLoading(false);
        return;
      }

      if (!hasSupabaseConfig()) {
        setStatus("Auth backend is not configured.");
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      setStatus("Loading your work tracker...");

      void (supabase.from("pipeline_items") as any)
        .select("*")
        .eq("user_id", activeSession.id)
        .order("due_date", { ascending: true })
        .then((result: { data: DbPipelineItem[] | null; error: { message: string } | null }) => {
          const pipelineRows = result.data;
          const error = result.error;
          if (error) {
            setStatus("Supabase unavailable, showing seeded local data.");
            setError("Could not load cloud work tracker data.");
            setLoading(false);
            return;
          }

          if (!pipelineRows || pipelineRows.length === 0) {
            setStatus("No saved items yet. Add one to start tracking your work.");
            setItems([]);
            setLoading(false);
            return;
          }

          setItems((pipelineRows as DbPipelineItem[]).map(mapPipelineFromDb));
          setStatus("Synced.");
          setLoading(false);
        });
    });
  }, []);

  useEffect(() => {
    if (session?.mode !== "demo") {
      return;
    }
    writeDemoPipelineItems(items);
  }, [items, session]);

  async function addItem() {
    if (!title || !client || !dueDate || !value) {
      return;
    }
    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue) || parsedValue <= 0) {
      return;
    }

    const newItem: PipelineItem = {
      id: `pipe-${crypto.randomUUID()}`,
      title,
      client,
      dueDate,
      value: parsedValue,
      stage: "To Pitch"
    };

    setItems((prev) => [newItem, ...prev]);
    setTitle("");
    setClient("");
    setDueDate("");
    setValue("");

    if (!session) {
      return;
    }

    if (session.mode === "demo") {
      setStatus("Saved in demo mode.");
      return;
    }

    if (!hasSupabaseConfig()) {
      setStatus("Auth backend is not configured.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await (supabase.from("pipeline_items") as any).insert({
      id: newItem.id,
      user_id: session.id,
      title: newItem.title,
      client: newItem.client,
      due_date: newItem.dueDate,
      value: newItem.value,
      stage: newItem.stage
    });

    if (error) {
      setStatus("Save failed in Supabase. Local item kept.");
    } else {
      setStatus("Saved to Supabase.");
    }
  }

  async function moveStage(id: string, stage: PipelineStage) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, stage } : item)));

    if (!session) {
      return;
    }

    if (session.mode === "demo") {
      setStatus("Status updated in demo mode.");
      return;
    }

    if (!hasSupabaseConfig()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await (supabase.from("pipeline_items") as any)
      .update({ stage })
      .eq("id", id)
      .eq("user_id", session.id);

    if (error) {
      setStatus("Stage update failed in Supabase. Refresh to verify.");
    } else {
      setStatus("Stage updated.");
    }
  }

  return (
    <section className="screen pipeline-screen">
      {loading ? <p className="status-banner info">Loading your work tracker...</p> : null}
      {!loading && error ? <p className="status-banner error">{error}</p> : null}
      <article className="pipeline-hero">
        <p className="eyebrow">Work Tracker</p>
        <h2>Move projects to paid</h2>
        <p className="screen-copy">Track each project from first contact to payment in one clear list.</p>
        <div className="chip-row">
          <span className="chip">Booked {bookedCount}</span>
          <span className="chip">Paid {paidCount}</span>
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Progress</p>
        <h3>{formatMoney(totalValue)} in potential value</h3>
        <p className="muted">{items.length} active items tracked.</p>
        <p className="muted">{status}</p>
      </article>

      <article className="card">
        <h3>Add Opportunity</h3>
        <div className="form-grid">
          <input placeholder="Story or project title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input placeholder="Client or outlet" value={client} onChange={(e) => setClient(e.target.value)} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <input
            placeholder="Estimated value (USD)"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <button className="button" onClick={addItem}>
          Add to Work Tracker
        </button>
      </article>

      <div className="stack">
        {items.map((item) => (
          <article key={item.id} className="card">
            <div className="row-between">
              <h3>{item.title}</h3>
              <p className="pay">{formatMoney(item.value)}</p>
            </div>
            <p className="muted">
              {item.client} · Due {item.dueDate}
            </p>
            <p className={`stage-badge stage-${item.stage.toLowerCase().replace(" ", "-")}`}>{item.stage}</p>
            <label className="label">
              Status
              <select value={item.stage} onChange={(e) => moveStage(item.id, e.target.value as PipelineStage)}>
                {stages.map((stageName) => (
                  <option key={stageName} value={stageName}>
                    {stageName}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}
