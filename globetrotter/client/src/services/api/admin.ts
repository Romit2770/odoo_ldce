import { apiClient } from "./client";
import type { City, Trip } from "@/domain/trip";

export type AdminOverviewData = {
  stats: {
    totalUsers: number;
    totalTrips: number;
    totalDestinations: number;
    totalActivities: number;
    sharedTripsCount: number;
    activeItineraries: number;
  };
  recentTrips: Trip[];
  popularDestinations: City[];
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "traveler" | "admin";
  tripsCount: number;
  savedCount: number;
  travelStyle: string;
  createdAt: string;
};

export const adminService = {
  async getOverview(): Promise<AdminOverviewData> {
    return apiClient<AdminOverviewData>("/admin/overview");
  },

  async getUsers(): Promise<AdminUser[]> {
    return apiClient<AdminUser[]>("/admin/users");
  },

  async getTrips(): Promise<Trip[]> {
    return apiClient<Trip[]>("/admin/trips");
  },

  async getCities(): Promise<City[]> {
    return apiClient<City[]>("/admin/cities");
  },

  async createCity(city: Partial<City>): Promise<City> {
    return apiClient<City>("/admin/cities", {
      method: "POST",
      body: JSON.stringify(city),
    });
  },

  async updateCity(id: number, updates: Partial<City>): Promise<City> {
    return apiClient<City>(`/admin/cities/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteCity(id: number): Promise<{ deletedCityId: number }> {
    return apiClient<{ deletedCityId: number }>(`/admin/cities/${id}`, {
      method: "DELETE",
    });
  },

  async getActivities(): Promise<any[]> {
    return apiClient<any[]>("/admin/activities");
  },

  async createActivity(activity: any): Promise<any> {
    return apiClient<any>("/admin/activities", {
      method: "POST",
      body: JSON.stringify(activity),
    });
  },

  async updateActivity(id: number, updates: any): Promise<any> {
    return apiClient<any>(`/admin/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteActivity(id: number): Promise<{ deletedActivityId: number }> {
    return apiClient<{ deletedActivityId: number }>(`/admin/activities/${id}`, {
      method: "DELETE",
    });
  },

  async getAnalytics(): Promise<any> {
    return apiClient<any>("/admin/analytics");
  },

  async getAuditLogs(): Promise<any[]> {
    return apiClient<any[]>("/admin/audit-logs");
  },
};
