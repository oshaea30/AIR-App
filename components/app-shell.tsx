"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { MemberContext } from "@/components/member-context";
import { NavTabs } from "@/components/nav-tabs";
import { getSessionUser } from "@/lib/member-session";

type Props = {
  children: ReactNode;
};

function BrandRibbon() {
  return (
    <section className="brand-ribbon">
      <div>
        <p className="top-kicker">Association of Independents in Radio</p>
        <h1 className="brand">Career OS</h1>
      </div>
      <div className="signal-motif" aria-hidden />
    </section>
  );
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "authed" | "guest">("loading");
  const publicRoutes = new Set(["/", "/auth"]);

  useEffect(() => {
    void getSessionUser().then((session) => {
      setAuthState(session ? "authed" : "guest");
    });
  }, [pathname]);

  useEffect(() => {
    if (authState !== "guest") {
      return;
    }
    if (publicRoutes.has(pathname)) {
      return;
    }
    router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
  }, [authState, pathname, router]);

  if (authState === "loading") {
    return (
      <main className="shell">
        <div className="mobile-frame guest-frame">
          <BrandRibbon />
          <p className="status-banner info">Checking access...</p>
        </div>
      </main>
    );
  }

  if (authState === "guest") {
    if (!publicRoutes.has(pathname)) {
      return (
        <main className="shell">
          <div className="mobile-frame guest-frame">
            <BrandRibbon />
            <p className="status-banner info">Redirecting to sign-in...</p>
          </div>
        </main>
      );
    }

    return (
      <main className="shell">
        <div className="mobile-frame guest-frame">
          <div className="guest-topbar">
            <div className="air-logo" aria-hidden>
              AIR
            </div>
            <Link href="/auth" className="member-pill">
              Sign in
            </Link>
          </div>
          <BrandRibbon />
          {children}
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <div className="air-logo" aria-hidden>
            AIR
          </div>
          <nav className="primary-nav">
            <Link href="/">Dashboard</Link>
            <Link href="/opportunities">Opportunities</Link>
            <Link href="/toolkit">Toolkit</Link>
            <Link href="/advocacy">Advocacy</Link>
            <Link href="/pipeline">Work Tracker</Link>
            <Link href="/profile">Profile</Link>
          </nav>
          <div className="top-actions">
            <MemberContext />
          </div>
        </div>
      </header>
      <main className="shell">
        <div className="mobile-frame">
          <BrandRibbon />
          {children}
          <NavTabs />
        </div>
      </main>
    </>
  );
}
