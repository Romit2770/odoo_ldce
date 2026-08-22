import { apiClient } from "./client";
import type { City } from "@/domain/trip";

export const destinationService = {
  async getAll(search?: string): Promise<City[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient<City[]>(`/destinations${query}`);
  },

  async getById(id: string): Promise<City & { activities: any[] }> {
    return apiClient<City & { activities: any[] }>(`/destinations/${encodeURIComponent(id)}`);
  },

  async toggleSave(id: string): Promise<{ cityId: string; saved: boolean; savedDestinationIds: string[]; savedCount: number }> {
    return apiClient<{ cityId: string; saved: boolean; savedDestinationIds: string[]; savedCount: number }>(
      `/destinations/${encodeURIComponent(id)}/toggle-save`,
      { method: "POST" }
    );
  },

  async getSaved(): Promise<City[]> {
    return apiClient<City[]>("/destinations/saved");
  },
};
