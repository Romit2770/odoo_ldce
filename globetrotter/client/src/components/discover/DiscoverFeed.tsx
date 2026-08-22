/**
 * DiscoverFeed — Exploration & Gemini AI Inspiration Experience
 * "Where should I go?" — AI recommendations, travel moods, hidden gems, and quick trip creation.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Compass,
  Heart,
  Loader2,
  MapPin,
  PlaneTakeoff,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  WalletCards,
  Check,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro, RouteConnector } from "@/components/ProductUi";
import { useAuth } from "@/contexts/AuthContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import {
  mongoProfileService,
  type SavedDestination,
} from "@/services/api/mongoProfileService";
import type { RecommendationItem } from "../../../../server/services/geminiService";

const MOODS = [
  "All",
  "Adventure",
  "Relaxation",
  "Nature",
  "Culture",
  "Food",
  "Budget",
  "Weekend",
  "Road trip",
] as const;

export function DiscoverFeed() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addStop } = useTripPlanner();

  const [selectedMood, setSelectedMood] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedDests, setSavedDests] = useState<SavedDestination[]>([]);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Fetch recommendations from Gemini API
  const fetchRecommendations = async (mood = selectedMood, query = searchQuery) => {
    setIsRefreshing(true);
    setErrorNotice(null);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (user?.id) headers["x-user-id"] = user.id;
      if (user?.email) headers["x-user-email"] = user.email;
      if (user?.name) headers["x-user-name"] = user.name;

      const res = await fetch("/api/discover/recommendations", {
        method: "POST",
        headers,
        body: JSON.stringify({ mood, query }),
      });

      if (!res.ok) throw new Error("Failed to fetch recommendations");
      const json = await res.json();
      if (json.recommendations && Array.isArray(json.recommendations)) {
        setRecommendations(json.recommendations);
      }
    } catch (err: any) {
      console.warn("Discover fetch error", err);
      setErrorNotice("Couldn't refresh travel ideas right now. Showing saved atlas favorites.");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchRecommendations();
    mongoProfileService
      .getSavedDestinations(user)
      .then((dests) => setSavedDests(dests))
      .catch(() => {});
  }, [user]);

  // Handle Mood change
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    fetchRecommendations(mood, searchQuery);
  };

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(selectedMood, searchQuery);
  };

  // Save Destination to Wish list
  const handleToggleSave = async (rec: RecommendationItem) => {
    const isAlreadySaved = savedDests.some(
      (d) => d.name.toLowerCase() === rec.name.toLowerCase() || d.city.toLowerCase() === rec.name.toLowerCase()
    );

    if (isAlreadySaved) {
      const found = savedDests.find((d) => d.name.toLowerCase() === rec.name.toLowerCase());
      if (found) {
        await mongoProfileService.removeDestination(found.id, user);
        setSavedDests((prev) => prev.filter((d) => d.id !== found.id));
        toast.info(`${rec.name} removed from your saved places.`);
      }
    } else {
      const created = await mongoProfileService.saveDestination(
        {
          name: rec.name,
          city: rec.name,
          state: rec.location,
          country: rec.country || "India",
          formattedAddress: `${rec.name}, ${rec.location}`,
        },
        user
      );
      setSavedDests((prev) => [created, ...prev]);
      toast.success(`✓ Saved ${rec.name} to your travel wish list.`);
    }
  };

  // Plan This Trip: Add destination & open trip wizard
  const handlePlanThisTrip = (rec: RecommendationItem) => {
    addStop({
      city: rec.name,
      country: rec.country || "India",
      region: rec.location || rec.name,
      dateRange: "17–18 Aug",
      arrival: "17 Aug",
      departure: "18 Aug",
    });
    toast.success(`Starting your itinerary with ${rec.name}!`);
    setLocation("/trips/new");
  };

  return (
    <div className="page-stack discover-page">
      <PageIntro
        eyebrow="AI Travel Exploration"
        title="Find somewhere"
        accent="worth going."
        description="Explore new places, hidden gems, and trip ideas picked around your interests."
        action={
          <button
            type="button"
            className="outlined-action"
            onClick={() => fetchRecommendations()}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 size={16} className="animate-spin text-coral" />
            ) : (
              <RefreshCw size={16} />
            )}
            {isRefreshing ? "Finding new places..." : "Refresh ideas"}
          </button>
        }
      />

      {/* Exploration Search & Mood Filter Bar */}
      <section className="discovery-controls">
        <form className="search-field" onSubmit={handleSearchSubmit}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places or experiences (e.g. beaches, heritage in Rajasthan, monsoon)..."
            aria-label="Search discoveries"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery("");
                fetchRecommendations(selectedMood, "");
              }}
            >
              ×
            </button>
          )}
        </form>

        <div className="filter-chips">
          {MOODS.map((mood) => (
            <button
              key={mood}
              type="button"
              className={selectedMood === mood ? "active" : ""}
              onClick={() => handleMoodSelect(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </section>

      {errorNotice && <p className="discover-error-banner">{errorNotice}</p>}

      <RouteConnector label="ideas picked for your journal" />

      {/* Main Recommendations Grid */}
      {isLoading ? (
        <div className="discover-loading-state">
          <Loader2 size={32} className="animate-spin text-coral" />
          <p>Personalizing travel discoveries for you...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="empty-discover-state">
          <Compass size={40} className="text-coral spin-slow" />
          <h3>No matching destination ideas found</h3>
          <p>Try searching for a different mood or keyword.</p>
          <button
            type="button"
            className="coral-button"
            onClick={() => {
              setSelectedMood("All");
              setSearchQuery("");
              fetchRecommendations("All", "");
            }}
          >
            Show all recommendations
          </button>
        </div>
      ) : (
        <section className="discover-cards-grid">
          {recommendations.map((rec, index) => {
            const isSaved = savedDests.some(
              (d) => d.name.toLowerCase() === rec.name.toLowerCase() || d.city.toLowerCase() === rec.name.toLowerCase()
            );

            return (
              <article className="discover-card ink-card" key={rec.id || `${rec.name}-${index}`}>
                <div className="discover-card-header">
                  <div>
                    <span className="discover-location-tag">
                      <MapPin size={12} /> {rec.location}
                    </span>
                    <h2>{rec.name}</h2>
                  </div>

                  <button
                    type="button"
                    className={`save-heart-btn ${isSaved ? "is-saved" : ""}`}
                    onClick={() => handleToggleSave(rec)}
                    title={isSaved ? "Saved to wish list" : "Save destination"}
                  >
                    <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>

                <p className="discover-short-desc">{rec.shortDescription}</p>

                {rec.whyRecommended && (
                  <div className="why-recommended-box">
                    <Sparkles size={13} className="text-coral" />
                    <span>{rec.whyRecommended}</span>
                  </div>
                )}

                {/* Highlights / Best For Tags */}
                {rec.bestFor && rec.bestFor.length > 0 && (
                  <div className="discover-tags-row">
                    {rec.bestFor.map((tag) => (
                      <span key={tag} className="discover-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Meta & Actions */}
                <div className="discover-card-footer">
                  <div className="discover-meta-info">
                    {rec.bestTime && (
                      <span title="Best time to visit">
                        <Calendar size={12} /> {rec.bestTime}
                      </span>
                    )}
                    {rec.estimatedBudgetLevel && (
                      <span title="Budget level">
                        <WalletCards size={12} /> {rec.estimatedBudgetLevel}
                      </span>
                    )}
                  </div>

                  <div className="discover-card-actions">
                    <button
                      type="button"
                      className="coral-button btn-sm"
                      onClick={() => handlePlanThisTrip(rec)}
                    >
                      <PlaneTakeoff size={14} /> Plan this trip
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
