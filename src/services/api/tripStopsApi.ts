import { TripStop } from '@/types/domain';
import { apiClient } from './client';

export interface CreateTripStopDTO {
  tripId: string;
  cityId: string;
  cityName: string;
  country: string;
  order: number;
  arrivalDate: string;
  departureDate: string;
  stayDurationDays: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export const tripStopsApi = {
  async getByTripId(tripId: string): Promise<TripStop[]> {
    try {
      return await apiClient.get<TripStop[]>(`/trips/${tripId}/stops`);
    } catch {
      return [
        {
          id: 'stop_1',
          tripId,
          cityId: 'city_mumbai',
          cityName: 'Mumbai',
          country: 'India',
          order: 1,
          arrivalDate: '2026-09-10',
          departureDate: '2026-09-13',
          stayDurationDays: 3,
          latitude: 18.922,
          longitude: 72.8347,
        },
        {
          id: 'stop_2',
          tripId,
          cityId: 'city_goa',
          cityName: 'Goa',
          country: 'India',
          order: 2,
          arrivalDate: '2026-09-13',
          departureDate: '2026-09-18',
          stayDurationDays: 5,
          latitude: 15.2993,
          longitude: 74.124,
        },
      ];
    }
  },

  async create(dto: CreateTripStopDTO): Promise<TripStop> {
    return apiClient.post<TripStop>('/trip-stops', dto);
  },

  async update(id: string, dto: Partial<CreateTripStopDTO>): Promise<TripStop> {
    return apiClient.put<TripStop>(`/trip-stops/${id}`, dto);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/trip-stops/${id}`);
  },

  async reorder(tripId: string, stopIdsInOrder: string[]): Promise<TripStop[]> {
    return apiClient.post<TripStop[]>(`/trips/${tripId}/stops/reorder`, { stopIdsInOrder });
  },
};
