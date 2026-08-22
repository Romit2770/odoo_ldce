/**
 * DestinationsManager — Dedicated Trip Locations & Route Planner
 * "Where am I going?" — Functional utility for managing route stops, sequence, and road navigation.
 */

import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight,
  GripVertical,
  MapPin,
  Navigation,
  PlaneTakeoff,
  Plus,
  Route,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro, RouteConnector } from "@/components/ProductUi";
import { DestinationPickerMap } from "@/components/travel/DestinationPickerMap";
import { useTripPlanner } from "@/contexts/TripPlannerContext";

export function DestinationsManager() {
  const [, setLocation] = useLocation();
  const { trip, addStop, removeStop, reorderStopIndex } = useTripPlanner();

  const handleAddStop = (stopData: any) => {
    addStop({
      city: stopData.city,
      country: stopData.country || "India",
      region: stopData.region || stopData.city,
      latitude: stopData.latitude,
      longitude: stopData.longitude,
      address: stopData.address,
      dateRange: "17–18 Aug",
      arrival: "17 Aug",
      departure: "18 Aug",
    });
  };

  return (
    <div className="page-stack destinations-page">
      <PageIntro
        eyebrow="Route & Destinations"
        title="Plan the places"
        accent="you’ll visit."
        description="Build your route, organize your stops, and shape the journey."
        action={
          <button
            type="button"
            className="coral-button"
            onClick={() => setLocation("/trips/new")}
          >
            <PlaneTakeoff size={16} /> New Trip Route
          </button>
        }
      />

      <RouteConnector label="interactive atlas journey organizer" />

      {/* Main Interactive Map & Stops Workspace */}
      <section className="destinations-workspace-container">
        <DestinationPickerMap
          stops={trip.stops}
          onAddStop={handleAddStop}
          onRemoveStop={(id) => {
            removeStop(id);
            toast.success("Stop removed from itinerary.");
          }}
          onReorderStops={(fromIndex, toIndex) => {
            reorderStopIndex(fromIndex, toIndex);
            toast.success("Route stops reordered.");
          }}
        />
      </section>
    </div>
  );
}
