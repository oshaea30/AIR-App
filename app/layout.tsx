import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AIR Career OS",
  description: "Opportunity matching, contract templates, advocacy tracking, and fair-rate support for independent media makers."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
