/**
 * PlaceDetailView — Polished Destination Place Detail Experience
 * Displays rich, AI-generated/curated travel guide details for any clicked place.
 */

import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  Clock,
  Compass,
  DollarSign,
  Heart,
  Info,
  Lightbulb,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Utensils,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import type { PlaceDetail } from "@/domain/placeDetail";
import { getPlaceImage } from "@/domain/destinationPhotoStories";
import { placeService } from "@/services";
import { useTripPlanner } from "@/contexts/TripPlannerContext";

type PlaceDetailViewProps = {
  slug: string;
};

export function PlaceDetailView({ slug }: PlaceDetailViewProps) {
  const [, setLocation] = useLocation();
  const { trip, addStop } = useTripPlanner();

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fetchPlace = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await placeService.getPlaceDetail(slug);
      setPlace(data);
    } catch (err: any) {
      console.error("Failed to load place:", err);
      setError("Couldn't load destination details. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlace();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Check if this place is already added to the user's active trip stops
  const isAlreadyInTrip = Boolean(
    place &&
      trip?.stops?.some(
        (stop) =>
          stop.city.toLowerCase().includes(place.name.toLowerCase()) ||
          place.name.toLowerCase().includes(stop.city.toLowerCase()) ||
          stop.id.toLowerCase().includes(slug.toLowerCase())
      )
  );

  const handleAddToTrip = () => {
    if (!place) return;

    if (isAlreadyInTrip) {
      toast.info(`${place.name} is already in your journey route!`);
      return;
    }

    addStop({
      city: place.name,
      country: place.country || "India",
      region: place.state || place.city || "Goa",
      latitude: place.latitude,
      longitude: place.longitude,
      address: `${place.name}, ${place.city}, ${place.state}, ${place.country}`,
      dateRange: "15–17 Aug",
      arrival: "15 Aug",
      departure: "17 Aug",
    });

    toast.success(`✨ ${place.name} added to your trip stops!`);
  };

  const handleShare = () => {
    if (!place) return;
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Place link copied to clipboard!");
    } else {
      toast.info(`Share link: ${shareUrl}`);
    }
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="page-stack place-detail-page place-detail-loading">
        <div className="place-detail-nav">
          <div className="skeleton-box skeleton-btn" />
        </div>
        <div className="skeleton-box place-hero-skeleton" />
        <div className="place-content-layout">
          <div className="place-main-column">
            <div className="skeleton-box skeleton-title" />
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-text" />
            <div className="skeleton-box skeleton-card" />
            <div className="skeleton-box skeleton-card" />
          </div>
          <div className="place-side-column">
            <div className="skeleton-box skeleton-sidebar-card" />
            <div className="skeleton-box skeleton-sidebar-card" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !place) {
    return (
      <div className="page-stack place-detail-page">
        <div className="place-detail-nav">
          <button
            type="button"
            className="back-to-trips-btn"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="ink-card place-error-card">
          <div className="error-icon-box">
            <Compass size={32} />
          </div>
          <h2>Couldn't load destination details</h2>
          <p>{error || "We couldn't retrieve the travel guide for this location."}</p>
          <div className="error-actions">
            <button type="button" className="coral-button" onClick={fetchPlace}>
              <RefreshCw size={15} /> Try again
            </button>
            <button
              type="button"
              className="outlined-action"
              onClick={() => setLocation("/destinations")}
            >
              Explore Destinations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const heroImageSrc = place.imageUrl || getPlaceImage(place.slug || place.placeKey || place.name);

  return (
    <div className="page-stack place-detail-page">
      {/* Top Navigation Bar */}
      <div className="place-detail-nav">
        <button
          type="button"
          className="back-to-trips-btn"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="place-nav-actions">
          <button
            type="button"
            className={`save-place-btn ${isSaved ? "saved" : ""}`}
            onClick={() => {
              setIsSaved(!isSaved);
              toast.success(isSaved ? "Removed from saved places" : "Saved to your wanderlist!");
            }}
            title="Save place"
          >
            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            className="outlined-action place-share-btn"
            onClick={handleShare}
            title="Share destination"
          >
            <Share2 size={15} /> Share
          </button>

          <button
            type="button"
            className={`coral-button ${isAlreadyInTrip ? "added" : ""}`}
            onClick={handleAddToTrip}
          >
            {isAlreadyInTrip ? (
              <>
                <Check size={16} /> In your trip
              </>
            ) : (
              <>
                <Plus size={16} /> Add to my trip
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <header className="place-hero-section">
        <div className="place-hero-image-wrap">
          <img src={heroImageSrc} alt={place.name} className="place-hero-image" />
          <div className="place-hero-gradient" />
          <div className="place-hero-badges">
            <span className="place-category-pill">
              <Sparkles size={13} /> {place.category}
            </span>
            {place.source === "gemini" && (
              <span className="place-ai-badge">
                <Compass size={13} /> Gemini AI Local Guide
              </span>
            )}
          </div>
          {place.latitude && place.longitude && (
            <div className="place-coords-stamp">
              <MapPin size={12} /> {place.latitude.toFixed(4)}° N, {place.longitude.toFixed(4)}° E
            </div>
          )}
        </div>

        <div className="place-hero-intro">
          <div className="place-location-eyebrow">
            <MapPin size={15} />
            <span>
              {place.city}, {place.state ? `${place.state}, ` : ""}{place.country}
            </span>
          </div>
          <h1 className="place-main-title">{place.name}</h1>
          <p className="place-tagline">{place.tagline}</p>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="place-content-layout">
        {/* Left / Primary Column */}
        <div className="place-main-column">
          {/* About Section */}
          <section className="ink-card place-card-block">
            <div className="place-block-header">
              <div className="icon-badge">
                <Info size={16} />
              </div>
              <div>
                <span className="eyebrow">Overview</span>
                <h2>About {place.name}</h2>
              </div>
            </div>
            <p className="place-about-text">{place.about}</p>

            {/* Highlights Tags */}
            {place.highlights && place.highlights.length > 0 && (
              <div className="place-highlights-row">
                {place.highlights.map((item, idx) => (
                  <span key={idx} className="place-highlight-chip">
                    <Check size={13} /> {item}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Why Visit / Famous For */}
          {place.whyVisit && place.whyVisit.length > 0 && (
            <section className="ink-card place-card-block">
              <div className="place-block-header">
                <div className="icon-badge coral">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="eyebrow">Why Visit</span>
                  <h2>What makes it special</h2>
                </div>
              </div>
              <ul className="place-bullet-list">
                {place.whyVisit.map((reason, idx) => (
                  <li key={idx}>
                    <span className="bullet-pin" />
                    <p>{reason}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Things to Do / Activities */}
          {place.activities && place.activities.length > 0 && (
            <section className="ink-card place-card-block">
              <div className="place-block-header">
                <div className="icon-badge yellow">
                  <Compass size={16} />
                </div>
                <div>
                  <span className="eyebrow">Experiences</span>
                  <h2>Things to do & explore</h2>
                </div>
              </div>
              <div className="place-activities-grid">
                {place.activities.map((act, idx) => (
                  <div key={idx} className="place-activity-item">
                    <span className="activity-number">{String(idx + 1).padStart(2, "0")}</span>
                    <p>{act}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* What to Eat (Food Section) */}
          {place.food && place.food.length > 0 && (
            <section className="ink-card place-card-block">
              <div className="place-block-header">
                <div className="icon-badge orange">
                  <Utensils size={16} />
                </div>
                <div>
                  <span className="eyebrow">Local Flavors</span>
                  <h2>What to eat around {place.name}</h2>
                </div>
              </div>
              <div className="place-food-list">
                {place.food.map((dish, idx) => (
                  <div key={idx} className="place-food-chip">
                    <span className="food-icon">🍽️</span>
                    <span>{dish}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Nearby Places */}
          {place.nearbyPlaces && place.nearbyPlaces.length > 0 && (
            <section className="ink-card place-card-block">
              <div className="place-block-header">
                <div className="icon-badge blue">
                  <Navigation size={16} />
                </div>
                <div>
                  <span className="eyebrow">Around the Area</span>
                  <h2>Nearby places to visit</h2>
                </div>
              </div>
              <div className="place-nearby-grid">
                {place.nearbyPlaces.map((near, idx) => (
                  <div
                    key={idx}
                    className="nearby-place-card"
                    onClick={() => setLocation(`/places/${near.slug || near.name.toLowerCase().replace(/\s+/g, "-")}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="nearby-header">
                      <strong>{near.name}</strong>
                      {near.distance && <span className="nearby-dist">{near.distance}</span>}
                    </div>
                    {near.description && <p>{near.description}</p>}
                    <span className="nearby-link">
                      View place <ArrowRight size={12} />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right / Sidebar Column */}
        <aside className="place-side-column">
          {/* Quick Facts & Key Info Card */}
          <div className="ink-card place-sidebar-widget">
            <h3 className="widget-title">Travel snapshot</h3>

            <div className="snapshot-item">
              <Calendar size={18} className="snapshot-icon" />
              <div>
                <strong>Best time to visit</strong>
                <p>{place.bestTimeToVisit}</p>
              </div>
            </div>

            <div className="snapshot-item">
              <Clock size={18} className="snapshot-icon" />
              <div>
                <strong>Recommended visit time</strong>
                <p>{place.recommendedDuration}</p>
              </div>
            </div>

            <div className="snapshot-item">
              <DollarSign size={18} className="snapshot-icon" />
              <div>
                <strong>Budget level</strong>
                <p>{place.budgetLevel}</p>
              </div>
            </div>
          </div>

          {/* Travel Tips Card */}
          {place.travelTips && place.travelTips.length > 0 && (
            <div className="ink-card place-sidebar-widget tips-widget">
              <div className="widget-head">
                <Lightbulb size={17} className="tips-icon" />
                <h3 className="widget-title">Insider travel tips</h3>
              </div>
              <ul className="place-tips-list">
                {place.travelTips.map((tip, idx) => (
                  <li key={idx}>
                    <p>{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location & Coordinates Map Card */}
          <div className="ink-card place-sidebar-widget map-widget">
            <h3 className="widget-title">Location & Coordinates</h3>
            <div className="place-map-preview">
              <div className="map-pin-pulse">
                <MapPin size={22} className="map-marker-icon" />
              </div>
              <div className="map-preview-info">
                <strong>{place.name}</strong>
                <span>
                  {place.city}, {place.country}
                </span>
                {place.latitude && place.longitude && (
                  <small>
                    {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                  </small>
                )}
              </div>
            </div>
            <button
              type="button"
              className="outlined-action map-view-btn"
              onClick={() => setLocation("/destinations")}
            >
              <Navigation size={14} /> Open in route map
            </button>
          </div>

          {/* Sticky Add to Trip Card */}
          <div className="ink-card place-cta-sidebar-card">
            <Sparkles size={20} className="cta-icon" />
            <h3>Add {place.name} to your route</h3>
            <p>Embed this destination into your current travel itinerary with automatic time & budget tracking.</p>
            <button
              type="button"
              className={`coral-button full-width ${isAlreadyInTrip ? "added" : ""}`}
              onClick={handleAddToTrip}
            >
              {isAlreadyInTrip ? (
                <>
                  <Check size={16} /> In your trip
                </>
              ) : (
                <>
                  <Plus size={16} /> Add to my trip
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
