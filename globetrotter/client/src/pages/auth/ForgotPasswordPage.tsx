/**
 * Storybook Atlas Forgot Password Page
 * Features travel-oriented recovery copy and clear mock success state.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import brandLogo from "@/assets/branding/globetrotter-logo.png";
import HERO_ART from "@/assets/illustrations/globetrotter-hero-atlas.png";

export function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter the email you use for your atlas.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("That email doesn't look quite right.");
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Recovery directions dispatched.");
    }, 450);
  };

  return (
    <div className="auth-canvas">
      <div className="auth-split-layout">
        {/* Left Column: Visual Story Scene */}
        <section className="auth-visual-pane">
          <div className="auth-visual-media">
            <img
              src={HERO_ART}
              alt="Illustrated tropical travel atlas route"
              className="auth-hero-illustration"
            />
            <div className="auth-visual-gradient" />
          </div>

          <div className="auth-visual-content">
            <span className="auth-visual-pill">
              <Compass size={13} /> ROUTE RECOVERY
            </span>
            <h1 className="auth-visual-title">
              Let’s find your
              <br />
              <span className="accent-gold">way back in.</span>
            </h1>
            <p className="auth-visual-subtitle">
              We’ll keep your saved stops, draft itineraries, and expense postcards safe.
            </p>
          </div>

          <div className="auth-stamp-badge">
            <MapPin size={14} />
            <span>Always find your bearings.</span>
          </div>
        </section>

        {/* Right Column: Recovery Card */}
        <section className="auth-form-pane">
          <header className="auth-pane-header">
            <button
              type="button"
              className="brand-lockup brand-button"
              onClick={() => setLocation("/")}
            >
              <img src={brandLogo} alt="GlobeTrotter" className="brand-mark" />
              <span>
                <span className="brand-name">GlobeTrotter</span>
                <span className="brand-tag">PLAN IT YOUR WAY</span>
              </span>
            </button>
          </header>

          <div className="auth-boarding-card">
            <div className="boarding-pass-notch" />
            <div className="boarding-pass-badge">PASSPORT ASSISTANCE</div>

            {!isSubmitted ? (
              <>
                <div className="auth-card-intro">
                  <span className="auth-eyebrow">NO WORRIES</span>
                  <h2 className="auth-heading">
                    Forgot your
                    <br />
                    <span className="text-coral">route?</span>
                  </h2>
                  <p className="auth-description">
                    Enter the email on your travel desk and we’ll send a calm, clear way back to your plans.
                  </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                  <label className="auth-field">
                    <span className="auth-label-text">Your atlas email</span>
                    <input
                      type="email"
                      className={`auth-input ${error ? "input-error" : ""}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(undefined);
                      }}
                      required
                    />
                    {error && <span className="auth-error-msg">{error}</span>}
                  </label>

                  <button
                    type="submit"
                    className="coral-button auth-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Dispatching..." : "Send reset link"} <ArrowRight size={17} />
                  </button>
                </form>
              </>
            ) : (
              <div className="auth-success-card">
                <div className="success-icon-wrap">
                  <CheckCircle2 size={38} className="text-teal" />
                </div>
                <h3 className="success-title">Check your inbox</h3>
                <p className="success-body">
                  We’ve staged recovery instructions for <strong>{email}</strong>.
                </p>
                <div className="success-note-box">
                  <Mail size={16} />
                  <span>
                    Your password reset link would be sent here once real Odoo authentication is connected.
                  </span>
                </div>
                <button
                  type="button"
                  className="coral-button auth-submit-btn"
                  onClick={() => setLocation("/login")}
                >
                  <ArrowLeft size={16} /> Back to sign in
                </button>
              </div>
            )}

            <div className="auth-card-footer">
              <p className="auth-switch-text">
                Remembered your password?{" "}
                <button
                  type="button"
                  className="auth-link-highlight"
                  onClick={() => setLocation("/login")}
                >
                  Back to login
                </button>
              </p>
              <small className="auth-disclaimer">
                Frontend demo mode only. Real Odoo authentication will connect later in Antigravity.
              </small>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
