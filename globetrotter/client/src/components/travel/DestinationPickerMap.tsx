/**
 * DestinationPickerMap — New Trip Flow Step 2 (Destinations)
 * Combines real-time place search, interactive geographic map,
 * destination reordering, and live road routing.
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
  type GeocodedPlace,
  type CalculatedRoute,
  formatDurationHours,
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

  // Click-to-add custom location state
  const [clickedLocation, setClickedLocation] = useState<GeocodedPlace | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const glowLayerRef = useRef<L.Polyline | null>(null);
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
    }, 280);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [19.0, 75.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    // CartoDB Voyager tiles (warm Storybook Atlas palette)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    // Click anywhere on map to reverse geocode and prompt adding destination
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

  // Update Route and Markers when stops change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (glowLayerRef.current) {
      map.removeLayer(glowLayerRef.current);
      glowLayerRef.current = null;
    }

    const validStops = stops.filter((s) => s.latitude && s.longitude);

    // Calculate real driving route
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

          if (res.coordinates.length > 0) {
            const latLngs: L.LatLngExpression[] = res.coordinates.map((c) => [c[0], c[1]]);

            // Outer glow
            glowLayerRef.current = L.polyline(latLngs, {
              color: "rgba(255, 101, 80, 0.3)",
              weight: 9,
              lineCap: "round",
            }).addTo(map);

            // Core line
            routeLayerRef.current = L.polyline(latLngs, {
              color: "#FF6550",
              weight: 4,
              dashArray: "6, 6",
              className: "leaflet-animated-route",
            }).addTo(map);
          }
        })
        .catch(() => setIsCalculatingRoute(false));
    } else {
      setRouteData(null);
    }

    // Add Markers
    const bounds = L.latLngBounds([]);

    validStops.forEach((stop, index) => {
      const latLng = L.latLng(stop.latitude!, stop.longitude!);
      bounds.extend(latLng);

      const orderNum = String(index + 1).padStart(2, "0");
      const isSelected = selectedStopId === stop.id;

      const markerHtml = `
        <div class="atlas-real-marker ${isSelected ? "is-selected" : ""}">
          <div class="marker-badge">
            <span class="marker-order">${orderNum}</span>
          </div>
          <div class="marker-flag">
            <span class="marker-city">${stop.city}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-atlas-div-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 32],
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
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
      leafletMapRef.current.flyTo([place.latitude, place.longitude], 9, { duration: 1.2 });
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

  return (
    <div className="destination-picker-workspace">
      {/* Search Header Bar */}
      <div className="dest-search-container">
        <div className="dest-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="dest-search-input"
            placeholder="Search a city, place or landmark (e.g. Mumbai, Goa, Jaipur, Paris)..."
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

        {/* Search Results Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="dest-search-dropdown">
            <span className="dropdown-header">MATCHING DESTINATIONS</span>
            {searchResults.map((result) => (
              <button
                key={result.id}
                type="button"
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
                <Plus size={16} className="add-glyph" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Grid: Map on Left/Center, Destinations List on Right */}
      <div className="dest-interactive-grid">
        {/* Real Interactive Map Canvas */}
        <div className="dest-map-viewport">
          <div ref={mapContainerRef} className="picker-map-element" />

          {/* Map Overlay Badge */}
          <div className="picker-map-badge">
            <Sparkles size={13} />
            <span>Interactive Road Map · Click anywhere to drop a pin</span>
          </div>

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

          {/* Live Route Summary Pill */}
          {routeData && routeData.totalDistanceKm > 0 && (
            <div className="picker-route-stats">
              <RouteIcon size={14} className="text-coral" />
              <span>
                <strong>{routeData.totalDistanceKm} km</strong> driving route · approx{" "}
                {formatDurationHours(routeData.totalDurationMinutes)}
              </span>
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
            Drag or use arrows to change travel order. The road route automatically recalculates!
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
                const isLast = index === stops.length - 1;
                const isSelected = selectedStopId === stop.id;

                return (
                  <div
                    key={stop.id || `${stop.city}-${index}`}
                    className={`dest-stop-row ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleFocusStop(stop)}
                  >
                    <span className="stop-num">{String(index + 1).padStart(2, "0")}</span>

                    <div className="stop-details">
                      <strong>{stop.city}</strong>
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
                        disabled={isLast}
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
