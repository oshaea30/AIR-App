"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearDemoSession } from "@/lib/member-session";
import { hasSupabaseConfig } from "@/lib/env";
import { getSessionUser } from "@/lib/member-session";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function MemberContext() {
  const [state, setState] = useState<"loading" | "signed_in" | "signed_out">("loading");
  const [email, setEmail] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    void getSessionUser().then((user) => {
      if (user?.email) {
        setEmail(user.email);
        setState("signed_in");
        return;
      }
      setState("signed_out");
    });
  }, []);

  const initials = useMemo(() => {
    if (!email) {
      return "ME";
    }
    return email.slice(0, 2).toUpperCase();
  }, [email]);

  if (state === "loading") {
    return <span className="member-pill ghost">Loading...</span>;
  }

  if (state === "signed_out") {
    return (
      <Link href="/auth" className="member-pill">
        Sign in
      </Link>
    );
  }

  async function handleSignOut() {
    if (busy) {
      return;
    }
    setBusy(true);
    if (hasSupabaseConfig()) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    }
    clearDemoSession();
    setState("signed_out");
    setEmail("");
    router.push("/auth");
    router.refresh();
    setBusy(false);
  }

  return (
    <button className="member-pill signed" onClick={handleSignOut}>
      <span className="member-avatar">{initials}</span>
      <span className="member-label">{busy ? "Signing out..." : "Sign out"}</span>
    </button>
  );
}
