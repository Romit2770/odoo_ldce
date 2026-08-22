/**
 * TripsListView — Dynamic My Trips page connected to Local MongoDB
 * Strictly filters by authenticated user's ID, persists across refreshes and logins.
 */

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  CalendarDays,
  Check,
  Copy,
  Loader2,
  MapPin,
  PlaneTakeoff,
  Plus,
  Route,
  Search,
  Settings2,
  Share2,
  Trash2,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro, RouteConnector, StatusPill, EmptyJournal } from "@/components/ProductUi";
import { DemoDialog } from "@/components/DemoUi";
import { useAuth } from "@/contexts/AuthContext";
import { useTripPlanner } from "@/contexts/TripPlannerContext";
import { mongoTripService } from "@/services/api/mongoTripService";
import { ShareTripModal } from "./ShareTripModal";
import { formatRupees } from "@/lib/tripMath";
import type { Trip, TripStatus } from "@/domain/trip";

export function TripsListView() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { setTrip } = useTripPlanner();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TripStatus | "All">("All");

  const [pendingDelete, setPendingDelete] = useState<Trip | null>(null);
  const [sharingTrip, setSharingTrip] = useState<Trip | null>(null);

  // Load trips from MongoDB
  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const data = await mongoTripService.getTrips(user);
      setTrips(data);
    } catch (err) {
      console.warn("[TripsPage] Failed to load trips from MongoDB:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  // Handle Delete Trip
  const handleDeleteTrip = async () => {
    if (!pendingDelete) return;
    try {
      await mongoTripService.deleteTrip(pendingDelete.id, user);
      setTrips((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      toast.success(`Deleted "${pendingDelete.name}" from your travel journal.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trip.");
    } finally {
      setPendingDelete(null);
    }
  };

  // Normalize status for tab matching
  const normalizeStatus = (status?: string): "Upcoming" | "Ongoing" | "Completed" | "Draft" => {
    const s = (status || "").toLowerCase();
    if (s === "planned" || s === "upcoming") return "Upcoming";
    if (s === "ongoing" || s === "active") return "Ongoing";
    if (s === "completed") return "Completed";
    if (s === "draft") return "Draft";
    return "Upcoming";
  };

  // Tab counts
  const getTabCount = (tab: TripStatus | "All") => {
    if (tab === "All") return trips.length;
    return trips.filter((t) => normalizeStatus(t.status) === tab).length;
  };

  // Filtered trips
  const filtered = trips.filter((t) => {
    const routeString = t.stops?.map((s) => s.city).join(" → ") || "";
    const normalized = normalizeStatus(t.status);
    const matchesFilter = filter === "All" || normalized === filter;
    const matchesQuery =
      query.trim() === "" ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      routeString.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const getAccent = (index: number) => {
    const accents = ["coral", "teal", "mustard", "navy"];
    return accents[index % accents.length];
  };

  return (
    <div className="page-stack trips-page">
      <PageIntro
        eyebrow="My trips"
        title="Every good story"
        accent="needs a route."
        description="Keep upcoming, ongoing, completed, and still-scribbled adventures together in your persistent travel desk."
        action={
          <button
            type="button"
            className="coral-button"
            onClick={() => setLocation("/trips/new")}
          >
            <Plus size={17} /> Plan a trip
          </button>
        }
      />

      <section className="trip-filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your travel journal"
            aria-label="Search trips"
          />
        </label>
        <div className="filter-chips">
          {(["All", "Upcoming", "Ongoing", "Completed", "Draft"] as const).map((item) => {
            const count = getTabCount(item);
            return (
              <button
                key={item}
                type="button"
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item} <span style={{ opacity: 0.85, fontSize: "0.9em", fontWeight: 700 }}>({count})</span>
              </button>
            );
          })}
        </div>
      </section>

      <RouteConnector label="routes saved in your MongoDB travel atlas" />

      {isLoading ? (
        <div className="discover-loading-state">
          <Loader2 size={32} className="animate-spin text-coral" />
          <p>Loading your trips from database...</p>
        </div>
      ) : (
        <section className="trip-card-grid">
          {filtered.length === 0 ? (
            <EmptyJournal
              title="Your travel journal is waiting for its first story."
              body="Begin with a fresh route that feels like you."
              actionLabel="Plan a trip"
              actionPath="/trips/new"
            />
          ) : (
            filtered.map((item, index) => {
              const routeString = item.stops?.map((s) => s.city).join(" → ") || "Route in planning";
              const stopCount = item.stops?.length || 0;
              const progress = item.stops && item.stops.length > 0 ? Math.min(100, item.stops.length * 25) : 15;

              return (
                <article className={`trip-management-card ${getAccent(index)}`} key={item.id}>
                  <div className="trip-cover">
                    <span className="ticket-label">
                      <Route size={14} /> {routeString}
                    </span>
                    <span className="cover-number">{stopCount} stops</span>
                  </div>

                  <div className="trip-card-body">
                    <div className="trip-card-title">
                      <div>
                        <h2>{item.name}</h2>
                        <p>
                          {item.dateRange} · {stopCount} {stopCount === 1 ? "city" : "cities"}
                        </p>
                      </div>
                      <StatusPill status={item.status || "Upcoming"} />
                    </div>

                    <div className="trip-progress-row">
                      <span>Route progress</span>
                      <div>
                        <i style={{ width: `${progress}%` }} />
                      </div>
                      <b>{progress}%</b>
                    </div>

                    <div className="trip-card-meta">
                      <span>
                        <CalendarDays size={14} /> {item.duration || "5 days"}
                      </span>
                      <span>
                        <WalletCards size={14} /> {formatRupees(item.budget || 25000)}
                      </span>
                    </div>

                    <div className="trip-card-actions">
                      <button
                        type="button"
                        className="outlined-action"
                        onClick={() => {
                          setTrip(item);
                          setLocation(`/trips/${item.id}`);
                        }}
                      >
                        View trip
                      </button>
                      <button
                        type="button"
                        className="icon-text-button"
                        onClick={() => setSharingTrip(item)}
                      >
                        <Share2 size={15} /> Share
                      </button>
                      <button
                        type="button"
                        className="icon-text-button danger"
                        onClick={() => setPendingDelete(item)}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <DemoDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.name}"?`}
        body="This will permanently delete this trip and its planned stops from your MongoDB database."
        confirmLabel="Delete trip"
        danger
        onConfirm={handleDeleteTrip}
        onClose={() => setPendingDelete(null)}
      />

      {/* Share Modal */}
      {sharingTrip && (
        <ShareTripModal
          trip={sharingTrip}
          isOpen={Boolean(sharingTrip)}
          onClose={() => setSharingTrip(null)}
        />
      )}
    </div>
  );
}
