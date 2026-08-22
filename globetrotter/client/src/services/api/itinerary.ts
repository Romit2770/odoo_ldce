import { apiClient } from "./client";
import type { Activity, ActivityIdea, TripStop } from "@/domain/trip";

export const itineraryService = {
  async getItinerary(tripId: string): Promise<{ tripId: number; stops: TripStop[] }> {
    return apiClient<{ tripId: number; stops: TripStop[] }>(`/trips/${encodeURIComponent(tripId)}/itinerary`);
  },

  async addActivity(
    tripId: string,
    payload: {
      stopId?: string;
      dayId?: string;
      activityId?: string;
      catalogActivityId?: number;
      name?: string;
      time?: string;
      duration?: string;
      cost?: number;
      category?: string;
      location?: string;
      description?: string;
    }
  ): Promise<Activity> {
    return apiClient<Activity>(`/trips/${encodeURIComponent(tripId)}/activities`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateActivity(
    activityId: string | number,
    updates: Partial<Activity>
  ): Promise<Activity> {
    return apiClient<Activity>(`/trip-activities/${activityId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteActivity(
    activityId: string | number
  ): Promise<{ deletedActivityId: string; dayId: string }> {
    return apiClient<{ deletedActivityId: string; dayId: string }>(`/trip-activities/${activityId}`, {
      method: "DELETE",
    });
  },

  async duplicateActivity(activityId: string | number): Promise<Activity> {
    return apiClient<Activity>(`/trip-activities/${activityId}/duplicate`, {
      method: "POST",
    });
  },

  async moveActivity(
    activityId: string | number,
    targetDayId: string,
    targetIndex?: number
  ): Promise<Activity> {
    return apiClient<Activity>(`/trip-activities/${activityId}/move`, {
      method: "POST",
      body: JSON.stringify({ targetDayId, targetIndex }),
    });
  },
};
