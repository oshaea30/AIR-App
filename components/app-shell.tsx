"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AirLogo } from "@/components/air-logo";
import { MemberContext } from "@/components/member-context";
import { NavTabs } from "@/components/nav-tabs";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const publicRoutes = new Set(["/", "/auth"]);
  const mainLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/toolkit", label: "Toolkit" },
    { href: "/pipeline", label: "Work Tracker" }
  ];
  const moreLinks = [
    { href: "/advocacy", label: "Advocacy" },
    { href: "/profile", label: "Profile" },
    { href: "/rates", label: "Rates" }
  ];

  useEffect(() => {
    void getSessionUser().then((session) => {
      setAuthState(session ? "authed" : "guest");
    });
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const saved = localStorage.getItem("air-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("air-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (authState === "authed" && pathname === "/auth") {
      router.replace("/");
      return;
    }
    if (authState !== "guest") {
      return;
    }
    if (publicRoutes.has(pathname)) {
      return;
    }
    router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
  }, [authState, pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

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
            <AirLogo variant={theme === "dark" ? "white" : "coral"} />
            <div className="top-actions">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <Link href="/auth" className="member-pill">
                Sign in
              </Link>
            </div>
          </div>
          <BrandRibbon />
          {children}
        </div>
      </main>
    );
  }

  if (pathname === "/auth") {
    return (
      <main className="shell">
        <div className="mobile-frame guest-frame">
          <p className="status-banner info">Redirecting to dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-row">
          <AirLogo variant={theme === "dark" ? "white" : "coral"} />
          <nav className="primary-nav">
            {mainLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="top-actions">
            <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label="Open menu">
              Menu
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <MemberContext />
          </div>
        </div>
      </header>
      {menuOpen ? (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <aside className="menu-drawer" onClick={(event) => event.stopPropagation()}>
            <p className="eyebrow">Navigation</p>
            <div className="menu-group">
              {mainLinks.map((item) => (
                <Link key={item.href} href={item.href} className="menu-link">
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="eyebrow">More</p>
            <div className="menu-group">
              {moreLinks.map((item) => (
                <Link key={item.href} href={item.href} className="menu-link">
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="muted">Sign out from the top-right button.</p>
          </aside>
        </div>
      ) : null}
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
