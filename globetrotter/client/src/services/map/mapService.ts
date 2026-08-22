/**
 * GlobeTrotter / Musafir Geographic & Routing Services
 * High-accuracy geocoding, reverse geocoding, multi-leg real road routing,
 * and shortest practical path selection.
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
  color: string;
  summary?: string;
};

export type CalculatedRoute = {
  coordinates: [number, number][]; // concatenated [lat, lng][]
  totalDistanceKm: number;
  totalDurationMinutes: number;
  legs: RouteLeg[];
  summary: string;
};

// Segment colors from the Storybook Atlas palette
export const LEG_COLORS = [
  "#FF6550", // Globe Coral (Leg 1)
  "#F59E0B", // Marigold / Amber (Leg 2)
  "#0D9488", // Sea-glass Teal (Leg 3)
  "#6366F1", // Indigo / Navy (Leg 4)
  "#EC4899", // Rose (Leg 5)
  "#8B5CF6", // Purple (Leg 6)
  "#10B981", // Emerald (Leg 7)
];

// Comprehensive preset coordinate dictionary for instant offline resolution
export const PRESET_COORDINATES: Record<string, GeocodedPlace> = {
  goa: {
    id: "goa",
    name: "Goa",
    fullName: "Goa (Panaji / Baga), India",
    city: "Goa",
    country: "India",
    region: "Goa",
    latitude: 15.4989,
    longitude: 73.8278,
  },
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
  surat: {
    id: "surat",
    name: "Surat",
    fullName: "Surat, Gujarat, India",
    city: "Surat",
    country: "India",
    region: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
  },
  ahmedabad: {
    id: "ahmedabad",
    name: "Ahmedabad",
    fullName: "Ahmedabad, Gujarat, India",
    city: "Ahmedabad",
    country: "India",
    region: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
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
  gokarna: {
    id: "gokarna",
    name: "Gokarna",
    fullName: "Gokarna, Karnataka, India",
    city: "Gokarna",
    country: "India",
    region: "Karnataka",
    latitude: 14.5479,
    longitude: 74.3188,
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
  pune: {
    id: "pune",
    name: "Pune",
    fullName: "Pune, Maharashtra, India",
    city: "Pune",
    country: "India",
    region: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
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
 * Resolve coordinates for any destination name
 */
export async function resolveDestinationCoordinates(destinationName: string): Promise<Coordinates> {
  const normalized = destinationName.trim().toLowerCase();
  if (PRESET_COORDINATES[normalized]) {
    return {
      latitude: PRESET_COORDINATES[normalized].latitude,
      longitude: PRESET_COORDINATES[normalized].longitude,
    };
  }

  // Check prefix / partial match in presets
  const foundPreset = Object.values(PRESET_COORDINATES).find(
    (p) =>
      p.name.toLowerCase() === normalized ||
      p.city.toLowerCase() === normalized ||
      normalized.startsWith(p.name.toLowerCase())
  );
  if (foundPreset) {
    return { latitude: foundPreset.latitude, longitude: foundPreset.longitude };
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

  // Fallback to Mumbai
  return { latitude: 18.922, longitude: 72.8347 };
}

/**
 * Search places using Photon / OpenStreetMap worldwide geocoding with preset priority
 */
export async function searchDestinations(query: string): Promise<GeocodedPlace[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const results: GeocodedPlace[] = [];
  const lowerQuery = cleanQuery.toLowerCase();

  // 1. Direct match from preset dictionary first
  Object.values(PRESET_COORDINATES).forEach((p) => {
    if (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.region.toLowerCase().includes(lowerQuery) ||
      p.fullName.toLowerCase().includes(lowerQuery)
    ) {
      results.push(p);
    }
  });

  // 2. Query Photon (Komoot OpenStreetMap Geocoder)
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=8`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        data.features.forEach((f: any, idx: number) => {
          const props = f.properties || {};
          const name = props.name || props.city || cleanQuery;
          const city = props.city || props.town || props.state || name;
          const country = props.country || "";
          const state = props.state || "";
          const fullName = [name, state, country].filter(Boolean).join(", ");

          // Avoid duplicates
          const alreadyExists = results.some(
            (r) =>
              r.name.toLowerCase() === name.toLowerCase() ||
              (Math.abs(r.latitude - f.geometry.coordinates[1]) < 0.05 &&
                Math.abs(r.longitude - f.geometry.coordinates[0]) < 0.05)
          );

          if (!alreadyExists) {
            results.push({
              id: `place_${idx}_${Date.now()}`,
              name,
              fullName,
              city,
              country,
              region: state,
              latitude: f.geometry.coordinates[1],
              longitude: f.geometry.coordinates[0],
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn("Photon search failed, using local presets", err);
  }

  return results.slice(0, 8);
}

/**
 * Reverse geocode a latitude & longitude
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace> {
  // Check if close to a preset city (< 15km)
  for (const preset of Object.values(PRESET_COORDINATES)) {
    const dist = calculateGreatCircleDistance(lat, lng, preset.latitude, preset.longitude);
    if (dist < 15) {
      return preset;
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const name =
        addr.city || addr.town || addr.village || addr.county || data.name || "Selected Location";
      const region = addr.state || addr.region || "";
      const country = addr.country || "India";
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
    fullName: `Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    city: "Custom Location",
    region: "",
    country: "India",
    latitude: lat,
    longitude: lng,
  };
}

/**
 * Calculate single driving leg between two points via OSRM
 * Prefers shortest practical driving route
 */
async function calculateSingleLeg(
  p1: { latitude: number; longitude: number; name?: string },
  p2: { latitude: number; longitude: number; name?: string },
  legIndex: number
): Promise<RouteLeg> {
  const fromName = p1.name || "Start";
  const toName = p2.name || "Destination";
  const color = LEG_COLORS[legIndex % LEG_COLORS.length];

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${p1.longitude},${p1.latitude};${p2.longitude},${p2.latitude}?overview=full&geometries=geojson&alternatives=true`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        // Choose shortest valid driving route
        const sorted = [...data.routes].sort((a, b) => a.distance - b.distance);
        const bestRoute = sorted[0];

        const rawCoords: [number, number][] = bestRoute.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        const distanceKm = Math.round(bestRoute.distance / 1000);
        const durationMinutes = Math.round(bestRoute.duration / 60);

        return {
          fromName,
          toName,
          distanceKm,
          durationMinutes,
          coordinates: rawCoords,
          color,
          summary: `${fromName} → ${toName}: ${distanceKm} km · ${formatDurationHours(durationMinutes)}`,
        };
      }
    }
  } catch (err) {
    console.warn(`OSRM single leg failed (${fromName} -> ${toName}), using geodesic fallback`, err);
  }

  // Geodesic fallback with road curvature factor
  const dist = calculateGreatCircleDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
  const roadDistanceKm = Math.round(dist * 1.25);
  const durationMinutes = Math.round((roadDistanceKm / 60) * 60); // approx 60 km/h avg

  const steps = 20;
  const fallbackCoords: [number, number][] = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const lat = p1.latitude + (p2.latitude - p1.latitude) * t;
    const lng = p1.longitude + (p2.longitude - p1.longitude) * t;
    fallbackCoords.push([lat, lng]);
  }

  return {
    fromName,
    toName,
    distanceKm: roadDistanceKm,
    durationMinutes,
    coordinates: fallbackCoords,
    color,
    summary: `${fromName} → ${toName}: ${roadDistanceKm} km · ${formatDurationHours(durationMinutes)}`,
  };
}

/**
 * Calculate multi-leg driving route connecting all stops in exact sequence:
 * START (01) -> STOP 1 (02) -> STOP 2 (03) -> ... -> END (0N)
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

  // Calculate each consecutive leg in parallel
  const legPromises: Promise<RouteLeg>[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legPromises.push(calculateSingleLeg(stops[i], stops[i + 1], i));
  }

  const legs = await Promise.all(legPromises);

  // Combine coordinates and totals
  const allCoords: [number, number][] = [];
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;

  legs.forEach((leg) => {
    allCoords.push(...leg.coordinates);
    totalDistanceKm += leg.distanceKm;
    totalDurationMinutes += leg.durationMinutes;
  });

  return {
    coordinates: allCoords,
    totalDistanceKm,
    totalDurationMinutes,
    legs,
    summary: `${totalDistanceKm} km · ${formatDurationHours(totalDurationMinutes)}`,
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

/**
 * Calculate bearing angle in degrees between two lat/lng coordinates
 */
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}
