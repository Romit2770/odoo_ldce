/**
 * StorybookAtlasMap — Signature Interactive Map System
 *
 * State A (Default): The beloved Storybook Atlas illustrated / cartoon map.
 * State B (Hover / Tap): Smoothly transforms into a REAL geographic interactive map
 * with multi-leg shortest road routing (OSRM / Mapbox), distinct Start/Stop/End markers,
 * directional arrows, and auto-fitting bounds.
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
  calculateBearing,
  type CalculatedRoute,
  type RouteLeg,
  formatDurationHours,
  LEG_COLORS,
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
  const [isRealMapActive, setIsRealMapActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [routeData, setRouteData] = useState<CalculatedRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const arrowsLayerRef = useRef<L.LayerGroup | null>(null);
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

  // Calculate multi-leg real road route in exact sequence
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

    const map = L.map(mapContainerRef.current, {
      center: [19.0, 75.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // CartoDB Voyager tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    arrowsLayerRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Markers, Multi-Leg Route, Directional Arrows, and Auto-Fit bounds
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !isMapReady) return;

    if (markersGroupRef.current) markersGroupRef.current.clearLayers();
    if (routeLayerRef.current) routeLayerRef.current.clearLayers();
    if (arrowsLayerRef.current) arrowsLayerRef.current.clearLayers();

    const validStops = resolvedStops.filter((s) => s.latitude && s.longitude);
    if (validStops.length === 0) return;

    // 1. Draw distinct multi-leg real road routes
    if (routeData && routeData.legs.length > 0) {
      routeData.legs.forEach((leg, legIdx) => {
        if (leg.coordinates.length < 2) return;

        const latLngs: L.LatLngExpression[] = leg.coordinates.map((c) => [c[0], c[1]]);
        const legColor = leg.color || LEG_COLORS[legIdx % LEG_COLORS.length];

        // Glow line
        const glowLine = L.polyline(latLngs, {
          color: legColor,
          weight: 9,
          opacity: 0.3,
          lineCap: "round",
          lineJoin: "round",
        });

        // Core road polyline
        const coreLine = L.polyline(latLngs, {
          color: legColor,
          weight: 5,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "8, 8",
          className: "leaflet-animated-route",
        });

        // Popup
        coreLine.bindPopup(
          `<div class="atlas-marker-popup">
            <div class="popup-head">
              <span class="popup-tag" style="color: ${legColor};">Leg ${legIdx + 1}</span>
              <h4>${leg.fromName} → ${leg.toName}</h4>
            </div>
            <p class="popup-dates">🚗 ${leg.distanceKm} km · approx ${formatDurationHours(leg.durationMinutes)}</p>
          </div>`,
          { closeButton: false }
        );

        routeLayerRef.current?.addLayer(glowLine);
        routeLayerRef.current?.addLayer(coreLine);

        // Directional arrowheads along the leg
        const sampleIndices = [
          Math.floor(leg.coordinates.length * 0.33),
          Math.floor(leg.coordinates.length * 0.66),
        ];

        sampleIndices.forEach((idx) => {
          if (idx > 0 && idx < leg.coordinates.length - 1) {
            const p1 = leg.coordinates[idx];
            const p2 = leg.coordinates[idx + 1];
            const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

            const arrowHtml = `
              <div class="route-direction-arrow" style="transform: rotate(${bearing}deg);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${legColor}" stroke="#23304A" stroke-width="1.5">
                  <path d="M12 2L19 21L12 17L5 21L12 2Z" />
                </svg>
              </div>
            `;

            const arrowIcon = L.divIcon({
              html: arrowHtml,
              className: "custom-arrow-div-icon",
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });

            const arrowMarker = L.marker([p1[0], p1[1]], {
              icon: arrowIcon,
              interactive: false,
            });
            arrowsLayerRef.current?.addLayer(arrowMarker);
          }
        });
      });
    }

    // 2. Add custom GlobeTrotter Storybook Atlas HTML markers
    const bounds = L.latLngBounds([]);

    validStops.forEach((stop, index) => {
      const latLng = L.latLng(stop.latitude!, stop.longitude!);
      bounds.extend(latLng);

      const isFirst = index === 0;
      const isLast = index === validStops.length - 1 && validStops.length > 1;
      const orderNum = String(index + 1).padStart(2, "0");
      const isSelected = activeStopId === stop.id;
      const markerTypeClass = isFirst ? "marker-start" : isLast ? "marker-end" : "marker-stop";
      const tagLabel = isFirst ? "START" : isLast ? "END" : `STOP ${orderNum}`;

      const markerHtml = `
        <div class="atlas-real-marker ${markerTypeClass} ${isSelected ? "is-selected" : ""}">
          <div class="marker-pulse-ring"></div>
          <div class="marker-badge">
            <span class="marker-order">${orderNum}</span>
          </div>
          <div class="marker-flag">
            <span class="marker-type-tag">${tagLabel}</span>
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

      const popupContent = `
        <div class="atlas-marker-popup">
          <div class="popup-head">
            <span class="popup-tag">${tagLabel}</span>
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

    // 3. Auto-fit bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10,
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
      leafletMapRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 10 });
    }
  };

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
      {/* Map Header */}
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
                left: index === 0 ? "20%" : index === stops.length - 1 ? "80%" : `${20 + (index * 60) / Math.max(1, stops.length - 1)}%`,
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
            <b>{stop.arrival || `Stop ${index + 1}`}</b> {stop.city}
          </span>
        ))}
      </div>
    </article>
  );
}
