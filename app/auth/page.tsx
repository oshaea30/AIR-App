"use client";

import { useEffect, useState } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { clearDemoSession, getSessionUser, isDemoAuthEnabled, setDemoSession, type SessionUser } from "@/lib/member-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState("Sign in to sync your saved work data.");
  const [loading, setLoading] = useState(true);
  const demoEnabled = isDemoAuthEnabled();

  useEffect(() => {
    void getSessionUser().then((user) => {
      setSession(user);
      if (!hasSupabaseConfig() && !demoEnabled) {
        setStatus("Add Supabase env vars to enable authentication.");
      }
      setLoading(false);
    });
  }, [demoEnabled]);

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
    clearDemoSession();
    setSession({
      id: data.user.id,
      email: data.user.email ?? "",
      mode: "supabase"
    });
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
    if (hasSupabaseConfig()) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus(error.message);
        return;
      }
    }
    clearDemoSession();
    setSession(null);
    setStatus("Signed out.");
  }

  function signInDemo() {
    if (!demoEnabled) {
      return;
    }
    const demoEmail = email.trim() || "demo@airmembers.org";
    const demoUser = setDemoSession(demoEmail);
    if (!demoUser) {
      setStatus("Demo mode is not enabled.");
      return;
    }
    setSession(demoUser);
    setStatus("Demo session active. Data saves to this browser.");
  }

  return (
    <section className="screen auth-screen">
      {loading ? <p className="status-banner info">Loading auth status...</p> : null}
      {!loading && session ? <p className="status-banner success">Session active.</p> : null}
      <article className="auth-hero">
        <p className="eyebrow">Access</p>
        <h2>Member authentication</h2>
        <p className="screen-copy">Use your AIR account to sync your work tracker, saved opportunities, and profile settings.</p>
        <p className="muted">{status}</p>
      </article>

      <article className="card">
        <p className="eyebrow">Session</p>
        <h3>Account Session</h3>
        <p className="muted">
          {session ? `Signed in as ${session.email}${session.mode === "demo" ? " (Demo)" : ""}` : "No active session."}
        </p>
      </article>

      {hasSupabaseConfig() ? (
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
      ) : null}

      {demoEnabled ? (
        <article className="card">
          <p className="eyebrow">Test Access</p>
          <h3>Demo Sign-In</h3>
          <p className="muted">Use this for your small tester group. Demo data is saved in this browser only.</p>
          <div className="button-row">
            <button className="button" onClick={signInDemo}>
              Enter Demo
            </button>
            <button className="button ghost" onClick={signOut}>
              Exit Demo
            </button>
          </div>
        </article>
      ) : null}

      {!hasSupabaseConfig() && !demoEnabled ? (
        <article className="card">
          <p className="eyebrow">Setup</p>
          <h3>Authentication not configured</h3>
          <p className="muted">Add Supabase keys or enable demo mode with NEXT_PUBLIC_ENABLE_DEMO_AUTH=true.</p>
        </article>
      ) : null}
    </section>
  );
}
