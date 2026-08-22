/**
 * PublicSharePage — Public Read-Only Shared Trip Viewer
 * Allows friends to enter a 6-character trip code (or view via direct link) in strict read-only mode.
 */

import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  Copy,
  Globe,
  Heart,
  Loader2,
  Lock,
  MapPin,
  PlaneTakeoff,
  Route,
  Search,
  Share2,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro, RouteConnector, StatusPill } from "@/components/ProductUi";
import { StorybookAtlasMap } from "@/components/travel/StorybookAtlasMap";
import {
  mongoTripService,
  type SharedTripData,
} from "@/services/api/mongoTripService";
import { formatRupees } from "@/lib/tripMath";

export function PublicSharePage() {
  const [, params] = useRoute("/share/:shareCode");
  const [, setLocation] = useLocation();

  const [codeInput, setCodeInput] = useState(params?.shareCode || "");
  const [trip, setTrip] = useState<SharedTripData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load shared trip when code in URL exists
  useEffect(() => {
    if (params?.shareCode) {
      loadTripByCode(params.shareCode);
    }
  }, [params?.shareCode]);

  const loadTripByCode = async (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await mongoTripService.getSharedTrip(code.trim());
      setTrip(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Trip not found or sharing disabled.");
      setTrip(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    loadTripByCode(codeInput);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Share link copied!");
  };

  const routeString = trip?.stops?.map((s) => s.city).join(" → ") || "Route";

  return (
    <div className="page-stack share-page">
      <PageIntro
        eyebrow="Shared Journey Pass"
        title="View a shared"
        accent="travel story."
        description="Enter a 6-character trip code to view a friend’s travel itinerary in read-only mode."
        action={
          <button
            type="button"
            className="coral-button"
            onClick={() => setLocation("/trips/new")}
          >
            <PlaneTakeoff size={16} /> Plan your own trip
          </button>
        }
      />

      {/* Code Search Form */}
      <section className="share-code-search-strip">
        <form className="share-code-search-box" onSubmit={handleSearchCode}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Enter 6-character trip code (e.g. G7K4P9)..."
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            maxLength={10}
          />
          <button
            type="submit"
            className="coral-button btn-sm"
            disabled={isLoading || !codeInput.trim()}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            View trip
          </button>
        </form>
      </section>

      {errorMessage && (
        <div className="share-error-banner">
          <Lock size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading && (
        <div className="discover-loading-state">
          <Loader2 size={32} className="animate-spin text-coral" />
          <p>Retrieving shared journey...</p>
        </div>
      )}

      {/* Read-Only Trip View */}
      {trip && !isLoading && (
        <>
          <RouteConnector label={`Shared Travel Pass · Code ${trip.sharing.shareCode}`} />

          <section className="share-hero">
            <div>
              <span className="ticket-label">
                <Share2 size={15} /> Read-only route
              </span>
              <h1>
                {trip.name}
                <br />
                is a story worth <em>borrowing.</em>
              </h1>
              <p>
                {trip.description ||
                  "A shared route across destinations with enough detail to spark a version of your own."}
              </p>

              <div className="share-url">
                <span>{window.location.href}</span>
                <button type="button" onClick={handleCopyLink}>
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>

            <div className="share-pass">
              <span className="pass-holes" />
              <span className="eyebrow">Shared travel pass</span>
              <h2>{trip.name}</h2>
              <p>{trip.dateRange}</p>
              <div>
                <span>{trip.stops?.length || 0} stops</span>
                <span>{trip.duration || "5 days"}</span>
                <span>{trip.travelStyle}</span>
              </div>
              <strong>CODE: {trip.sharing.shareCode}</strong>
            </div>
          </section>

          {/* Interactive Map & Stops */}
          <section className="share-preview-grid">
            <article className="ink-card share-itinerary-preview">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Shared itinerary</span>
                  <h3>The route at a glance</h3>
                </div>
                <Route size={20} />
              </div>
              {trip.stops?.map((stop, index) => (
                <div key={stop.id || index}>
                  <strong>{stop.city}</strong>
                  <span>{stop.dateRange || "Stop"}</span>
                  <small>
                    {stop.days
                      ?.flatMap((d: any) => d.activities || [])
                      .slice(0, 2)
                      .map((a: any) => a.name)
                      .join(" · ") || stop.country}
                  </small>
                </div>
              ))}
            </article>

            <article className="ink-card share-budget-preview">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">Budget snapshot</span>
                  <h3>{formatRupees(trip.budget || 25000)}</h3>
                </div>
                <WalletCards size={20} />
              </div>
              <p>Shared itinerary plan and travel style.</p>
              <div className="read-only-badge">
                <Lock size={12} /> Read-only mode
              </div>
            </article>
          </section>

          {/* Real Map */}
          {trip.stops && trip.stops.length > 0 && (
            <section className="shared-map-section">
              <StorybookAtlasMap stops={trip.stops} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
