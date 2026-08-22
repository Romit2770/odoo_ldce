import { City } from '@/types/domain';
import { apiClient } from './client';

export const citiesApi = {
  async getAll(search?: string): Promise<City[]> {
    try {
      return await apiClient.get<City[]>('/cities', { search });
    } catch {
      return [
        {
          id: 'city_mumbai',
          name: 'Mumbai',
          country: 'India',
          countryCode: 'IN',
          stateOrRegion: 'Maharashtra',
          description: 'The vibrant financial capital featuring colonial landmarks, Marine Drive, and rich coastal heritage.',
          imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
          latitude: 18.922,
          longitude: 72.8347,
          averageDailyCost: 65,
          popularSeason: 'Oct - Mar',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          popularActivitiesCount: 42,
        },
        {
          id: 'city_goa',
          name: 'Goa',
          country: 'India',
          countryCode: 'IN',
          stateOrRegion: 'Goa',
          description: 'Tropical paradise renowned for pristine beaches, Portuguese architecture, and vibrant water sports.',
          imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
          latitude: 15.2993,
          longitude: 74.124,
          averageDailyCost: 55,
          popularSeason: 'Nov - Feb',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          popularActivitiesCount: 38,
        },
      ];
    }
  },

  async getById(id: string): Promise<City> {
    const cities = await this.getAll();
    const city = cities.find((c) => c.id === id);
    if (!city) throw new Error('City not found');
    return city;
  },
};
