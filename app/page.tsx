"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { readDemoCheckins, readDemoPipelineItems, readDemoSavedIds } from "@/lib/demo-store";
import { opportunities as seededOpportunities } from "@/data/opportunities";
import { defaultPipeline } from "@/data/pipeline";
import { hasSupabaseConfig } from "@/lib/env";
import { getSessionUser, type SessionUser } from "@/lib/member-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { DbMentorCheckin, DbOpportunity, DbPipelineItem, DbSavedOpportunity } from "@/lib/types";

const defaultTasks = [
  "Send 2 pitch follow-ups",
  "Review one contract with rate floor",
  "Schedule or confirm coaching check-in"
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function daysUntil(date: string) {
  const target = new Date(date);
  const now = new Date();
  const msInDay = 1000 * 60 * 60 * 24;
  return Math.ceil((target.getTime() - now.getTime()) / msInDay);
}

export default function HomePage() {
  const [opportunityCount, setOpportunityCount] = useState(seededOpportunities.length);
  const [pipelineItems, setPipelineItems] = useState(defaultPipeline);
  const [savedCount, setSavedCount] = useState(0);
  const [nextDeadline, setNextDeadline] = useState(
    seededOpportunities.map((opportunity) => opportunity.deadline).sort((a, b) => a.localeCompare(b))[0]
  );
  const [mentorCheckins, setMentorCheckins] = useState<DbMentorCheckin[]>([]);
  const [notifyStatus, setNotifyStatus] = useState("Notifications off");
  const [actionStatus, setActionStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [taskDone, setTaskDone] = useState<Record<string, boolean>>(
    Object.fromEntries(defaultTasks.map((task) => [task, false]))
  );
  const [reminderDone, setReminderDone] = useState<Record<string, boolean>>({});

  const pipelineValue = useMemo(() => pipelineItems.reduce((sum, item) => sum + Number(item.value), 0), [pipelineItems]);
  const dueSoonPipeline = useMemo(
    () => pipelineItems.filter((item) => item.stage !== "Paid" && daysUntil(item.dueDate) <= 7).slice(0, 3),
    [pipelineItems]
  );
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "To Pitch": 0,
      Applied: 0,
      Interview: 0,
      Booked: 0,
      Invoiced: 0,
      Paid: 0
    };
    pipelineItems.forEach((item) => {
      counts[item.stage] += 1;
    });
    return counts;
  }, [pipelineItems]);

  const reminders = useMemo(() => {
    const reminderList: Array<{ id: string; text: string }> = [];

    const nextOpportunityDueIn = daysUntil(nextDeadline);
    if (nextOpportunityDueIn <= 7) {
      reminderList.push({
        id: `opp-deadline-${nextDeadline}`,
        text: `Opportunity deadline in ${nextOpportunityDueIn} day(s) (${nextDeadline}).`
      });
    }

    dueSoonPipeline.forEach((item) => {
      reminderList.push({
        id: `pipeline-${item.id}`,
        text: `Work follow-up: ${item.title} is due by ${item.dueDate}.`
      });
    });

    mentorCheckins.slice(0, 2).forEach((checkin) => {
      const days = daysUntil(checkin.next_check_in);
      if (days <= 7) {
        reminderList.push({
          id: `mentor-${checkin.id}`,
          text: `Coaching check-in with ${checkin.mentor_name} in ${days} day(s).`
        });
      }
    });

    return reminderList.length > 0
      ? reminderList
      : [{ id: "no-urgent", text: "No urgent reminders. Use today for outreach and profile updates." }];
  }, [dueSoonPipeline, mentorCheckins, nextDeadline]);

  const focusScore = useMemo(() => {
    const doneTaskCount = Object.values(taskDone).filter(Boolean).length;
    const doneReminderCount = reminders.filter((item) => reminderDone[item.id]).length;
    const total = defaultTasks.length + reminders.length;
    const done = doneTaskCount + doneReminderCount;
    return Math.round((done / total) * 100);
  }, [taskDone, reminders, reminderDone]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifyStatus(`Notifications: ${Notification.permission}`);
    } else {
      setNotifyStatus("Notifications unsupported in this browser.");
    }

    void getSessionUser().then((activeSession) => {
      setSession(activeSession);
      if (!activeSession) {
        setLoading(false);
        return;
      }

      if (activeSession.mode === "demo") {
        const demoPipeline = readDemoPipelineItems();
        const demoSaved = readDemoSavedIds();
        const demoCheckins = readDemoCheckins();
        if (demoPipeline.length > 0) {
          setPipelineItems(demoPipeline);
        }
        setSavedCount(demoSaved.length);
        setMentorCheckins(demoCheckins);
        setLoading(false);
        return;
      }

      if (!hasSupabaseConfig()) {
        setLoading(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const sharedQueries = [supabase.from("opportunities").select("*").order("deadline", { ascending: true })];
      const userQueries = [
        (supabase.from("pipeline_items") as any).select("*").eq("user_id", activeSession.id),
        (supabase.from("saved_opportunities") as any).select("*").eq("user_id", activeSession.id),
        (supabase.from("mentor_checkins") as any)
          .select("*")
          .eq("user_id", activeSession.id)
          .eq("status", "Scheduled")
          .order("next_check_in", { ascending: true })
      ];

      void Promise.all([...sharedQueries, ...userQueries]).then((results) => {
        const [oppRes, pipelineRes, savedRes, mentorRes] = results as any[];

        if (oppRes.error) {
          setError("Could not load opportunities from cloud.");
        }
        if (!oppRes.error && oppRes.data && oppRes.data.length > 0) {
          const oppData = oppRes.data as DbOpportunity[];
          setOpportunityCount(oppData.length);
          setNextDeadline(oppData[0].deadline);
        }

        if (pipelineRes && !pipelineRes.error && pipelineRes.data) {
          const rows = pipelineRes.data as DbPipelineItem[];
          setPipelineItems(
            rows.map((row) => ({
              id: row.id,
              title: row.title,
              client: row.client,
              dueDate: row.due_date,
              value: Number(row.value),
              stage: row.stage
            }))
          );
        }
        if (pipelineRes?.error) {
          setError("Could not load work tracker data from cloud.");
        }

        if (savedRes && !savedRes.error && savedRes.data) {
          setSavedCount((savedRes.data as DbSavedOpportunity[]).length);
        }

        if (mentorRes && !mentorRes.error && mentorRes.data) {
          setMentorCheckins(mentorRes.data as DbMentorCheckin[]);
        }

        setLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    if (session?.mode !== "demo") {
      return;
    }
    setSavedCount(readDemoSavedIds().length);
    const localPipeline = readDemoPipelineItems();
    if (localPipeline.length > 0) {
      setPipelineItems(localPipeline);
    }
    setMentorCheckins(readDemoCheckins());
  }, [session]);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storedTaskDone = localStorage.getItem(`air-task-done-${todayKey}`);
    const storedReminderDone = localStorage.getItem(`air-reminder-done-${todayKey}`);
    if (storedTaskDone) {
      setTaskDone(JSON.parse(storedTaskDone) as Record<string, boolean>);
    }
    if (storedReminderDone) {
      setReminderDone(JSON.parse(storedReminderDone) as Record<string, boolean>);
    }
  }, []);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`air-task-done-${todayKey}`, JSON.stringify(taskDone));
  }, [taskDone]);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`air-reminder-done-${todayKey}`, JSON.stringify(reminderDone));
  }, [reminderDone]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 11) {
      return;
    }
    const todayKey = now.toISOString().slice(0, 10);
    const digestKey = `air-digest-sent-${todayKey}`;
    if (localStorage.getItem(digestKey)) {
      return;
    }
    new Notification("AIR Daily Briefing", {
      body: reminders[0]?.text ?? "Your daily dashboard is ready."
    });
    localStorage.setItem(digestKey, "true");
    setActionStatus("Morning digest sent.");
  }, [reminders]);

  async function enableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifyStatus(`Notifications: ${permission}`);
    if (permission === "granted") {
      new Notification("AIR Career OS", {
        body: reminders[0]?.text ?? "Daily briefing ready."
      });
      setActionStatus("Notifications enabled.");
    }
  }

  function toggleTask(task: string) {
    setTaskDone((prev) => ({ ...prev, [task]: !prev[task] }));
    setActionStatus(`Updated task: ${task}`);
  }

  function toggleReminder(reminderId: string) {
    setReminderDone((prev) => ({ ...prev, [reminderId]: !prev[reminderId] }));
    setActionStatus("Reminder updated.");
  }

  return (
    <section className="screen dashboard-screen">
      {loading ? <p className="status-banner info">Loading dashboard data...</p> : null}
      {!loading && error ? <p className="status-banner error">{error}</p> : null}
      <article className="hero-card">
        <p className="eyebrow">Daily Briefing</p>
        <h2>Career Dashboard</h2>
        <p className="screen-copy">One place to prioritize opportunities, deadlines, and coaching follow-through.</p>
        <div className="meter-row">
          <p className="meter-label">Focus Score</p>
          <p className="meter-value">{focusScore}%</p>
        </div>
        <div className="meter-track">
          <span className="meter-fill" style={{ width: `${focusScore}%` }} />
        </div>
      </article>

      <div className="stats-grid">
        <StatCard label="Open Opportunities" value={`${opportunityCount}`} note="Current listings" tone="highlight" />
        <StatCard label="Expected Earnings" value={formatMoney(pipelineValue)} note="Active work value" />
        <StatCard label="Saved Opportunities" value={`${savedCount}`} note="Ready for follow-up" />
      </div>

      <article className="card">
        <p className="eyebrow">Priority Sprint</p>
        <h3>Today&apos;s Must-Do List</h3>
        <div className="task-list">
          {defaultTasks.map((task) => (
            <button
              key={task}
              className={taskDone[task] ? "task-item done" : "task-item"}
              onClick={() => toggleTask(task)}
            >
              <span>{taskDone[task] ? "Done" : "Open"}</span>
              <strong>{task}</strong>
            </button>
          ))}
        </div>
        <div className="task-list">
          {reminders.map((item) => (
            <button
              key={item.id}
              className={reminderDone[item.id] ? "task-item done" : "task-item"}
              onClick={() => toggleReminder(item.id)}
            >
              <span>{reminderDone[item.id] ? "Done" : "Open"}</span>
              <strong>{item.text}</strong>
            </button>
          ))}
        </div>
        <p className="muted">{notifyStatus}</p>
        {actionStatus ? <p className="muted">{actionStatus}</p> : null}
        <button className="button button-secondary" onClick={enableNotifications}>
          Enable Browser Reminders
        </button>
      </article>

      <article className="card">
        <p className="eyebrow">Member Essentials</p>
        <h3>Daily AIR tools</h3>
        <div className="button-row">
          <Link className="button button-secondary" href="/toolkit">
            Open contract and rate toolkit
          </Link>
          <Link className="button button-secondary" href="/advocacy">
            Open fair-practice tracker
          </Link>
          <Link className="button button-secondary" href="/pipeline">
            Open work tracker
          </Link>
          <Link className="button button-secondary" href="/rates">
            Open full rate assistant
          </Link>
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Work Tracker</p>
        <h3>Stage Distribution</h3>
        <div className="distribution-list">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <div key={stage} className="distribution-row">
              <p>{stage}</p>
              <div className="distribution-bar">
                <span style={{ width: `${pipelineItems.length ? (count / pipelineItems.length) * 100 : 0}%` }} />
              </div>
              <p>{count}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="card">
        <p className="eyebrow">Coaching</p>
        <h3>Upcoming Check-Ins</h3>
        <ul className="simple-list">
          {mentorCheckins.length === 0 ? <li>No scheduled check-ins yet. Add one in Profile.</li> : null}
          {mentorCheckins.slice(0, 3).map((checkin) => (
            <li key={checkin.id}>
              <strong>{checkin.mentor_name}</strong> · {checkin.topic} on {checkin.next_check_in}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
