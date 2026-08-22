import { Trip } from '@/types/domain';
import { apiClient } from './client';

export interface CreateTripDTO {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalEstimatedBudget?: number;
  currency?: string;
  coverImageUrl?: string;
}

export interface UpdateTripDTO extends Partial<CreateTripDTO> {
  status?: Trip['status'];
  visibility?: Trip['visibility'];
}

export const tripsApi = {
  async getAll(): Promise<Trip[]> {
    try {
      return await apiClient.get<Trip[]>('/trips');
    } catch {
      // Phase 1 initial fallback data structure
      return [
        {
          id: 'trip_1',
          userId: 'usr_demo_1',
          title: 'Coastal Gateway & Heritage Tour',
          description: 'A breathtaking road trip spanning historical monuments and sandy shores.',
          startDate: '2026-09-10',
          endDate: '2026-09-18',
          status: 'upcoming',
          visibility: 'private',
          totalEstimatedBudget: 1500,
          currency: 'USD',
          stopsCount: 2,
          totalDays: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getById(id: string): Promise<Trip> {
    try {
      return await apiClient.get<Trip>(`/trips/${id}`);
    } catch {
      return {
        id,
        userId: 'usr_demo_1',
        title: 'Coastal Gateway & Heritage Tour',
        description: 'Multi-city travel across Mumbai and Goa with curated days.',
        startDate: '2026-09-10',
        endDate: '2026-09-18',
        status: 'upcoming',
        visibility: 'private',
        totalEstimatedBudget: 1500,
        currency: 'USD',
        stopsCount: 2,
        totalDays: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async create(dto: CreateTripDTO): Promise<Trip> {
    return apiClient.post<Trip>('/trips', dto);
  },

  async update(id: string, dto: UpdateTripDTO): Promise<Trip> {
    return apiClient.put<Trip>(`/trips/${id}`, dto);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/trips/${id}`);
  },
};
