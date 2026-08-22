/**
 * Storybook Atlas Onboarding Flow
 * 4-Step interactive personalization journey after registration.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  DollarSign,
  Heart,
  Landmark,
  MapPin,
  Palmtree,
  Sparkles,
  Tent,
  Utensils,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import brandLogo from "@/assets/branding/globetrotter-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { AuthTransition } from "@/components/auth/AuthTransition";

// Step 1: Travel Styles with icons & descriptions
const STYLES = [
  {
    id: "Adventure",
    label: "Adventure",
    icon: Tent,
    desc: "Trails, outdoor discoveries & scenic detours",
    color: "#FF6550",
  },
  {
    id: "Relaxed",
    label: "Relaxed",
    icon: Palmtree,
    desc: "Slow mornings, coastal views & unhurried walks",
    color: "#2CB9AA",
  },
  {
    id: "Culture",
    label: "Culture & Heritage",
    icon: Landmark,
    desc: "Historic forts, local art & architectural landmarks",
    color: "#FFC53D",
  },
  {
    id: "Food",
    label: "Food & Cafes",
    icon: Utensils,
    desc: "Street eats, coastal shacks & artisanal chai spots",
    color: "#FF6550",
  },
  {
    id: "Nature",
    label: "Nature & Wildlife",
    icon: Compass,
    desc: "Lush lookouts, spice plantations & quiet backwaters",
    color: "#2CB9AA",
  },
  {
    id: "Budget",
    label: "Balanced & Smart",
    icon: Wallet,
    desc: "Great experiences with realistic day-to-day spending",
    color: "#23304A",
  },
];

// Step 2: India Destinations Calling
const DESTINATIONS = [
  {
    id: "goa",
    name: "Goa",
    tagline: "Sun-washed beaches, red-stone forts & slow sunsets",
    state: "West Coast",
    highlight: "Primary Story Destination",
  },
  {
    id: "mumbai",
    name: "Mumbai",
    tagline: "Marine Drive sea breeze, art deco lanes & street snacks",
    state: "Maharashtra",
    highlight: "Gateway City",
  },
  {
    id: "jaipur",
    name: "Jaipur",
    tagline: "Pink City palaces, artisan bazaars & vibrant courtyards",
    state: "Rajasthan",
    highlight: "Heritage Route",
  },
  {
    id: "udaipur",
    name: "Udaipur",
    tagline: "Quiet lake shores, rooftop dinners & royal architecture",
    state: "Rajasthan",
    highlight: "Lake City",
  },
  {
    id: "kerala",
    name: "Kerala",
    tagline: "Palm-fringed backwaters, tea gardens & misty peaks",
    state: "South Coast",
    highlight: "Slow Backwaters",
  },
  {
    id: "manali",
    name: "Manali",
    tagline: "Himalayan pine forests, river valleys & mountain passes",
    state: "Himachal Pradesh",
    highlight: "Mountain Escape",
  },
  {
    id: "delhi",
    name: "Delhi",
    tagline: "Centuries of history, bustling markets & culinary trails",
    state: "North India",
    highlight: "Capital Story",
  },
];

// Step 3: Currencies
const CURRENCIES = [
  { id: "INR", symbol: "₹", label: "Indian Rupee", desc: "Default for India adventures" },
  { id: "USD", symbol: "$", label: "US Dollar", desc: "International travel standard" },
  { id: "EUR", symbol: "€", label: "Euro", desc: "European planning format" },
  { id: "GBP", symbol: "£", label: "British Pound", desc: "UK & Commonwealth format" },
];

export function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState(user?.travelStyle || "Adventure");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["goa", "mumbai"]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [isFinishing, setIsFinishing] = useState(false);

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((d) => d !== id) : prev) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => prev + 1);
    } else {
      setIsFinishing(true);
      completeOnboarding({
        travelStyle: selectedStyle,
        destinations: selectedDestinations,
        currency: selectedCurrency,
      });
      toast.success("Your atlas is ready! Welcome to your travel desk.");
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="onboarding-canvas">
      {isFinishing && (
        <AuthTransition
          message="Inking your personal atlas..."
          subMessage="Pinning your dream destinations and building your Goa adventure desk."
        />
      )}

      <header className="onboarding-header">
        <div className="brand-lockup">
          <img src={brandLogo} alt="GlobeTrotter" className="brand-mark" />
          <span>
            <span className="brand-name">GlobeTrotter</span>
            <span className="brand-tag">PLAN IT YOUR WAY</span>
          </span>
        </div>

        <div className="onboarding-stepper">
          <span className="stepper-label">
            Step {step} of 4 · {step === 1 ? "Travel Style" : step === 2 ? "Destinations" : step === 3 ? "Currency" : "Atlas Ready"}
          </span>
          <div className="stepper-track">
            <i className="stepper-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>
      </header>

      <main className="onboarding-container">
        {/* Step 1: Travel Style */}
        {step === 1 && (
          <section className="onboarding-step-card animate-fade-in">
            <div className="onboarding-intro">
              <span className="auth-eyebrow">
                <Sparkles size={13} /> STEP 1 · TRAVEL IDENTITY
              </span>
              <h2>How do you like to travel?</h2>
              <p>
                Choose the rhythm that suits you best. We’ll tailor activity suggestions and pace to your style.
              </p>
            </div>

            <div className="onboarding-style-grid">
              {STYLES.map((st) => {
                const IconComponent = st.icon;
                const isSelected = selectedStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`onboarding-card-option ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedStyle(st.id)}
                  >
                    <div
                      className="option-icon-box"
                      style={{ backgroundColor: `${st.color}18`, color: st.color }}
                    >
                      <IconComponent size={22} />
                    </div>
                    <div className="option-text-box">
                      <strong>{st.label}</strong>
                      <p>{st.desc}</p>
                    </div>
                    <div className={`option-check-circle ${isSelected ? "checked" : ""}`}>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 2: Calling Destinations */}
        {step === 2 && (
          <section className="onboarding-step-card animate-fade-in">
            <div className="onboarding-intro">
              <span className="auth-eyebrow">
                <MapPin size={13} /> STEP 2 · WISH LIST
              </span>
              <h2>Which places are calling you?</h2>
              <p>
                Select the destinations you’d love to explore or pin to your wish list. (You can choose multiple).
              </p>
            </div>

            <div className="onboarding-destinations-grid">
              {DESTINATIONS.map((dest) => {
                const isSelected = selectedDestinations.includes(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    className={`destination-select-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => toggleDestination(dest.id)}
                  >
                    <div className="dest-card-header">
                      <span className="dest-state">{dest.state}</span>
                      <span className="dest-badge">{dest.highlight}</span>
                    </div>
                    <h3>{dest.name}</h3>
                    <p>{dest.tagline}</p>
                    <div className="dest-card-footer">
                      <span className="pin-indicator">
                        <Heart size={13} className={isSelected ? "fill-coral text-coral" : ""} />
                        {isSelected ? "Pinned to Wishlist" : "Tap to Pin"}
                      </span>
                      <div className={`option-check-circle ${isSelected ? "checked" : ""}`}>
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 3: Currency */}
        {step === 3 && (
          <section className="onboarding-step-card animate-fade-in">
            <div className="onboarding-intro">
              <span className="auth-eyebrow">
                <DollarSign size={13} /> STEP 3 · BUDGET SNAPSHOT
              </span>
              <h2>What currency should we plan in?</h2>
              <p>
                Choose your default currency for activity pricing, day budgets, and expense postcards.
              </p>
            </div>

            <div className="onboarding-currency-grid">
              {CURRENCIES.map((curr) => {
                const isSelected = selectedCurrency === curr.id;
                return (
                  <button
                    key={curr.id}
                    type="button"
                    className={`currency-select-card ${isSelected ? "is-selected" : ""}`}
                    onClick={() => setSelectedCurrency(curr.id)}
                  >
                    <span className="currency-symbol">{curr.symbol}</span>
                    <div className="currency-info">
                      <strong>{curr.label} ({curr.id})</strong>
                      <small>{curr.desc}</small>
                    </div>
                    <div className={`option-check-circle ${isSelected ? "checked" : ""}`}>
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4: Ready Summary */}
        {step === 4 && (
          <section className="onboarding-step-card ready-step-card animate-fade-in">
            <div className="ready-ticket-badge">YOUR PERSONAL TRAVEL DESK</div>

            <div className="onboarding-intro text-center">
              <span className="auth-eyebrow">
                <Sparkles size={13} /> ALL SET, {user?.name?.toUpperCase() || "TRAVELLER"}!
              </span>
              <h2>Ready to start your next story?</h2>
              <p>
                Your Storybook Atlas has been customized with your chosen travel rhythm, currencies, and pinned places.
              </p>
            </div>

            <div className="atlas-passport-summary">
              <div className="passport-row">
                <div className="passport-field">
                  <span>TRAVELLER</span>
                  <strong>{user?.name || "Mita Shah"}</strong>
                </div>
                <div className="passport-field">
                  <span>TRAVEL STYLE</span>
                  <strong>{selectedStyle}</strong>
                </div>
                <div className="passport-field">
                  <span>PRIMARY CURRENCY</span>
                  <strong>{selectedCurrency}</strong>
                </div>
              </div>

              <div className="passport-destinations-block">
                <span>PINNED DESTINATIONS ({selectedDestinations.length})</span>
                <div className="passport-tags-row">
                  {selectedDestinations.map((d) => (
                    <span key={d} className="passport-tag">
                      <MapPin size={11} /> {d.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="passport-welcome-note">
                <Compass size={18} className="text-coral" />
                <p>
                  We have loaded your starter <strong>Goa Adventure (5 Days · Mumbai → Goa)</strong> ready in your desk.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Actions */}
        <footer className="onboarding-nav-bar">
          {step > 1 ? (
            <button type="button" className="outlined-action" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            className="coral-button onboarding-next-btn"
            onClick={handleNext}
          >
            {step === 4 ? (
              <>
                Plan my first trip <ArrowRight size={17} />
              </>
            ) : (
              <>
                Continue <ArrowRight size={17} />
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}
