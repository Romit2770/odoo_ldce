import { Activity } from '@/types/domain';
import { apiClient } from './client';

export const activitiesApi = {
  async getByCity(cityId: string, category?: string): Promise<Activity[]> {
    try {
      return await apiClient.get<Activity[]>('/activities', { cityId, category });
    } catch {
      return [
        {
          id: 'act_gateway',
          cityId: 'city_mumbai',
          title: 'Gateway of India & Harbor Walk',
          description: 'Explore the iconic arch monument overlooking the Arabian Sea built in the 20th century.',
          category: 'sightseeing',
          estimatedCost: 10,
          currency: 'USD',
          durationMinutes: 90,
          rating: 4.8,
          reviewsCount: 1240,
          latitude: 18.922,
          longitude: 72.8347,
          isPopular: true,
        },
        {
          id: 'act_marine_drive',
          cityId: 'city_mumbai',
          title: 'Marine Drive Sunset Stroll',
          description: 'A picturesque 3.6-kilometre-long boulevard arc along the South Mumbai coast.',
          category: 'relaxation',
          estimatedCost: 0,
          currency: 'USD',
          durationMinutes: 120,
          rating: 4.9,
          reviewsCount: 2150,
          latitude: 18.9438,
          longitude: 72.8234,
          isPopular: true,
        },
        {
          id: 'act_baga_beach',
          cityId: 'city_goa',
          title: 'Baga Beach Watersports',
          description: 'Jet skiing, parasailing, and vibrant beach shack dining in North Goa.',
          category: 'adventure',
          estimatedCost: 45,
          currency: 'USD',
          durationMinutes: 180,
          rating: 4.7,
          reviewsCount: 980,
          latitude: 15.5553,
          longitude: 73.7516,
          isPopular: true,
        },
      ];
    }
  },
};
