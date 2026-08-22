/**
 * GlobeTrotter Geographic & Routing Services
 * Provides production-ready geocoding, reverse geocoding, and real road routing.
 * Supports OpenStreetMap (Nominatim & Photon) + OSRM with optional Mapbox enhancement.
 */

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeocodedPlace = {
  id: string;
  name: string;
  fullName: string;
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type RouteLeg = {
  fromName: string;
  toName: string;
  distanceKm: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lat, lng][]
};

export type CalculatedRoute = {
  coordinates: [number, number][]; // [lat, lng][]
  totalDistanceKm: number;
  totalDurationMinutes: number;
  legs: RouteLeg[];
  summary: string;
};

// Built-in high-accuracy coordinate lookup for fast offline/zero-latency resolution
export const PRESET_COORDINATES: Record<string, GeocodedPlace> = {
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    fullName: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    country: "India",
    region: "Maharashtra",
    latitude: 18.922,
    longitude: 72.8347,
  },
  goa: {
    id: "goa",
    name: "Goa",
    fullName: "Goa (Baga / Panaji), India",
    city: "Goa",
    country: "India",
    region: "Goa",
    latitude: 15.5527,
    longitude: 73.7517,
  },
  jaipur: {
    id: "jaipur",
    name: "Jaipur",
    fullName: "Jaipur, Rajasthan, India",
    city: "Jaipur",
    country: "India",
    region: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
  },
  udaipur: {
    id: "udaipur",
    name: "Udaipur",
    fullName: "Udaipur, Rajasthan, India",
    city: "Udaipur",
    country: "India",
    region: "Rajasthan",
    latitude: 24.5854,
    longitude: 73.7125,
  },
  kerala: {
    id: "kerala",
    name: "Kerala",
    fullName: "Kochi, Kerala, India",
    city: "Kerala",
    country: "India",
    region: "Kerala",
    latitude: 9.9312,
    longitude: 76.2673,
  },
  manali: {
    id: "manali",
    name: "Manali",
    fullName: "Manali, Himachal Pradesh, India",
    city: "Manali",
    country: "India",
    region: "Himachal Pradesh",
    latitude: 32.2432,
    longitude: 77.1892,
  },
  delhi: {
    id: "delhi",
    name: "Delhi",
    fullName: "New Delhi, Delhi, India",
    city: "Delhi",
    country: "India",
    region: "Delhi",
    latitude: 28.6139,
    longitude: 77.209,
  },
  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    fullName: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    country: "India",
    region: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  hyderabad: {
    id: "hyderabad",
    name: "Hyderabad",
    fullName: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    country: "India",
    region: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
  },
  agra: {
    id: "agra",
    name: "Agra",
    fullName: "Agra, Uttar Pradesh, India",
    city: "Agra",
    country: "India",
    region: "Uttar Pradesh",
    latitude: 27.1767,
    longitude: 78.0081,
  },
  varanasi: {
    id: "varanasi",
    name: "Varanasi",
    fullName: "Varanasi, Uttar Pradesh, India",
    city: "Varanasi",
    country: "India",
    region: "Uttar Pradesh",
    latitude: 25.3176,
    longitude: 82.9739,
  },
};

/**
 * Resolve coordinates for a destination name.
 * Uses preset lookup, then queries geocoding API if unknown.
 */
export async function resolveDestinationCoordinates(destinationName: string): Promise<Coordinates> {
  const normalized = destinationName.trim().toLowerCase();
  if (PRESET_COORDINATES[normalized]) {
    return {
      latitude: PRESET_COORDINATES[normalized].latitude,
      longitude: PRESET_COORDINATES[normalized].longitude,
    };
  }

  try {
    const results = await searchDestinations(destinationName);
    if (results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
  } catch (err) {
    console.warn("Geocoding failed for:", destinationName, err);
  }

  // Fallback to Mumbai if completely unresolvable
  return { latitude: 18.922, longitude: 72.8347 };
}

/**
 * Search places using Photon / OpenStreetMap worldwide geocoding
 */
export async function searchDestinations(query: string): Promise<GeocodedPlace[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // 1. If Mapbox Token is available, query Mapbox Geocoding
  if (mapboxToken) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        cleanQuery
      )}.json?access_token=${mapboxToken}&types=place,locality,region,country&limit=6`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.features.map((f: any) => ({
          id: f.id,
          name: f.text || f.place_name.split(",")[0],
          fullName: f.place_name,
          city: f.text || "",
          country: f.context?.find((c: any) => c.id.startsWith("country"))?.text || "",
          region: f.context?.find((c: any) => c.id.startsWith("region"))?.text || "",
          latitude: f.center[1],
          longitude: f.center[0],
        }));
      }
    } catch (e) {
      console.warn("Mapbox geocode failed, falling back to OSM", e);
    }
  }

  // 2. Query Photon (Komoot OpenStreetMap Geocoder) — Fast, free, high quality
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=6`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        return data.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const name = props.name || props.city || cleanQuery;
          const city = props.city || props.town || props.state || name;
          const country = props.country || "";
          const state = props.state || "";
          const fullName = [name, state, country].filter(Boolean).join(", ");
          return {
            id: `place_${idx}_${Date.now()}`,
            name,
            fullName,
            city,
            country,
            region: state,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
          };
        });
      }
    }
  } catch (err) {
    console.warn("Photon search failed, trying local filter", err);
  }

  // 3. Fallback: Search preset database
  const matchingPresets = Object.values(PRESET_COORDINATES).filter(
    (p) =>
      p.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      p.country.toLowerCase().includes(cleanQuery.toLowerCase())
  );

  return matchingPresets;
}

/**
 * Reverse geocode a latitude & longitude to a human-readable location
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const name =
        addr.city || addr.town || addr.village || addr.county || data.name || "Selected Place";
      const region = addr.state || addr.region || "";
      const country = addr.country || "";
      return {
        id: `reverse_${lat.toFixed(4)}_${lng.toFixed(4)}`,
        name,
        fullName: data.display_name || `${name}, ${region}, ${country}`,
        city: name,
        region,
        country,
        latitude: lat,
        longitude: lng,
      };
    }
  } catch (err) {
    console.warn("Reverse geocoding failed", err);
  }

  return {
    id: `coord_${lat.toFixed(4)}_${lng.toFixed(4)}`,
    name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
    fullName: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    city: "Custom Location",
    region: "",
    country: "",
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Calculate actual driving route following real road geometry
 * using OSRM (Open Source Routing Machine) or Mapbox Directions.
 */
export async function calculateDrivingRoute(
  stops: { latitude: number; longitude: number; name?: string }[]
): Promise<CalculatedRoute> {
  if (stops.length < 2) {
    return {
      coordinates: stops.map((s) => [s.latitude, s.longitude]),
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      legs: [],
      summary: "Single destination",
    };
  }

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // 1. If Mapbox Token is available, query Mapbox Directions
  if (mapboxToken) {
    try {
      const coordString = stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const r = data.routes[0];
          const rawCoords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [
            c[1],
            c[0],
          ]); // convert [lng, lat] to [lat, lng]
          const totalDistanceKm = Math.round(r.distance / 1000);
          const totalDurationMinutes = Math.round(r.duration / 60);

          const legs: RouteLeg[] = (r.legs || []).map((leg: any, idx: number) => ({
            fromName: stops[idx]?.name || `Stop ${idx + 1}`,
            toName: stops[idx + 1]?.name || `Stop ${idx + 2}`,
            distanceKm: Math.round(leg.distance / 1000),
            durationMinutes: Math.round(leg.duration / 60),
            coordinates: [],
          }));

          return {
            coordinates: rawCoords,
            totalDistanceKm,
            totalDurationMinutes,
            legs,
            summary: `${totalDistanceKm} km · ${formatDurationHours(totalDurationMinutes)}`,
          };
        }
      }
    } catch (e) {
      console.warn("Mapbox directions failed, falling back to OSRM", e);
    }
  }

  // 2. Query OSRM (Open Source Routing Machine) — Free, real road geometry
  try {
    const coordString = stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const r = data.routes[0];
        const rawCoords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [
          c[1],
          c[0],
        ]); // convert [lng, lat] to [lat, lng]
        const totalDistanceKm = Math.round(r.distance / 1000);
        const totalDurationMinutes = Math.round(r.duration / 60);

        const legs: RouteLeg[] = (r.legs || []).map((leg: any, idx: number) => ({
          fromName: stops[idx]?.name || `Stop ${idx + 1}`,
          toName: stops[idx + 1]?.name || `Stop ${idx + 2}`,
          distanceKm: Math.round(leg.distance / 1000),
          durationMinutes: Math.round(leg.duration / 60),
          coordinates: [],
        }));

        return {
          coordinates: rawCoords,
          totalDistanceKm,
          totalDurationMinutes,
          legs,
          summary: `${totalDistanceKm} km · ${formatDurationHours(totalDurationMinutes)}`,
        };
      }
    }
  } catch (err) {
    console.warn("OSRM routing failed, using geodesic interpolation fallback", err);
  }

  // 3. Geodesic interpolation fallback with realistic road detour multiplier (1.25x)
  const fallbackCoords: [number, number][] = [];
  let totalDist = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const p1 = stops[i];
    const p2 = stops[i + 1];
    const dist = calculateGreatCircleDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    totalDist += dist * 1.22; // Road factor

    // Interpolate 15 smooth steps
    const steps = 15;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const lat = p1.latitude + (p2.latitude - p1.latitude) * t;
      const lng = p1.longitude + (p2.longitude - p1.longitude) * t;
      fallbackCoords.push([lat, lng]);
    }
  }

  const roundedKm = Math.round(totalDist);
  const estMinutes = Math.round((roundedKm / 55) * 60); // approx 55 km/h average

  return {
    coordinates: fallbackCoords,
    totalDistanceKm: roundedKm,
    totalDurationMinutes: estMinutes,
    legs: [],
    summary: `${roundedKm} km · ${formatDurationHours(estMinutes)}`,
  };
}

export function formatDurationHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function calculateGreatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
