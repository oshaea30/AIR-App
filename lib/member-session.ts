"use client";

import { hasSupabaseConfig } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export type SessionUser = {
  id: string;
  email: string;
  mode: "supabase" | "demo";
};

const DEMO_SESSION_KEY = "air-demo-session-v1";

export function isDemoAuthEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_AUTH !== "false";
}

export function getDemoSession(): SessionUser | null {
  if (typeof window === "undefined" || !isDemoAuthEnabled()) {
    return null;
  }
  const raw = localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as { id?: string; email?: string };
    if (!parsed.id || !parsed.email) {
      return null;
    }
    return { id: parsed.id, email: parsed.email, mode: "demo" };
  } catch {
    return null;
  }
}

export function setDemoSession(email = "demo@airmembers.org") {
  if (typeof window === "undefined" || !isDemoAuthEnabled()) {
    return null;
  }

  const session = {
    id: "demo-user",
    email,
    mode: "demo" as const
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearDemoSession() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (hasSupabaseConfig()) {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id && data.user.email) {
      return {
        id: data.user.id,
        email: data.user.email,
        mode: "supabase"
      };
    }
  }

  return getDemoSession();
}
