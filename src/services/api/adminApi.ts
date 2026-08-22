import { AdminAnalytics, User, Trip, City, Activity } from '@/types/domain';
import { apiClient } from './client';

export const adminApi = {
  async getAnalytics(): Promise<AdminAnalytics> {
    try {
      return await apiClient.get<AdminAnalytics>('/admin/analytics');
    } catch {
      return {
        totalUsers: 1420,
        totalTrips: 3890,
        activeTrips: 420,
        totalCities: 180,
        totalActivities: 940,
        publicSharedTrips: 310,
        popularDestinations: [
          { cityName: 'Mumbai', country: 'India', tripCount: 840 },
          { cityName: 'Goa', country: 'India', tripCount: 920 },
          { cityName: 'Kyoto', country: 'Japan', tripCount: 560 },
          { cityName: 'Paris', country: 'France', tripCount: 710 },
        ],
        monthlyTripCreations: [
          { month: 'Apr', count: 180 },
          { month: 'May', count: 240 },
          { month: 'Jun', count: 310 },
          { month: 'Jul', count: 420 },
          { month: 'Aug', count: 480 },
        ],
      };
    }
  },

  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/admin/users');
  },

  async getTrips(): Promise<Trip[]> {
    return apiClient.get<Trip[]>('/admin/trips');
  },

  async getCities(): Promise<City[]> {
    return apiClient.get<City[]>('/admin/cities');
  },

  async getActivities(): Promise<Activity[]> {
    return apiClient.get<Activity[]>('/admin/activities');
  },
};
