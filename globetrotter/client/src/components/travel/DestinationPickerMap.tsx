/**
 * DestinationPickerMap — New Trip Flow Step 2 (Destinations)
 * Combines real-time place search, interactive multi-leg road map,
 * distinct Start/Stop/End markers, directional arrows, and live route calculation.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Compass,
  GripVertical,
  Layers,
  Loader2,
  MapPin,
  Maximize2,
  Navigation,
  Plus,
  Route as RouteIcon,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { TripStop, City } from "@/domain/trip";
import { cityCatalog } from "@/domain/trip";
import {
  searchDestinations,
  reverseGeocode,
  calculateDrivingRoute,
  resolveDestinationCoordinates,
  calculateBearing,
  type GeocodedPlace,
  type CalculatedRoute,
  type RouteLeg,
  formatDurationHours,
  LEG_COLORS,
} from "@/services/map/mapService";

type DestinationPickerMapProps = {
  stops: TripStop[];
  onAddStop: (stop: Omit<TripStop, "id" | "days" | "color">) => void;
  onRemoveStop: (stopId: string) => void;
  onReorderStops: (sourceIndex: number, targetIndex: number) => void;
};

export function DestinationPickerMap({
  stops,
  onAddStop,
  onRemoveStop,
  onReorderStops,
}: DestinationPickerMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(stops[0]?.id || null);
  const [routeData, setRouteData] = useState<CalculatedRoute | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [hoveredLegIndex, setHoveredLegIndex] = useState<number | null>(null);

  // Click-to-add custom location state
  const [clickedLocation, setClickedLocation] = useState<GeocodedPlace | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const arrowsLayerRef = useRef<L.LayerGroup | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Place Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const results = await searchDestinations(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.warn("Search error", e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // CartoDB Voyager tiles (warm Storybook Atlas palette)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    arrowsLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    // Click anywhere on map to reverse geocode
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const place = await reverseGeocode(lat, lng);
      setClickedLocation(place);
    });

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update Route, Directional Arrows, and Markers when stops change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (markersLayerRef.current) markersLayerRef.current.clearLayers();
    if (routeLayerRef.current) routeLayerRef.current.clearLayers();
    if (arrowsLayerRef.current) arrowsLayerRef.current.clearLayers();

    const validStops = stops.filter((s) => s.latitude && s.longitude);

    // Calculate multi-leg real road route in exact sequence
    if (validStops.length >= 2) {
      setIsCalculatingRoute(true);
      calculateDrivingRoute(
        validStops.map((s) => ({
          latitude: s.latitude!,
          longitude: s.longitude!,
          name: s.city,
        }))
      )
        .then((res) => {
          setRouteData(res);
          setIsCalculatingRoute(false);

          if (!routeLayerRef.current || !arrowsLayerRef.current) return;
          routeLayerRef.current.clearLayers();
          arrowsLayerRef.current.clearLayers();

          // Render each distinct route leg with its individual color
          res.legs.forEach((leg, legIdx) => {
            if (leg.coordinates.length < 2) return;

            const latLngs: L.LatLngExpression[] = leg.coordinates.map((c) => [c[0], c[1]]);
            const legColor = leg.color || LEG_COLORS[legIdx % LEG_COLORS.length];

            // Outer glow line
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
              weight: 4.5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "7, 7",
              className: "leaflet-animated-route",
            });

            // Popup with leg details
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

            // Add directional arrows along the leg at 33% and 66% points
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
        })
        .catch(() => setIsCalculatingRoute(false));
    } else {
      setRouteData(null);
    }

    // Add Start, Stop, and End Markers strictly by ordered array index
    const bounds = L.latLngBounds([]);

    validStops.forEach((stop, index) => {
      const latLng = L.latLng(stop.latitude!, stop.longitude!);
      bounds.extend(latLng);

      const isFirst = index === 0;
      const isLast = index === validStops.length - 1 && validStops.length > 1;
      const orderNum = String(index + 1).padStart(2, "0");
      const isSelected = selectedStopId === stop.id;

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
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-atlas-div-icon",
        iconSize: [44, 44],
        iconAnchor: [22, 38],
      });

      const marker = L.marker(latLng, { icon: customIcon });
      marker.on("click", () => {
        setSelectedStopId(stop.id);
        map.flyTo(latLng, Math.max(map.getZoom(), 8), { duration: 1 });
      });

      if (markersLayerRef.current) {
        markersLayerRef.current.addLayer(marker);
      }
    });

    // Auto-fit bounds
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 10 });
    }
  }, [stops, selectedStopId]);

  // Select place from Search Results
  const handleSelectSearchResult = (place: GeocodedPlace) => {
    // Check if already in stops
    const existing = stops.find((s) => s.city.toLowerCase() === place.city.toLowerCase());
    if (existing) {
      toast.info(`${place.city} is already on your route.`);
      setSelectedStopId(existing.id);
      if (leafletMapRef.current && existing.latitude && existing.longitude) {
        leafletMapRef.current.flyTo([existing.latitude, existing.longitude], 9, { duration: 1 });
      }
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    onAddStop({
      city: place.name || place.city,
      country: place.country || "India",
      region: place.region || place.city,
      latitude: place.latitude,
      longitude: place.longitude,
      address: place.fullName,
      dateRange: "17–18 Aug",
      arrival: "17 Aug",
      departure: "18 Aug",
    });

    toast.success(`Added ${place.name} to your route!`);
    setSearchQuery("");
    setSearchResults([]);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([place.latitude, place.longitude], 8.5, { duration: 1.2 });
    }
  };

  // Add clicked location confirmation
  const handleConfirmClickedLocation = () => {
    if (!clickedLocation) return;
    handleSelectSearchResult(clickedLocation);
    setClickedLocation(null);
  };

  // Add predefined city from Catalog
  const handleAddCatalogCity = async (city: City) => {
    let lat = city.latitude;
    let lng = city.longitude;

    if (!lat || !lng) {
      const resolved = await resolveDestinationCoordinates(city.name);
      lat = resolved.latitude;
      lng = resolved.longitude;
    }

    onAddStop({
      city: city.name,
      country: city.country,
      region: city.region,
      latitude: lat,
      longitude: lng,
      address: `${city.name}, ${city.region}, ${city.country}`,
      dateRange: "17–18 Aug",
      arrival: "17 Aug",
      departure: "18 Aug",
    });

    toast.success(`${city.name} added to your journey.`);
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], 8, { duration: 1 });
    }
  };

  // Focus Stop on Map
  const handleFocusStop = (stop: TripStop) => {
    setSelectedStopId(stop.id);
    if (leafletMapRef.current && stop.latitude && stop.longitude) {
      leafletMapRef.current.flyTo([stop.latitude, stop.longitude], 9, { duration: 1 });
    }
  };

  const handleRecenter = () => {
    if (!leafletMapRef.current) return;
    const valid = stops.filter((s) => s.latitude && s.longitude);
    if (valid.length === 0) return;
    const bounds = L.latLngBounds(valid.map((s) => [s.latitude!, s.longitude!]));
    if (bounds.isValid()) {
      leafletMapRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 10 });
    }
  };

  return (
    <div className="destination-picker-workspace">
      {/* Search Header Bar */}
      <div className="dest-search-container">
        <div className="dest-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="dest-search-input"
            placeholder="Search a city, place or landmark (e.g. Surat, Mumbai, Goa, Jaipur, Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && <Loader2 size={16} className="animate-spin text-coral" />}
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* High-Contrast Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="dest-search-dropdown">
            <span className="dropdown-header">MATCHING DESTINATIONS</span>
            {searchResults.map((result) => {
              const isAlreadyAdded = stops.some(
                (s) => s.city.toLowerCase() === result.city.toLowerCase()
              );

              return (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <div className="result-icon-box">
                    <MapPin size={16} />
                  </div>
                  <div className="result-text-box">
                    <strong>{result.name}</strong>
                    <small>{result.fullName}</small>
                  </div>
                  {isAlreadyAdded ? (
                    <span className="add-status-badge is-added">
                      <Check size={13} /> Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="add-status-badge is-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSearchResult(result);
                      }}
                    >
                      <Plus size={13} /> Add to route
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Split Grid: Map on Left, Destinations List on Right */}
      <div className="dest-interactive-grid">
        {/* Real Interactive Map Canvas */}
        <div className="dest-map-viewport">
          <div ref={mapContainerRef} className="picker-map-element" />

          {/* Map Overlay Badge */}
          <div className="picker-map-badge">
            <Sparkles size={13} />
            <span>Interactive Road Map · Click anywhere to drop a pin</span>
          </div>

          <button
            type="button"
            className="picker-recenter-btn"
            onClick={handleRecenter}
            title="Fit all destinations in view"
          >
            <Maximize2 size={14} />
          </button>

          {/* Prompt if map was clicked */}
          {clickedLocation && (
            <div className="map-pin-prompt-box">
              <div className="prompt-header">
                <MapPin size={14} className="text-coral" />
                <strong>{clickedLocation.name}</strong>
              </div>
              <p>{clickedLocation.fullName}</p>
              <div className="prompt-actions">
                <button
                  type="button"
                  className="coral-button btn-xs"
                  onClick={handleConfirmClickedLocation}
                >
                  <Plus size={13} /> Add to route
                </button>
                <button
                  type="button"
                  className="outlined-action btn-xs"
                  onClick={() => setClickedLocation(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Live Multi-Leg Route Summary Bar */}
          {routeData && routeData.totalDistanceKm > 0 && (
            <div className="picker-route-stats">
              <div className="route-stats-header">
                <RouteIcon size={14} className="text-coral" />
                <span>
                  <strong>{routeData.totalDistanceKm} km</strong> driving route · approx{" "}
                  {formatDurationHours(routeData.totalDurationMinutes)}
                </span>
                {isCalculatingRoute && <Loader2 size={12} className="animate-spin text-coral" />}
              </div>

              {/* Legs mini-strip */}
              {routeData.legs.length > 1 && (
                <div className="route-legs-strip">
                  {routeData.legs.map((leg, idx) => (
                    <span
                      key={`${leg.fromName}-${leg.toName}-${idx}`}
                      className="leg-chip"
                      style={{ borderLeftColor: leg.color }}
                      title={`${leg.fromName} → ${leg.toName}: ${leg.distanceKm} km`}
                    >
                      <i style={{ background: leg.color }} />
                      <b>{idx + 1}</b> {leg.fromName} → {leg.toName} ({leg.distanceKm} km)
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Destinations List */}
        <div className="dest-selected-pane">
          <div className="pane-title-row">
            <div>
              <span className="eyebrow">Itinerary Spine</span>
              <h3>Selected route ({stops.length})</h3>
            </div>
            <span className="route-badge">
              <Navigation size={12} /> Ordered Stops
            </span>
          </div>

          <p className="pane-hint">
            The route connects strictly from <b>Start (01)</b> to <b>End</b>. Use arrows to reorder
            and the road route recalculates automatically!
          </p>

          <div className="dest-stops-list">
            {stops.length === 0 ? (
              <div className="empty-stops-box">
                <Compass size={28} className="text-coral spin-slow" />
                <strong>No destinations added yet</strong>
                <p>Search above or pick from popular recommendations below.</p>
              </div>
            ) : (
              stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === stops.length - 1 && stops.length > 1;
                const isSelected = selectedStopId === stop.id;
                const roleBadge = isFirst ? "START" : isLast ? "END" : `STOP ${index + 1}`;
                const legColor = LEG_COLORS[index % LEG_COLORS.length];

                return (
                  <div
                    key={stop.id || `${stop.city}-${index}`}
                    className={`dest-stop-row ${isSelected ? "is-selected" : ""} ${
                      isFirst ? "row-start" : isLast ? "row-end" : ""
                    }`}
                    onClick={() => handleFocusStop(stop)}
                  >
                    <span className="stop-num" style={{ borderColor: isFirst ? "#10B981" : isLast ? "#FF6550" : "var(--ink)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="stop-details">
                      <div className="stop-title-row">
                        <strong>{stop.city}</strong>
                        <span className={`stop-role-badge ${isFirst ? "role-start" : isLast ? "role-end" : ""}`}>
                          {roleBadge}
                        </span>
                      </div>
                      <small>{stop.region ? `${stop.region}, ${stop.country}` : stop.country}</small>
                    </div>

                    <div className="stop-order-tools" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="order-btn"
                        disabled={isFirst}
                        onClick={() => onReorderStops(index, index - 1)}
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        className="order-btn"
                        disabled={index === stops.length - 1}
                        onClick={() => onReorderStops(index, index + 1)}
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        type="button"
                        className="remove-stop-btn"
                        onClick={() => onRemoveStop(stop.id)}
                        title="Remove Stop"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Choice Catalog Destinations */}
          <div className="quick-catalog-section">
            <span className="catalog-label">SUGGESTED DISCOVERIES</span>
            <div className="quick-choice-chips">
              {cityCatalog.map((city) => {
                const isAlreadySelected = stops.some(
                  (s) => s.city.toLowerCase() === city.name.toLowerCase()
                );
                return (
                  <button
                    key={city.id}
                    type="button"
                    className={`catalog-chip ${isAlreadySelected ? "is-added" : ""}`}
                    disabled={isAlreadySelected}
                    onClick={() => handleAddCatalogCity(city)}
                  >
                    <MapPin size={12} />
                    <span>{city.name}</span>
                    {isAlreadySelected ? <Check size={12} /> : <Plus size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
