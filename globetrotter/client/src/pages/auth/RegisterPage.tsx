/**
 * Storybook Atlas Register Page
 * Features name, email, password strength indicator, travel styles, and onboarding redirection.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MusafirBrand } from "@/components/brand/MusafirBrand";
import HERO_ART from "@/assets/illustrations/globetrotter-hero-atlas.png";
import { useAuth } from "@/contexts/AuthContext";
import { AuthTransition } from "@/components/auth/AuthTransition";

const TRAVEL_STYLES = [
  "Adventure",
  "Relaxed",
  "Culture",
  "Food",
  "Nature",
  "Budget",
  "Luxury",
];

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Adventure");
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass: string): { label: string; score: number; colorClass: string } => {
    if (!pass) return { label: "", score: 0, colorClass: "" };
    if (pass.length < 6) return { label: "Weak", score: 1, colorClass: "strength-weak" };
    if (pass.length < 9 || !/[0-9!@#$%^&*]/.test(pass)) {
      return { label: "Getting there", score: 2, colorClass: "strength-medium" };
    }
    return { label: "Strong", score: 3, colorClass: "strength-strong" };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const nextErrors: { [key: string]: string | undefined } = {};

    if (!name.trim()) {
      nextErrors.name = "Please enter your name for your travel pass.";
    }

    if (!email.trim()) {
      nextErrors.email = "Enter the email you want linked to your atlas.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "That email doesn't look quite right.";
    }

    if (!password) {
      nextErrors.password = "Your password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        travelStyle: selectedStyle,
      });

      toast.success("Welcome aboard! Let's personalize your atlas.");
      setTimeout(() => {
        setLocation("/onboarding");
      }, 400);
    } catch {
      toast.error("Failed to create atlas desk. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-canvas">
      {(isLoading || isSubmitting) && (
        <AuthTransition
          message="Your atlas is ready to begin..."
          subMessage="Creating your personal travel journal and onboarding desk."
        />
      )}

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
              <Sparkles size={13} /> FRESH TRAVEL JOURNAL
            </span>
            <h1 className="auth-visual-title">
              Start your next story.
              <br />
              <span className="accent-gold">Plan it your way.</span>
            </h1>
            <p className="auth-visual-subtitle">
              Build trips that feel like yours. Connected routes, realistic budgets, and zero clutter.
            </p>
          </div>

          <div className="auth-stamp-badge">
            <Compass size={14} />
            <span>Personalized travel desk.</span>
          </div>
        </section>

        {/* Right Column: Registration Card */}
        <section className="auth-form-pane">
          <header className="auth-pane-header">
            <MusafirBrand variant="auth" onClick={() => setLocation("/")} />
          </header>

          <div className="auth-boarding-card">
            <div className="boarding-pass-notch" />
            <div className="boarding-pass-badge">NEW TRAVELLER PASS · MUSAFIR</div>

            <div className="auth-card-intro">
              <span className="auth-eyebrow">A FRESH TRAVEL DESK</span>
              <h2 className="auth-heading">
                Start planning
                <br />
                <span className="text-coral">your way.</span>
              </h2>
              <p className="auth-description">
                Your travel journal is ready when you are. Enter a few details to get started.
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <label className="auth-field">
                <span className="auth-label-text">Your name</span>
                <input
                  type="text"
                  className={`auth-input ${errors.name ? "input-error" : ""}`}
                  placeholder="Mita Shah"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  required
                />
                {errors.name && <span className="auth-error-msg">{errors.name}</span>}
              </label>

              <label className="auth-field">
                <span className="auth-label-text">Email</span>
                <input
                  type="email"
                  className={`auth-input ${errors.email ? "input-error" : ""}`}
                  placeholder="mita@example.com"
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

                {/* Password Strength Meter */}
                {password && (
                  <div className="strength-meter-wrap">
                    <div className="strength-bars">
                      <i className={`strength-bar ${strength.score >= 1 ? strength.colorClass : ""}`} />
                      <i className={`strength-bar ${strength.score >= 2 ? strength.colorClass : ""}`} />
                      <i className={`strength-bar ${strength.score >= 3 ? strength.colorClass : ""}`} />
                    </div>
                    <span className={`strength-label ${strength.colorClass}`}>{strength.label}</span>
                  </div>
                )}
              </label>

              <label className="auth-field">
                <span className="auth-label-text">Confirm password</span>
                <input
                  type="password"
                  className={`auth-input ${errors.confirmPassword ? "input-error" : ""}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  required
                />
                {errors.confirmPassword && (
                  <span className="auth-error-msg">{errors.confirmPassword}</span>
                )}
              </label>

              {/* Travel Style Selector */}
              <div className="auth-style-picker-field">
                <span className="auth-label-text">Primary travel vibe (optional)</span>
                <div className="style-chips-row">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      className={`style-chip ${selectedStyle === style ? "active" : ""}`}
                      onClick={() => setSelectedStyle(style)}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="coral-button auth-submit-btn">
                Create my atlas <ArrowRight size={17} />
              </button>
            </form>

            <div className="auth-card-footer">
              <p className="auth-switch-text">
                Already travelling with us?{" "}
                <button
                  type="button"
                  className="auth-link-highlight"
                  onClick={() => setLocation("/login")}
                >
                  Log in
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
