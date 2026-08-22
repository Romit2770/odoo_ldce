/**
 * Storybook Atlas auth transition state.
 * Smoothly displays while logging in or transitioning between auth stages.
 */

import React from "react";
import brandLogo from "@/assets/branding/globetrotter-logo.png";
import { Compass, Sparkles } from "lucide-react";

type AuthTransitionProps = {
  message?: string;
  subMessage?: string;
};

export function AuthTransition({
  message = "Opening your atlas...",
  subMessage = "Tracing your routes and setting up your travel desk.",
}: AuthTransitionProps) {
  return (
    <div className="auth-transition-overlay" role="status" aria-live="polite">
      <div className="auth-transition-card">
        <div className="auth-transition-stamp">
          <Sparkles size={14} />
          <span>Storybook Atlas</span>
        </div>

        <div className="auth-transition-logo-wrap">
          <img src={brandLogo} alt="GlobeTrotter" className="auth-transition-logo" />
          <div className="auth-transition-ring" />
          <div className="auth-transition-ring outer" />
        </div>

        <div className="auth-transition-trail">
          <i className="trail-dot dot-1" />
          <i className="trail-line" />
          <i className="trail-dot dot-2" />
          <i className="trail-line" />
          <i className="trail-dot dot-3" />
        </div>

        <h3>{message}</h3>
        <p>{subMessage}</p>

        <div className="auth-transition-indicator">
          <Compass size={14} className="spin-slow" />
          <span>GlobeTrotter Travel Desk</span>
        </div>
      </div>
    </div>
  );
}
