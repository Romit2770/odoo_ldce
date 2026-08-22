import { apiClient } from "../api/client";
import type { TravelerProfile } from "../api/profile";

export const authService = {
  async register(name: string, email: string, password: string): Promise<TravelerProfile> {
    return apiClient<TravelerProfile>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(login: string, password: string): Promise<TravelerProfile> {
    return apiClient<TravelerProfile>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login, password }),
    });
  },

  async logout(): Promise<{ loggedOut: boolean }> {
    return apiClient<{ loggedOut: boolean }>("/auth/logout", {
      method: "POST",
    });
  },

  async getCurrentUser(): Promise<TravelerProfile> {
    return apiClient<TravelerProfile>("/auth/me");
  },

  async resetPassword(email: string): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};
