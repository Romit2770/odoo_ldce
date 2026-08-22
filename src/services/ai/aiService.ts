/**
 * AI Service Abstraction Layer
 * Prepares the architecture for future AI enhancements:
 * - Personalized destination recommendations
 * - Day-by-day smart itinerary generation
 * - Budget optimization & activity recommendations
 * Decoupled from specific AI providers (OpenAI / Gemini / Anthropic).
 */

export interface AiRecommendationRequest {
  destination: string;
  durationDays: number;
  travelStyle: string;
  budgetEstimate: number;
  interests: string[];
}

export interface AiItinerarySuggestion {
  theme: string;
  suggestedDays: {
    day: number;
    title: string;
    activities: { title: string; category: string; duration: string; estimatedCost: number }[];
  }[];
}

export const aiService = {
  async generateItinerarySuggestion(
    params: AiRecommendationRequest
  ): Promise<AiItinerarySuggestion> {
    console.info('[AI Service] Requesting itinerary generation for:', params);
    // Placeholder response for phase 1
    return {
      theme: `${params.travelStyle} exploration of ${params.destination}`,
      suggestedDays: [
        {
          day: 1,
          title: `Arrival & City Center Landmarks in ${params.destination}`,
          activities: [
            { title: 'Historic Square Walk', category: 'sightseeing', duration: '2 hours', estimatedCost: 15 },
            { title: 'Local Cuisine Welcome Lunch', category: 'food_and_dining', duration: '1.5 hours', estimatedCost: 25 },
          ],
        },
      ],
    };
  },

  async suggestActivitiesForCity(city: string, interests: string[]): Promise<string[]> {
    console.info(`[AI Service] Suggesting activities for ${city} based on:`, interests);
    return ['Heritage Architectural Tour', 'Sunset Beach Promenade', 'Street Food Tasting Trail'];
  },
};
