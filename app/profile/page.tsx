"use client";

import { useEffect, useState } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { DbMemberProfile, DbMentorCheckin } from "@/lib/types";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("Set profile preferences to improve opportunity ranking.");
  const [loading, setLoading] = useState(hasSupabaseConfig());
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("Audio, Editing");
  const [beats, setBeats] = useState("Culture, Investigative");
  const [payFloor, setPayFloor] = useState("600");
  const [mentorName, setMentorName] = useState("");
  const [mentorTopic, setMentorTopic] = useState("");
  const [mentorDate, setMentorDate] = useState("");
  const [checkins, setCheckins] = useState<DbMentorCheckin[]>([]);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setStatus("Add Supabase env vars and sign in to persist profile data.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user;
      if (!currentUser) {
        setStatus("Sign in on Auth tab to save your profile.");
        setLoading(false);
        return;
      }

      setUserId(currentUser.id);

      void Promise.all([
        (supabase.from("member_profiles") as any).select("*").eq("user_id", currentUser.id).maybeSingle(),
        (supabase.from("mentor_checkins") as any)
          .select("*")
          .eq("user_id", currentUser.id)
          .order("next_check_in", { ascending: true })
      ]).then(([profileRes, checkinRes]) => {
        if (!profileRes.error && profileRes.data) {
          const profile = profileRes.data as DbMemberProfile;
          setDisplayName(profile.display_name ?? "");
          setLocation(profile.location ?? "");
          setSkills((profile.skills ?? []).join(", "));
          setBeats((profile.beats ?? []).join(", "));
          setPayFloor(profile.pay_floor ? String(profile.pay_floor) : "");
        }

        if (!checkinRes.error && checkinRes.data) {
          setCheckins(checkinRes.data as unknown as DbMentorCheckin[]);
        }
        if (profileRes.error || checkinRes.error) {
          setError("Some profile data could not be loaded.");
        }
        setLoading(false);
      });
    });
  }, []);

  async function saveProfile() {
    if (!hasSupabaseConfig() || !userId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await (supabase.from("member_profiles") as any).upsert({
      user_id: userId,
      display_name: displayName || null,
      location: location || null,
      skills: skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      beats: beats
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      pay_floor: payFloor ? Number(payFloor) : null
    });

    setStatus(error ? "Profile save failed." : "Profile saved.");
  }

  async function addCheckin() {
    if (!hasSupabaseConfig() || !userId || !mentorName || !mentorTopic || !mentorDate) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const next = {
      id: `mentor-${crypto.randomUUID()}`,
      user_id: userId,
      mentor_name: mentorName,
      topic: mentorTopic,
      next_check_in: mentorDate,
      status: "Scheduled" as const
    };

    const { error } = await (supabase.from("mentor_checkins") as any).insert(next);
    if (error) {
      setStatus("Could not add mentor check-in.");
      return;
    }

    setCheckins((prev) => [...prev, { ...next, notes: null, created_at: new Date().toISOString() }]);
    setMentorName("");
    setMentorTopic("");
    setMentorDate("");
    setStatus("Mentor check-in scheduled.");
  }

  return (
    <section className="screen profile-screen">
      {loading ? <p className="status-banner info">Loading profile...</p> : null}
      {!loading && error ? <p className="status-banner error">{error}</p> : null}
      {!loading && !error ? <p className="status-banner success">Profile data ready.</p> : null}
      <article className="profile-hero">
        <p className="eyebrow">Profile</p>
        <h2>Your member settings</h2>
        <p className="screen-copy">Tune matching quality and keep mentorship follow-ups on track.</p>
        <p className="muted">{status}</p>
      </article>

      <article className="card">
        <p className="eyebrow">Preferences</p>
        <div className="form-grid">
          <input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
          <input placeholder="Beats (comma separated)" value={beats} onChange={(e) => setBeats(e.target.value)} />
          <input placeholder="Pay floor per day (USD)" value={payFloor} onChange={(e) => setPayFloor(e.target.value)} />
        </div>
        <button className="button" onClick={saveProfile}>
          Save Profile
        </button>
      </article>

      <article className="card">
        <p className="eyebrow">Mentor Workflow</p>
        <h3>Schedule Check-In</h3>
        <div className="form-grid">
          <input placeholder="Mentor name" value={mentorName} onChange={(e) => setMentorName(e.target.value)} />
          <input placeholder="Topic focus" value={mentorTopic} onChange={(e) => setMentorTopic(e.target.value)} />
          <input type="date" value={mentorDate} onChange={(e) => setMentorDate(e.target.value)} />
        </div>
        <button className="button" onClick={addCheckin}>
          Add Check-In
        </button>
      </article>

      <article className="card">
        <p className="eyebrow">Upcoming Mentorship</p>
        <ul className="simple-list">
          {checkins.length === 0 ? <li>No check-ins yet.</li> : null}
          {checkins.map((checkin) => (
            <li key={checkin.id}>
              <strong>{checkin.mentor_name}</strong> · {checkin.topic} on {checkin.next_check_in}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
