import { apiClient } from "./client";
import type { Trip } from "@/domain/trip";

export type SharedTripData = {
  id: string;
  shareId: string;
  tripId: string;
  tripName: string;
  visibility: "private" | "link" | "public";
  createdBy: string;
  cloneCount: number;
  viewCount: number;
  active: boolean;
  shareUrl: string;
  trip: Trip | null;
};

export const sharingService = {
  async getOrCreateShare(tripId: string, visibility: "private" | "link" | "public" = "link"): Promise<SharedTripData> {
    return apiClient<SharedTripData>(`/trips/${encodeURIComponent(tripId)}/share`, {
      method: "POST",
      body: JSON.stringify({ visibility }),
    });
  },

  async getSharedTrip(shareId: string): Promise<SharedTripData> {
    return apiClient<SharedTripData>(`/shared/${encodeURIComponent(shareId)}`);
  },

  async cloneSharedTrip(shareId: string): Promise<{ message: string; trip: Trip; newTripId: string }> {
    return apiClient<{ message: string; trip: Trip; newTripId: string }>(
      `/shared/${encodeURIComponent(shareId)}/clone`,
      { method: "POST" }
    );
  },
};
