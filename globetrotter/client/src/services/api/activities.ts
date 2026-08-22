import { apiClient } from "./client";
import type { ActivityIdea } from "@/domain/trip";

export const activityService = {
  async getAll(params?: { city?: string; category?: string; search?: string }): Promise<ActivityIdea[]> {
    const searchParams = new URLSearchParams();
    if (params?.city) searchParams.set("city", params.city);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiClient<ActivityIdea[]>(`/activities${query}`);
  },

  async getById(id: number | string): Promise<ActivityIdea> {
    return apiClient<ActivityIdea>(`/activities/${id}`);
  },
};
