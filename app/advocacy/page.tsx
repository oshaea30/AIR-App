"use client";

import { useEffect, useState } from "react";

type AdvocacyIssue = {
  id: string;
  type: string;
  org: string;
  details: string;
  createdAt: string;
};

type PledgeState = {
  fairRate: boolean;
  writtenTerms: boolean;
  paymentFollowup: boolean;
};

const ISSUE_KEY = "air-advocacy-issues-v1";
const PLEDGE_KEY = "air-advocacy-pledge-v1";

const defaultPledge: PledgeState = {
  fairRate: false,
  writtenTerms: false,
  paymentFollowup: false
};

export default function AdvocacyPage() {
  const [issueType, setIssueType] = useState("Low pay");
  const [org, setOrg] = useState("");
  const [details, setDetails] = useState("");
  const [issues, setIssues] = useState<AdvocacyIssue[]>([]);
  const [pledge, setPledge] = useState<PledgeState>(defaultPledge);
  const [status, setStatus] = useState("Track common issues and collective progress.");

  useEffect(() => {
    const rawIssues = localStorage.getItem(ISSUE_KEY);
    const rawPledge = localStorage.getItem(PLEDGE_KEY);
    if (rawIssues) {
      try {
        setIssues(JSON.parse(rawIssues) as AdvocacyIssue[]);
      } catch {
        setIssues([]);
      }
    }
    if (rawPledge) {
      try {
        setPledge(JSON.parse(rawPledge) as PledgeState);
      } catch {
        setPledge(defaultPledge);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ISSUE_KEY, JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem(PLEDGE_KEY, JSON.stringify(pledge));
  }, [pledge]);

  function submitIssue() {
    if (!details.trim()) {
      setStatus("Add a short description before submitting.");
      return;
    }

    const next: AdvocacyIssue = {
      id: crypto.randomUUID(),
      type: issueType,
      org: org.trim() || "Not provided",
      details: details.trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setIssues((prev) => [next, ...prev]);
    setOrg("");
    setDetails("");
    setStatus("Issue logged. This helps identify recurring member needs.");
  }

  function togglePledge(key: keyof PledgeState) {
    setPledge((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const pledgeCount = Object.values(pledge).filter(Boolean).length;

  return (
    <section className="screen advocacy-screen">
      <article className="advocacy-hero">
        <p className="eyebrow">Advocacy</p>
        <h2>Fair practice tracker</h2>
        <p className="screen-copy">Capture field issues, reinforce healthy standards, and surface patterns AIR can act on.</p>
      </article>

      <article className="card">
        <p className="eyebrow">Collective Pulse</p>
        <h3>{issues.length} issues logged</h3>
        <p className="muted">{pledgeCount}/3 fair-practice actions completed this week.</p>
      </article>

      <article className="card">
        <p className="eyebrow">Log an Issue</p>
        <div className="form-grid">
          <label className="label">
            Issue type
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
              <option>Low pay</option>
              <option>Late payment</option>
              <option>Rights grab</option>
              <option>Scope creep</option>
              <option>No contract</option>
            </select>
          </label>
          <label className="label">
            Organization (optional)
            <input placeholder="Outlet or client name" value={org} onChange={(e) => setOrg(e.target.value)} />
          </label>
        </div>
        <label className="label">
          What happened?
          <input placeholder="Short summary" value={details} onChange={(e) => setDetails(e.target.value)} />
        </label>
        <button className="button" onClick={submitIssue}>
          Submit issue
        </button>
        <p className="muted">{status}</p>
      </article>

      <article className="card">
        <p className="eyebrow">Weekly Fair-Practice Checklist</p>
        <div className="task-list">
          <button className={pledge.fairRate ? "task-item done" : "task-item"} onClick={() => togglePledge("fairRate")}>
            <span>{pledge.fairRate ? "Done" : "Open"}</span>
            <strong>Used or shared a fair rate floor</strong>
          </button>
          <button
            className={pledge.writtenTerms ? "task-item done" : "task-item"}
            onClick={() => togglePledge("writtenTerms")}
          >
            <span>{pledge.writtenTerms ? "Done" : "Open"}</span>
            <strong>Requested written terms before kickoff</strong>
          </button>
          <button
            className={pledge.paymentFollowup ? "task-item done" : "task-item"}
            onClick={() => togglePledge("paymentFollowup")}
          >
            <span>{pledge.paymentFollowup ? "Done" : "Open"}</span>
            <strong>Followed up on at least one overdue invoice</strong>
          </button>
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Recent Wins</p>
        <ul className="simple-list">
          <li>Members adopted late-fee language in new contracts.</li>
          <li>More projects now include revision limits in writing.</li>
          <li>Fair-rate conversations started earlier in deal cycles.</li>
        </ul>
      </article>
    </section>
  );
}
