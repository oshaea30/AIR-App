"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Dashboard" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/toolkit", label: "Toolkit" },
  { href: "/advocacy", label: "Advocacy" },
  { href: "/profile", label: "Profile" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="tabs">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className={isActive ? "tab-link active" : "tab-link"}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
