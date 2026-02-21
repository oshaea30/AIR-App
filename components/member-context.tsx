"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function MemberContext() {
  const [state, setState] = useState<"loading" | "signed_in" | "signed_out" | "local_mode">("loading");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setState("local_mode");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
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

  if (state === "local_mode") {
    return <span className="member-pill ghost">Local Mode</span>;
  }

  if (state === "signed_out") {
    return (
      <Link href="/auth" className="member-pill">
        Sign in
      </Link>
    );
  }

  return (
    <Link href="/auth" className="member-pill signed">
      <span className="member-avatar">{initials}</span>
      <span className="member-label">{email}</span>
    </Link>
  );
}
