"use client";

import { useEffect, useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { opportunities as seededOpportunities, type Opportunity } from "@/data/opportunities";
import { readDemoPipelineItems, readDemoSavedIds, writeDemoPipelineItems, writeDemoSavedIds } from "@/lib/demo-store";
import { hasSupabaseConfig } from "@/lib/env";
import { getSessionUser, type SessionUser } from "@/lib/member-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { DbMemberProfile, DbOpportunity, DbSavedOpportunity } from "@/lib/types";

function rankOpportunity(opportunity: Opportunity, profileSkills: string[]) {
  const normalizedSkills = profileSkills.map((skill) => skill.toLowerCase());
  const matchingTags = opportunity.tags.filter((tag) => normalizedSkills.includes(tag.toLowerCase())).length;
  const score = Math.min(100, 40 + matchingTags * 20);
  return score;
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(seededOpportunities);
  const [status, setStatus] = useState("Showing seeded opportunities.");
  const [loading, setLoading] = useState(hasSupabaseConfig());
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [activeType, setActiveType] = useState<Opportunity["type"] | "All">("All");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);

  useEffect(() => {
    void getSessionUser().then((activeSession) => {
      if (!activeSession) {
        if (!hasSupabaseConfig()) {
          setStatus("No sign-in found. Showing demo opportunities.");
        }
        setLoading(false);
        return;
      }

      setSession(activeSession);

      if (activeSession.mode === "demo") {
        setSavedIds(readDemoSavedIds());
        setStatus("Demo mode active. Changes save on this device.");
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      void Promise.all([
        supabase.from("opportunities").select("*").order("deadline", { ascending: true }),
        (supabase.from("saved_opportunities") as any).select("*").eq("user_id", activeSession.id),
        (supabase.from("member_profiles") as any).select("*").eq("user_id", activeSession.id).limit(1).maybeSingle()
      ]).then(([oppRes, savedRes, profileRes]) => {
        if (!oppRes.error && oppRes.data && oppRes.data.length > 0) {
          const rows = oppRes.data as unknown as DbOpportunity[];
          const mapped = rows.map((item) => ({
            id: item.id,
            title: item.title,
            org: item.org,
            type: item.type,
            location: item.location,
            compensation: item.compensation,
            deadline: item.deadline,
            tags: item.tags,
            matchReason: item.match_reason
          }));
          setOpportunities(mapped);
          setStatus("Loaded from Supabase.");
        } else if (oppRes.error) {
          setStatus("Supabase unavailable, showing seeded opportunities.");
          setError("Could not load cloud opportunities.");
        }

        if (!savedRes.error && savedRes.data) {
          const rows = savedRes.data as unknown as DbSavedOpportunity[];
          setSavedIds(rows.map((row) => row.opportunity_id));
        }

        if (!profileRes.error && profileRes.data) {
          const profile = profileRes.data as unknown as DbMemberProfile;
          setProfileSkills(profile.skills ?? []);
        }

        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (session?.mode !== "demo") {
      return;
    }
    writeDemoSavedIds(savedIds);
  }, [savedIds, session]);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }
    const timer = window.setTimeout(() => setActionMessage(""), 1600);
    return () => window.clearTimeout(timer);
  }, [actionMessage]);

  const visibleOpportunities = useMemo(() => {
    return opportunities
      .filter((opportunity) => (activeType === "All" ? true : opportunity.type === activeType))
      .filter((opportunity) => {
        const target = `${opportunity.title} ${opportunity.org} ${opportunity.tags.join(" ")}`.toLowerCase();
        return target.includes(query.toLowerCase());
      })
      .filter((opportunity) => (savedOnly ? savedIds.includes(opportunity.id) : true))
      .sort((a, b) => rankOpportunity(b, profileSkills) - rankOpportunity(a, profileSkills));
  }, [activeType, opportunities, profileSkills, query, savedOnly, savedIds]);

  async function toggleSave(opportunityId: string) {
    if (!session) {
      setStatus("Sign in to save opportunities.");
      setActionMessage("Sign in required.");
      return;
    }

    if (session.mode === "demo") {
      const isSaved = savedIds.includes(opportunityId);
      if (isSaved) {
        setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
        setActionMessage("Removed from saved.");
      } else {
        setSavedIds((prev) => [...prev, opportunityId]);
        setActionMessage("Saved opportunity.");
      }
      return;
    }

    if (!hasSupabaseConfig()) {
      setStatus("Auth backend is not configured.");
      return;
    }

    const isSaved = savedIds.includes(opportunityId);
    const supabase = getSupabaseBrowserClient();

    if (isSaved) {
      const { error } = await (supabase.from("saved_opportunities") as any)
        .delete()
        .eq("user_id", session.id)
        .eq("opportunity_id", opportunityId);
      if (!error) {
        setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
        setActionMessage("Removed from saved.");
      }
    } else {
      const { error } = await (supabase.from("saved_opportunities") as any).insert({
        user_id: session.id,
        opportunity_id: opportunityId
      });
      if (!error) {
        setSavedIds((prev) => [...prev, opportunityId]);
        setActionMessage("Saved opportunity.");
      }
    }
  }

  async function trackOpportunity(opportunity: Opportunity) {
    if (!session) {
      setStatus("Sign in to add this to your work tracker.");
      setActionMessage("Sign in required.");
      return;
    }

    const estimatedValue = Number((opportunity.compensation.match(/\d[\d,]*/) ?? ["1500"])[0].replace(",", ""));

    if (session.mode === "demo") {
      const pipelineItems = readDemoPipelineItems();
      pipelineItems.unshift({
        id: `pipe-${crypto.randomUUID()}`,
        title: opportunity.title,
        client: opportunity.org,
        dueDate: opportunity.deadline,
        value: estimatedValue,
        stage: "To Pitch"
      });
      writeDemoPipelineItems(pipelineItems);
      setStatus(`Added "${opportunity.title}" to your work tracker.`);
      setActionMessage("Added to work tracker.");
      return;
    }

    if (!hasSupabaseConfig()) {
      setStatus("Auth backend is not configured.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await (supabase.from("pipeline_items") as any).insert({
      id: `pipe-${crypto.randomUUID()}`,
      user_id: session.id,
      title: opportunity.title,
      client: opportunity.org,
      due_date: opportunity.deadline,
      value: estimatedValue,
      stage: "To Pitch"
    });

    if (error) {
      setStatus("Could not add to work tracker. Try again.");
      setActionMessage("Add failed.");
      return;
    }

    setStatus(`Added "${opportunity.title}" to your work tracker.`);
    setActionMessage("Added to work tracker.");
  }

  return (
    <section className="screen opportunities-screen">
      {loading ? <p className="status-banner info">Loading opportunities...</p> : null}
      {!loading && error ? <p className="status-banner error">{error}</p> : null}
      <article className="opps-hero">
        <p className="eyebrow">Today</p>
        <h2>Find your next assignment</h2>
        <p className="screen-copy">Ranked opportunities tuned to your profile and goals.</p>
        <div className="opps-pills">
          <span className="opps-pill active">Matches</span>
          <span className="opps-pill muted">Calendar soon</span>
          <span className="opps-pill muted">+ New soon</span>
        </div>
      </article>

      <article className="card opps-controls">
        <p className="eyebrow">Search</p>
        <input
          className="opps-search"
          placeholder="Search title, organization, or tag"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="toggle opps-toggle">
          <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
          Show saved only
        </label>
        <p className="muted">{status}</p>
      </article>

      <div className="chip-row opps-filters">
        {(["All", "Job", "Grant", "Pitch Call", "Fellowship"] as const).map((type) => (
          <button
            key={type}
            className={activeType === type ? "chip chip-button active" : "chip chip-button"}
            onClick={() => setActiveType(type)}
          >
            {type}
          </button>
        ))}
        <span className="chip">{savedIds.length} saved</span>
      </div>

      <div className="stack opps-stack">
        {actionMessage ? <p className="action-toast">{actionMessage}</p> : null}
        {visibleOpportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            saved={savedIds.includes(opportunity.id)}
            fitScore={rankOpportunity(opportunity, profileSkills)}
            onToggleSave={toggleSave}
            onTrack={trackOpportunity}
          />
        ))}
        {visibleOpportunities.length === 0 ? (
          <article className="card">
            <h3>No matches for this filter yet</h3>
            <p className="muted">Try switching category or updating profile skills.</p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
