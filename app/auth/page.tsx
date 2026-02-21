"use client";

import { useEffect, useState } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("Sign in to sync personal pipeline data.");
  const [loading, setLoading] = useState(hasSupabaseConfig());

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setStatus("Add Supabase env vars to enable authentication.");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      setSessionEmail(data.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  async function signIn() {
    if (!hasSupabaseConfig()) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus(error.message);
      return;
    }
    setSessionEmail(data.user.email ?? null);
    setStatus("Signed in successfully.");
  }

  async function signUp() {
    if (!hasSupabaseConfig()) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Account created. Check email verification settings in Supabase.");
  }

  async function signOut() {
    if (!hasSupabaseConfig()) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus(error.message);
      return;
    }
    setSessionEmail(null);
    setStatus("Signed out.");
  }

  return (
    <section className="screen auth-screen">
      {loading ? <p className="status-banner info">Loading auth status...</p> : null}
      {!loading && sessionEmail ? <p className="status-banner success">Session active.</p> : null}
      <article className="auth-hero">
        <p className="eyebrow">Access</p>
        <h2>Member authentication</h2>
        <p className="screen-copy">Use your AIR account to sync pipeline, saved opportunities, and profile settings.</p>
        <p className="muted">{status}</p>
      </article>

      <article className="card">
        <p className="eyebrow">Session</p>
        <h3>Account Session</h3>
        <p className="muted">{sessionEmail ? `Signed in as ${sessionEmail}` : "No active session."}</p>
      </article>

      <article className="card">
        <p className="eyebrow">Secure Access</p>
        <h3>Email + Password</h3>
        <div className="form-grid">
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="button-row">
          <button className="button button-secondary" onClick={signUp}>
            Create Account
          </button>
          <button className="button" onClick={signIn}>
            Sign In
          </button>
        </div>
        <button className="button ghost" onClick={signOut}>
          Sign Out
        </button>
      </article>
    </section>
  );
}
