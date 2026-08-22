import { SharedTrip } from '@/types/domain';
import { apiClient } from './client';

export const sharedTripsApi = {
  async getPublicSharedTrips(): Promise<SharedTrip[]> {
    try {
      return await apiClient.get<SharedTrip[]>('/shared-trips/discover');
    } catch {
      return [
        {
          id: 'share_1',
          tripId: 'trip_1',
          shareCode: 'GOA-EXPLORE-2026',
          shareUrl: '/shared/GOA-EXPLORE-2026',
          isPublic: true,
          allowCopy: true,
          viewsCount: 412,
          clonesCount: 35,
          tripSummary: {
            title: 'Coastal Gateway & Heritage Tour',
            description: '8-day immersive journey across Mumbai and North & South Goa.',
            totalDays: 8,
            cities: ['Mumbai', 'Goa'],
            authorName: 'Alex Johnson',
            startDate: '2026-09-10',
            endDate: '2026-09-18',
            totalEstimatedBudget: 1500,
            currency: 'USD',
          },
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async getByShareCode(shareCode: string): Promise<SharedTrip> {
    try {
      return await apiClient.get<SharedTrip>(`/shared-trips/${shareCode}`);
    } catch {
      const items = await this.getPublicSharedTrips();
      const match = items.find((i) => i.shareCode === shareCode);
      if (!match) throw new Error('Shared itinerary not found');
      return match;
    }
  },

  async cloneTrip(shareCode: string): Promise<{ newTripId: string }> {
    return apiClient.post<{ newTripId: string }>(`/shared-trips/${shareCode}/clone`);
  },
};
