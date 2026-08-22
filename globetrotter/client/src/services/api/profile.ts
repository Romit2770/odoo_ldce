import { apiClient } from "./client";

export type TravelerProfile = {
  id: number;
  name: string;
  email: string;
  role: "traveler" | "admin";
  savedDestinationsCount: number;
  savedDestinationIds: string[];
  tripsCount: number;
  preferences: {
    currency: string;
    language: string;
    travelStyle: string;
    budgetPreference: string;
    emailNotifications?: boolean;
    tripReminders?: boolean;
    budgetAlerts?: boolean;
  };
};

export const profileService = {
  async getProfile(): Promise<TravelerProfile> {
    return apiClient<TravelerProfile>("/profile");
  },

  async updatePreferences(preferences: Partial<TravelerProfile["preferences"]>): Promise<TravelerProfile> {
    return apiClient<TravelerProfile>("/profile/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  },
};
