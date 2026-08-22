import { apiClient } from "./client";
import type { Trip, TripStop } from "@/domain/trip";

export const tripService = {
  async getAll(status?: string): Promise<Trip[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiClient<Trip[]>(`/trips${query}`);
  },

  async getById(id: string): Promise<Trip> {
    return apiClient<Trip>(`/trips/${encodeURIComponent(id)}`);
  },

  async create(data: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    travelStyle?: string;
  }): Promise<Trip> {
    return apiClient<Trip>("/trips", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: string, updates: Partial<Trip>): Promise<Trip> {
    return apiClient<Trip>(`/trips/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<{ deletedId: string }> {
    return apiClient<{ deletedId: string }>(`/trips/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async addStop(
    tripId: string,
    stop: { city: string; country?: string; region?: string; arrivalDate?: string; departureDate?: string; color?: string }
  ): Promise<TripStop> {
    return apiClient<TripStop>(`/trips/${encodeURIComponent(tripId)}/stops`, {
      method: "POST",
      body: JSON.stringify(stop),
    });
  },

  async removeStop(tripId: string, stopId: string | number): Promise<{ deletedStopId: number }> {
    return apiClient<{ deletedStopId: number }>(`/trips/${encodeURIComponent(tripId)}/stops/${stopId}`, {
      method: "DELETE",
    });
  },
};
