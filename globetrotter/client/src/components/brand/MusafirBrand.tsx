/**
 * Musafir Brand Component
 * Unified brand presentation across sidebar, header, auth, and admin console.
 */

import React from "react";
import musafirLogo from "@/assets/branding/musafir-logo.png";

type MusafirBrandProps = {
  variant?: "sidebar" | "header" | "auth" | "admin" | "compact";
  onClick?: () => void;
  className?: string;
};

export function MusafirBrand({
  variant = "sidebar",
  onClick,
  className = "",
}: MusafirBrandProps) {
  if (variant === "admin") {
    return (
      <div className={`admin-brand ${className}`}>
        <div className="musafir-logo-frame admin-frame">
          <img src={musafirLogo} alt="Musafir" className="musafir-logo-img" />
        </div>
        <span>
          Musafir
          <small>ADMIN MODE</small>
        </span>
      </div>
    );
  }

  if (variant === "header" || variant === "compact") {
    return (
      <div className={`topbar-brand ${className}`}>
        <div className="musafir-logo-frame header-frame">
          <img src={musafirLogo} alt="Musafir" className="musafir-logo-img" />
        </div>
        <span>Musafir</span>
      </div>
    );
  }

  if (variant === "auth") {
    return (
      <div className={`auth-brand-lockup ${className}`}>
        <div className="musafir-logo-frame auth-frame">
          <img src={musafirLogo} alt="Musafir" className="musafir-logo-img" />
        </div>
        <div>
          <span className="brand-name">Musafir</span>
          <span className="brand-tag">Har safar, ek kahani</span>
        </div>
      </div>
    );
  }

  // Default: Sidebar variant
  return (
    <button
      type="button"
      className={`brand-lockup brand-button musafir-sidebar-brand ${className}`}
      onClick={onClick}
    >
      <div className="musafir-logo-frame sidebar-frame">
        <img src={musafirLogo} alt="Musafir" className="musafir-logo-img" />
      </div>
      <div className="brand-text-block">
        <span className="brand-name">Musafir</span>
        <span className="brand-tag">Har safar, ek kahani</span>
      </div>
    </button>
  );
}
