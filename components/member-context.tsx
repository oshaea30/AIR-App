"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSessionUser } from "@/lib/member-session";

export function MemberContext() {
  const [state, setState] = useState<"loading" | "signed_in" | "signed_out">("loading");
  const [email, setEmail] = useState<string>("");

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

  return (
    <Link href="/auth" className="member-pill signed">
      <span className="member-avatar">{initials}</span>
      <span className="member-label">{email}</span>
    </Link>
  );
}
