/**
 * StorybookAtlasMap — Signature Interactive Map System
 *
 * State A (Default): The beloved Storybook Atlas illustrated / cartoon map.
 * State B (Hover / Tap): Smoothly transforms into a REAL geographic interactive map
 * with actual road routing (OSRM / Mapbox), custom GlobeTrotter numbered markers,
 * progressive route drawing, and auto-fitting bounds.
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Expand,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
  Sparkles,
  Zap,
} from "lucide-react";
import type { TripStop } from "@/domain/trip";
import {
  calculateDrivingRoute,
  resolveDestinationCoordinates,
  type CalculatedRoute,
} from "@/services/map/mapService";

type StorybookAtlasMapProps = {
  stops: TripStop[];
  tripName?: string;
  activeStopId?: string;
  onSelectStop?: (stopId: string) => void;
  className?: string;
};

export function StorybookAtlasMap({
  stops,
  tripName = "Your Route",
  activeStopId,
  onSelectStop,
  className = "",
}: StorybookAtlasMapProps) {
  // State: illustrated vs real map mode
  const [isRealMapActive, setIsRealMapActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [routeData, setRouteData] = useState<CalculatedRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derive resolved destination coordinates
  const [resolvedStops, setResolvedStops] = useState<TripStop[]>(stops);

  // Resolve coordinates for all stops
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      const updated = await Promise.all(
        stops.map(async (stop, idx) => {
          if (stop.latitude && stop.longitude) {
            return { ...stop, order: idx + 1 };
          }
          const coords = await resolveDestinationCoordinates(stop.city);
          return {
            ...stop,
            latitude: coords.latitude,
            longitude: coords.longitude,
            order: idx + 1,
          };
        })
      );
      if (!isCancelled) {
        setResolvedStops(updated);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [stops]);

  // Calculate real road route whenever resolved stops change
  useEffect(() => {
    let isCancelled = false;
    if (resolvedStops.length < 2) {
      setRouteData(null);
      return;
    }

    setIsLoadingRoute(true);
    const validPoints = resolvedStops
      .filter((s) => s.latitude && s.longitude)
      .map((s) => ({
        latitude: s.latitude!,
        longitude: s.longitude!,
        name: s.city,
      }));

    calculateDrivingRoute(validPoints)
      .then((res) => {
        if (!isCancelled) {
          setRouteData(res);
          setIsLoadingRoute(false);
        }
      })
      .catch((err) => {
        console.warn("Route calc error", err);
        if (!isCancelled) setIsLoadingRoute(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [resolvedStops]);

  // Initialize Leaflet Real Map in background (preloaded for zero-lag transition)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    // Default view over India (Mumbai/Goa center)
    const map = L.map(mapContainerRef.current, {
      center: [17.0, 73.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // Warm, parchment-inspired CartoDB Voyager tile layer (complements Storybook Atlas palette)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Zoom control at bottom-right
    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Markers, Route line, and Auto-Fit bounds on Real Map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !isMapReady) return;

    // Clear previous markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Clear previous polyline
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    const validStops = resolvedStops.filter((s) => s.latitude && s.longitude);
    if (validStops.length === 0) return;

    // 1. Draw animated real road route
    if (routeData && routeData.coordinates.length > 0) {
      const latLngs: L.LatLngExpression[] = routeData.coordinates.map((c) => [c[0], c[1]]);

      // Outer glow line
      const glowLine = L.polyline(latLngs, {
        color: "rgba(255, 101, 80, 0.35)",
        weight: 10,
        opacity: 0.8,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(markersGroupRef.current || map);

      // Core route line
      const polyline = L.polyline(latLngs, {
        color: "#FF6550", // Globe Coral
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        dashArray: "8, 8",
        className: "leaflet-animated-route",
      }).addTo(map);

      polylineLayerRef.current = polyline;
    }

    // 2. Add custom GlobeTrotter Storybook Atlas HTML markers
    const bounds = L.latLngBounds([]);

    validStops.forEach((stop, index) => {
      const latLng = L.latLng(stop.latitude!, stop.longitude!);
      bounds.extend(latLng);

      const isFirst = index === 0;
      const isLast = index === validStops.length - 1;
      const orderNum = String(index + 1).padStart(2, "0");
      const isSelected = activeStopId === stop.id;

      // Custom Storybook Atlas Marker HTML
      const markerHtml = `
        <div class="atlas-real-marker ${isSelected ? "is-selected" : ""} ${isFirst ? "marker-start" : ""} ${isLast ? "marker-end" : ""}">
          <div class="marker-pulse-ring"></div>
          <div class="marker-badge">
            <span class="marker-order">${orderNum}</span>
          </div>
          <div class="marker-flag">
            <span class="marker-city">${stop.city}</span>
            <small class="marker-date">${stop.dateRange || `Stop ${index + 1}`}</small>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-atlas-div-icon",
        iconSize: [44, 44],
        iconAnchor: [22, 40],
        popupAnchor: [0, -36],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      // Popup with stop details
      const popupContent = `
        <div class="atlas-marker-popup">
          <div class="popup-head">
            <span class="popup-tag">${isFirst ? "Starting Point" : isLast ? "Final Destination" : `Stop ${orderNum}`}</span>
            <h4>${stop.city}</h4>
          </div>
          <p class="popup-dates">📅 ${stop.dateRange || "Scheduled stop"}</p>
          <div class="popup-stats">
            <span>✨ ${stop.days?.flatMap((d) => d.activities).length || 0} moments</span>
            <span>📍 ${stop.region || stop.country}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "atlas-custom-popup",
        closeButton: false,
        offset: [0, -10],
      });

      marker.on("click", () => {
        setActiveMarkerId(stop.id);
        if (onSelectStop) onSelectStop(stop.id);
        map.flyTo(latLng, Math.max(map.getZoom(), 9), {
          duration: 1.2,
          easeLinearity: 0.25,
        });
      });

      if (markersGroupRef.current) {
        markersGroupRef.current.addLayer(marker);
      }
    });

    // 3. Auto-fit bounds to encompass all destinations with comfortable padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 11,
        animate: true,
      });
    }
  }, [resolvedStops, routeData, isMapReady, activeStopId, onSelectStop]);

  // Handle fly to active stop when selected from outside
  useEffect(() => {
    if (!activeStopId || !leafletMapRef.current) return;
    const target = resolvedStops.find((s) => s.id === activeStopId);
    if (target && target.latitude && target.longitude) {
      leafletMapRef.current.flyTo([target.latitude, target.longitude], 10, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [activeStopId, resolvedStops]);

  // Pointer & Hover management
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
    setIsRealMapActive(true);

    // Invalidate map size after transition to ensure crisp tile rendering
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsRealMapActive(false);
    }, 450);
  }, []);

  const handleToggleMobile = () => {
    setIsRealMapActive((prev) => !prev);
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!leafletMapRef.current) return;
    const valid = resolvedStops.filter((s) => s.latitude && s.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map((s) => [s.latitude!, s.longitude!]));
    if (bounds.isValid()) {
      leafletMapRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 11 });
    }
  };

  // Route summary string
  const totalDistance = routeData?.totalDistanceKm || 590;
  const routeSummaryString = stops.map((s) => s.city).join(" → ");

  return (
    <article
      ref={containerRef}
      className={`route-map-card atlas-interactive-map-card ${isRealMapActive ? "is-real-mode" : "is-illustrated-mode"} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label="Interactive trip map. Hover or tap to explore real geographic map."
    >
      {/* Map Header with Distance & State Pill */}
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Your route</span>
          <h3>{routeSummaryString}</h3>
        </div>
        <div className="map-heading-right">
          <span className="map-distance">
            <RouteIcon size={15} /> {totalDistance} km
          </span>
          <button
            type="button"
            className="map-mode-toggle-chip"
            onClick={handleToggleMobile}
            title="Toggle between Storybook Atlas and Real Geographic Map"
          >
            {isRealMapActive ? (
              <>
                <Layers size={13} />
                <span>Real Map</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Illustrated</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Layer 1: Illustrated Cartoon Map (Default State A) */}
      <div className="illustrated-map-layer">
        <div className="map-illustration">
          {stops.map((stop, index) => (
            <span
              className={`map-location ${index === 0 ? "mumbai" : index === 1 ? "goa" : "custom-stop"}`}
              key={stop.id || `${stop.city}-${index}`}
              style={{
                left: index === 0 ? "20%" : index === stops.length - 1 ? "80%" : `${20 + (index * 60) / (stops.length - 1)}%`,
                top: index % 2 === 0 ? "25%" : "68%",
              }}
            >
              <i>{index + 1}</i>
              {stop.city}
            </span>
          ))}

          {/* Decorative Route SVG */}
          <svg viewBox="0 0 600 320" preserveAspectRatio="none" aria-hidden="true">
            <path d="M128 72 C210 85 154 190 305 184 S390 260 475 222" />
          </svg>

          {/* Illustrated elements */}
          <div className="map-sun" />
          <div className="map-cloud c1" />
          <div className="map-cloud c2" />
          <div className="map-hill h1" />
          <div className="map-hill h2" />
        </div>

        {/* Hover Cue Banner */}
        <div className="illustrated-hover-cue">
          <div className="cue-content">
            <Compass size={14} className="spin-slow" />
            <span>Hover cursor to reveal real geographic road route</span>
            <Eye size={13} />
          </div>
        </div>
      </div>

      {/* Layer 2: Real Geographic Interactive Map (State B) */}
      <div className="real-map-layer" aria-hidden={!isRealMapActive}>
        <div ref={mapContainerRef} className="leaflet-map-canvas" />

        {/* Floating Quick Action Overlay */}
        <div className="real-map-floating-bar">
          <div className="real-route-badge">
            <Navigation size={13} className="text-coral" />
            <span>
              {isLoadingRoute
                ? "Calculating real road network..."
                : `${totalDistance} km actual road route`}
            </span>
          </div>

          <div className="map-floating-controls">
            <button
              type="button"
              className="map-float-btn"
              onClick={handleRecenter}
              title="Fit all destinations in view"
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              className="map-float-btn return-btn"
              onClick={() => setIsRealMapActive(false)}
              title="Return to illustrated atlas"
            >
              <span>Atlas view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Foot with arrival notes */}
      <div className="map-foot">
        {stops.map((stop, index) => (
          <span
            key={stop.id || `${stop.city}-${index}`}
            className={activeStopId === stop.id ? "active-foot-stop" : ""}
            onClick={() => onSelectStop && onSelectStop(stop.id)}
          >
            <b>{stop.arrival || `Day ${index + 1}`}</b> {stop.city}
          </span>
        ))}
      </div>
    </article>
  );
}
