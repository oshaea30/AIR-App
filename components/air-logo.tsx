"use client";

import { useMemo, useState } from "react";

type LogoVariant = "blue" | "coral" | "black" | "white";

type Props = {
  variant?: LogoVariant;
  className?: string;
};

const variantToPath: Record<LogoVariant, string> = {
  blue: "/branding/air-logo-blue.png",
  coral: "/branding/air-logo-coral.png",
  black: "/branding/air-logo-black.png",
  white: "/branding/air-logo-white.png"
};

export function AirLogo({ variant = "blue", className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => variantToPath[variant], [variant]);

  return (
    <div className={`air-logo ${className}`.trim()} aria-label="AIR logo">
      <span className="air-logo-fallback show">AIR</span>
      {!failed ? <img src={src} alt="AIR" className="air-logo-image" onError={() => setFailed(true)} /> : null}
    </div>
  );
}
