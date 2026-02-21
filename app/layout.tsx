import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { MemberContext } from "@/components/member-context";
import { NavTabs } from "@/components/nav-tabs";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AIR Career OS",
  description: "Opportunity matching, contract templates, advocacy tracking, and fair-rate support for independent media makers."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
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
            <section className="brand-ribbon">
              <div>
                <p className="top-kicker">Association of Independents in Radio</p>
                <h1 className="brand">Career OS</h1>
              </div>
              <div className="signal-motif" aria-hidden />
            </section>
            {children}
            <NavTabs />
          </div>
        </main>
      </body>
    </html>
  );
}
