/**
 * GlobeTrotter MongoDB Trip Persistence & Sharing Service
 */

import type { Trip } from "@/domain/trip";

function getAuthHeaders(user?: { id?: string; email?: string; name?: string } | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user?.id) headers["x-user-id"] = user.id;
  if (user?.email) headers["x-user-email"] = user.email;
  if (user?.name) headers["x-user-name"] = user.name;
  return headers;
}

export type SharedTripData = {
  id: string;
  name: string;
  dateRange: string;
  duration: string;
  description: string;
  story?: string;
  status: string;
  budget: number;
  estimatedCost: number;
  travelStyle: string;
  travelStyles?: string[];
  startLocation?: string;
  endLocation?: string;
  stops: any[];
  route?: any;
  sharing: {
    enabled: boolean;
    shareCode: string;
  };
};

export const mongoTripService = {
  // 1. Get all trips for the authenticated user
  async getTrips(user?: { id?: string; email?: string; name?: string } | null): Promise<Trip[]> {
    const res = await fetch("/api/trips", {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load trips from database.");
    return res.json();
  },

  // 2. Get a single trip by ID
  async getTripById(
    tripId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<Trip> {
    const res = await fetch(`/api/trips/${tripId}`, {
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to load trip.");
    return res.json();
  },

  // 3. Create a new trip in MongoDB
  async createTrip(
    tripData: Partial<Trip> & { id?: string; story?: string; startLocation?: string; endLocation?: string },
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<Trip> {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: getAuthHeaders(user),
      body: JSON.stringify(tripData),
    });
    if (!res.ok) throw new Error("Failed to create trip in database.");
    const json = await res.json();
    return json.trip;
  },

  // 4. Update an existing trip in MongoDB
  async updateTrip(
    tripId: string,
    tripData: Partial<Trip>,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<Trip> {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: getAuthHeaders(user),
      body: JSON.stringify(tripData),
    });
    if (!res.ok) throw new Error("Failed to update trip in database.");
    const json = await res.json();
    return json.trip;
  },

  // 5. Delete a trip from MongoDB
  async deleteTrip(
    tripId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<void> {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to delete trip.");
  },

  // 6. Generate / Enable Share Code
  async enableShare(
    tripId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<{ shareCode: string; shareUrl: string }> {
    const res = await fetch(`/api/trips/${tripId}/share`, {
      method: "POST",
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to generate share code.");
    return res.json();
  },

  // 7. Disable Share Code
  async disableShare(
    tripId: string,
    user?: { id?: string; email?: string; name?: string } | null
  ): Promise<void> {
    const res = await fetch(`/api/trips/${tripId}/share`, {
      method: "DELETE",
      headers: getAuthHeaders(user),
    });
    if (!res.ok) throw new Error("Failed to disable trip sharing.");
  },

  // 8. Public Get Shared Trip by Code (READ-ONLY, NO AUTH)
  async getSharedTrip(shareCode: string): Promise<SharedTripData> {
    const cleanCode = shareCode.trim().toUpperCase();
    const res = await fetch(`/api/shared-trips/${cleanCode}`);
    if (!res.ok) throw new Error("Trip not found or sharing has been disabled.");
    return res.json();
  },
};
