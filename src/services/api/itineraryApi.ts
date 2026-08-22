import { ItineraryDay, TripActivity } from '@/types/domain';
import { apiClient } from './client';

export interface CreateItineraryDayDTO {
  tripStopId: string;
  tripId: string;
  dayNumber: number;
  date: string;
  themeOrTitle?: string;
  notes?: string;
}

export interface AddTripActivityDTO {
  itineraryDayId: string;
  activityId?: string;
  customTitle?: string;
  description?: string;
  category: TripActivity['category'];
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  estimatedCost: number;
  currency: string;
  order: number;
  locationName?: string;
  notes?: string;
}

export const itineraryApi = {
  async getDaysByTripStopId(tripStopId: string): Promise<ItineraryDay[]> {
    try {
      return await apiClient.get<ItineraryDay[]>(`/trip-stops/${tripStopId}/days`);
    } catch {
      return [];
    }
  },

  async getFullTripItinerary(tripId: string): Promise<ItineraryDay[]> {
    try {
      return await apiClient.get<ItineraryDay[]>(`/trips/${tripId}/itinerary`);
    } catch {
      return [];
    }
  },

  async createDay(dto: CreateItineraryDayDTO): Promise<ItineraryDay> {
    return apiClient.post<ItineraryDay>('/itinerary/days', dto);
  },

  async addActivityToDay(dto: AddTripActivityDTO): Promise<TripActivity> {
    return apiClient.post<TripActivity>('/itinerary/activities', dto);
  },

  async updateTripActivity(id: string, dto: Partial<AddTripActivityDTO>): Promise<TripActivity> {
    return apiClient.put<TripActivity>(`/itinerary/activities/${id}`, dto);
  },

  async removeTripActivity(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/itinerary/activities/${id}`);
  },

  async reorderActivities(itineraryDayId: string, activityIdsInOrder: string[]): Promise<TripActivity[]> {
    return apiClient.post<TripActivity[]>(`/itinerary/days/${itineraryDayId}/reorder`, {
      activityIdsInOrder,
    });
  },
};
