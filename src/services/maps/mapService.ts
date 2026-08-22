/**
 * Map Service Provider Abstraction
 * Supports distance calculations, multi-stop routing coordinates, and geocoding.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  fromCity: string;
  toCity: string;
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
}

export const mapService = {
  calculateDistance(pointA: LatLng, pointB: LatLng): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
    const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pointA.latitude * Math.PI) / 180) *
        Math.cos((pointB.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  estimateTravelRoute(stops: { cityName: string; coords: LatLng }[]): RouteSegment[] {
    const segments: RouteSegment[] = [];
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];
      const distance = this.calculateDistance(from.coords, to.coords);
      // Rough estimate: 70 km/h average speed
      const timeMinutes = Math.round((distance / 70) * 60);
      segments.push({
        fromCity: from.cityName,
        toCity: to.cityName,
        distanceKm: distance,
        estimatedTravelTimeMinutes: timeMinutes,
      });
    }
    return segments;
  },
};
