"use client";

import { useEffect, useMemo, useState } from "react";
import { OpportunityCard } from "@/components/opportunity-card";
import { opportunities as seededOpportunities, type Opportunity } from "@/data/opportunities";
import { hasSupabaseConfig } from "@/lib/env";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user;
      if (!currentUser) {
        setStatus("Sign in to save opportunities and personalize ranking.");
        setLoading(false);
        return;
      }
      setUserId(currentUser.id);

      void Promise.all([
        supabase.from("opportunities").select("*").order("deadline", { ascending: true }),
        (supabase.from("saved_opportunities") as any).select("*").eq("user_id", currentUser.id),
        (supabase.from("member_profiles") as any).select("*").eq("user_id", currentUser.id).limit(1).maybeSingle()
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
    if (!hasSupabaseConfig() || !userId) {
      setStatus("Sign in to save opportunities.");
      setActionMessage("Sign in required.");
      return;
    }

    const isSaved = savedIds.includes(opportunityId);
    const supabase = getSupabaseBrowserClient();

    if (isSaved) {
      const { error } = await (supabase.from("saved_opportunities") as any)
        .delete()
        .eq("user_id", userId)
        .eq("opportunity_id", opportunityId);
      if (!error) {
        setSavedIds((prev) => prev.filter((id) => id !== opportunityId));
        setActionMessage("Removed from saved.");
      }
    } else {
      const { error } = await (supabase.from("saved_opportunities") as any).insert({
        user_id: userId,
        opportunity_id: opportunityId
      });
      if (!error) {
        setSavedIds((prev) => [...prev, opportunityId]);
        setActionMessage("Saved opportunity.");
      }
    }
  }

  async function trackOpportunity(opportunity: Opportunity) {
    if (!hasSupabaseConfig() || !userId) {
      setStatus("Sign in to add opportunities directly to pipeline.");
      setActionMessage("Sign in required.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const estimatedValue = Number((opportunity.compensation.match(/\d[\d,]*/) ?? ["1500"])[0].replace(",", ""));

    const { error } = await (supabase.from("pipeline_items") as any).insert({
      id: `pipe-${crypto.randomUUID()}`,
      user_id: userId,
      title: opportunity.title,
      client: opportunity.org,
      due_date: opportunity.deadline,
      value: estimatedValue,
      stage: "To Pitch"
    });

    if (error) {
      setStatus("Could not add to pipeline. Try again.");
      setActionMessage("Add failed.");
      return;
    }

    setStatus(`Added "${opportunity.title}" to pipeline.`);
    setActionMessage("Added to pipeline.");
  }

  return (
    <section className="screen opportunities-screen">
      {loading ? <p className="status-banner info">Loading opportunities...</p> : null}
      {!loading && error ? <p className="status-banner error">{error}</p> : null}
      <article className="opps-hero">
        <p className="eyebrow">Today</p>
        <h2>Find your next assignment</h2>
        <p className="screen-copy">Ranked opportunities tuned to your profile and workflow.</p>
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
