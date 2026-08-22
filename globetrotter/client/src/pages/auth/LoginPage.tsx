/**
 * Storybook Atlas Login Page
 * Pixel-aligned with the GlobeTrotter visual design reference.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Lock, MapPin, Route, Sparkles } from "lucide-react";
import { toast } from "sonner";
import brandLogo from "@/assets/branding/globetrotter-logo.png";
import HERO_ART from "@/assets/illustrations/globetrotter-hero-atlas.png";
import { useAuth } from "@/contexts/AuthContext";
import { AuthTransition } from "@/components/auth/AuthTransition";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, loginAsDemo, isLoading } = useAuth();

  const [email, setEmail] = useState("romitkakadiya2703@gmail.com");
  const [password, setPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = "Enter the email you use for your atlas.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "That email doesn't look quite right.";
    }

    if (!password) {
      nextErrors.password = "Your password is required.";
    } else if (password.length < 4) {
      nextErrors.password = "Please enter at least 4 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password, rememberMe);
      toast.success("Welcome back! Opening your travel desk.");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 400);
    } catch {
      toast.error("We couldn't open that atlas. Please check your credentials.");
      setIsSubmitting(false);
    }
  };

  const handleDemoTraveler = async () => {
    setIsSubmitting(true);
    await loginAsDemo("traveler");
    toast.success("Opening traveler demo desk...");
    setTimeout(() => {
      setLocation("/dashboard");
    }, 350);
  };

  const handleDemoAdmin = async () => {
    setIsSubmitting(true);
    await loginAsDemo("admin");
    toast.success("Opening admin command center...");
    setTimeout(() => {
      setLocation("/admin");
    }, 350);
  };

  return (
    <div className="auth-canvas">
      {(isLoading || isSubmitting) && (
        <AuthTransition
          message="Opening your atlas..."
          subMessage="Tracing your saved routes and preparing your travel desk."
        />
      )}

      <div className="auth-split-layout">
        {/* Left Column: Visual Story Scene */}
        <section className="auth-visual-pane">
          <div className="auth-visual-media">
            <img
              src={HERO_ART}
              alt="Illustrated tropical travel atlas route with vintage car and coastal monuments"
              className="auth-hero-illustration"
            />
            <div className="auth-visual-gradient" />
          </div>

          <div className="auth-visual-content">
            <span className="auth-visual-pill">
              <MapPin size={13} /> A PERSONAL TRAVEL ATLAS
            </span>
            <h1 className="auth-visual-title">
              Your next story
              <br />
              <span className="accent-gold">starts here.</span>
            </h1>
            <p className="auth-visual-subtitle">
              Plan cities. Collect experiences. Build your journey.
            </p>
          </div>

          <div className="auth-stamp-badge">
            <Route size={14} />
            <span>One good route at a time.</span>
          </div>
        </section>

        {/* Right Column: Boarding Pass Login Form */}
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
            <div className="boarding-pass-badge">BOARDING PASS · GLOBETROTTER</div>

            <div className="auth-card-intro">
              <span className="auth-eyebrow">WELCOME HOME</span>
              <h2 className="auth-heading">
                Welcome back,
                <br />
                <span className="text-coral">traveller.</span>
              </h2>
              <p className="auth-description">
                Your atlas is waiting. Pick up where your journey left off.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="auth-field">
                <span className="auth-label-text">Email</span>
                <input
                  type="email"
                  className={`auth-input ${errors.email ? "input-error" : ""}`}
                  placeholder="romitkakadiya2703@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  required
                />
                {errors.email && <span className="auth-error-msg">{errors.email}</span>}
              </label>

              <label className="auth-field">
                <span className="auth-label-text">Password</span>
                <input
                  type="password"
                  className={`auth-input ${errors.password ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  required
                />
                {errors.password && <span className="auth-error-msg">{errors.password}</span>}
              </label>

              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this demo</span>
                </label>
                <button
                  type="button"
                  className="auth-link-button"
                  onClick={() => setLocation("/forgot-password")}
                >
                  Forgot your route?
                </button>
              </div>

              <button type="submit" className="coral-button auth-submit-btn">
                Continue your journey <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-auth-btn"
              onClick={() => {
                toast.info("Google Sign-In is a visual demo in this prototype.");
                handleDemoTraveler();
              }}
            >
              <strong className="google-g">G</strong>
              <span>Continue with Google</span>
            </button>

            {/* Demo Workspace */}
            <div className="demo-workspace-card">
              <div className="demo-workspace-header">
                <Sparkles size={14} />
                <span>DEMO WORKSPACE</span>
              </div>
              <p>
                Just exploring? Choose a local demo route—no real account is created.
              </p>
              <div className="demo-actions-grid">
                <button
                  type="button"
                  className="demo-btn traveler-btn"
                  onClick={handleDemoTraveler}
                >
                  <span>Continue as traveller</span>
                  <span className="arrow-glyph">›</span>
                </button>
                <button
                  type="button"
                  className="demo-btn admin-btn"
                  onClick={handleDemoAdmin}
                >
                  <span>Open admin console</span>
                  <Lock size={13} />
                </button>
              </div>
            </div>

            <div className="auth-card-footer">
              <p className="auth-switch-text">
                New here?{" "}
                <button
                  type="button"
                  className="auth-link-highlight"
                  onClick={() => setLocation("/register")}
                >
                  Start your journey
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
