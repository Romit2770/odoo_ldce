/**
 * GlobeTrotter Gemini AI Destination Discovery Service
 * Provides AI-personalized destination recommendations in structured JSON format.
 */

export type RecommendationItem = {
  id: string;
  name: string;
  location: string;
  country: string;
  shortDescription: string;
  whyRecommended: string;
  bestFor: string[];
  estimatedBudgetLevel: string;
  bestTime: string;
  tags: string[];
  imageUrl?: string;
};

// Rich curated fallback recommendations by mood and preference
const CURATED_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "rec_goa",
    name: "Goa",
    location: "Coastal Konkan",
    country: "India",
    shortDescription: "Sunlit beaches, Portuguese heritage villas, and tranquil backwater coves.",
    whyRecommended: "Perfect for your relaxed coastal vibes and slow café hopping.",
    bestFor: ["Beaches", "Heritage", "Seafood", "Sunsets"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Nov–Mar",
    tags: ["Relaxation", "Food", "Road trip"],
  },
  {
    id: "rec_udaipur",
    name: "Udaipur",
    location: "Rajasthan",
    country: "India",
    shortDescription: "Gleaming marble palaces rising from shimmering Lake Pichola.",
    whyRecommended: "Matches your love for royal heritage and slow rooftop evenings.",
    bestFor: ["Lakes", "Palaces", "Culture", "Photography"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Oct–Mar",
    tags: ["Culture", "Relaxation", "Weekend"],
  },
  {
    id: "rec_gokarna",
    name: "Gokarna",
    location: "Karnataka",
    country: "India",
    shortDescription: "Pristine crescent beaches flanked by sacred temples and rocky cliff trails.",
    whyRecommended: "A quieter, less-trodden alternative to popular beach spots.",
    bestFor: ["Cliff Trekking", "Beach Camping", "Peaceful Coves"],
    estimatedBudgetLevel: "Easy on the wallet",
    bestTime: "Oct–Mar",
    tags: ["Adventure", "Nature", "Budget"],
  },
  {
    id: "rec_jaipur",
    name: "Jaipur",
    location: "Rajasthan",
    country: "India",
    shortDescription: "The iconic Pink City of terracotta facades, hill forts, and bazaars.",
    whyRecommended: "Rich architectural wonder with world-class craft shopping.",
    bestFor: ["Forts", "Block Printing", "Street Food", "History"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Nov–Feb",
    tags: ["Culture", "Food", "Weekend"],
  },
  {
    id: "rec_meghalaya",
    name: "Meghalaya",
    location: "Northeast",
    country: "India",
    shortDescription: "Misty plateaus, living root bridges, and crystal-clear emerald rivers.",
    whyRecommended: "Unspoiled nature wonderland tailored for adventurous souls.",
    bestFor: ["Living Root Bridges", "Waterfalls", "Caving", "Cloud Forests"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Sep–May",
    tags: ["Nature", "Adventure"],
  },
  {
    id: "rec_hampi",
    name: "Hampi",
    location: "Karnataka",
    country: "India",
    shortDescription: "Surreal boulder-strewn landscape sheltering the majestic ruins of Vijayanagara.",
    whyRecommended: "A living museum for history lovers with epic boulder-climbing sunsets.",
    bestFor: ["Ancient Temples", "Bouldering", "Coracle Rides", "History"],
    estimatedBudgetLevel: "Easy on the wallet",
    bestTime: "Nov–Feb",
    tags: ["Culture", "Adventure", "Budget"],
  },
  {
    id: "rec_munnar",
    name: "Munnar",
    location: "Kerala",
    country: "India",
    shortDescription: "Rolling emerald tea plantations wrapped in morning mist and cool mountain air.",
    whyRecommended: "Restful hillside escape with aromatic spice garden walks.",
    bestFor: ["Tea Estates", "Misty Treks", "Waterfalls", "Cool Climate"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Sep–Mar",
    tags: ["Nature", "Relaxation", "Road trip"],
  },
  {
    id: "rec_spiti",
    name: "Spiti Valley",
    location: "Himachal Pradesh",
    country: "India",
    shortDescription: "High-altitude desert wonderland of thousand-year-old cliffside monasteries.",
    whyRecommended: "High-adrenaline road trip through raw Himalayan passes.",
    bestFor: ["Stargazing", "Monasteries", "High Passes", "Off-road Driving"],
    estimatedBudgetLevel: "Balanced",
    bestTime: "Jun–Oct",
    tags: ["Adventure", "Road trip", "Nature"],
  },
];

export async function generateDiscoverRecommendations(params: {
  query?: string;
  mood?: string;
  preferences?: any;
  savedDestinations?: string[];
}): Promise<RecommendationItem[]> {
  const { query, mood, preferences, savedDestinations } = params;
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    // Return filtered curated recommendations
    return filterCurated(query, mood, preferences);
  }

  try {
    const prompt = `You are the travel inspiration AI engine for GlobeTrotter (a curated travel atlas).
Generate 6 personalized, inspiring destination recommendations based on this traveler context:
- Search Query: "${query || "None"}"
- Selected Mood/Theme: "${mood || "All"}"
- Travel Styles: ${JSON.stringify(preferences?.travelStyles || ["Adventure", "Culture"])}
- Budget Preference: "${preferences?.budgetPreference || "Balanced"}"
- Food Preferences: ${JSON.stringify(preferences?.foodPreferences || ["Local specialties"])}
- Saved Destinations: ${JSON.stringify(savedDestinations || ["Goa"])}

Return a JSON object with this exact schema:
{
  "recommendations": [
    {
      "id": "rec_id_string",
      "name": "Destination Name",
      "location": "State / Region",
      "country": "Country",
      "shortDescription": "1-2 sentence atmospheric description",
      "whyRecommended": "1 sentence why this fits their profile or mood",
      "bestFor": ["Highlight 1", "Highlight 2", "Highlight 3"],
      "estimatedBudgetLevel": "Easy on the wallet | Balanced | A little luxe",
      "bestTime": "e.g. Oct–Mar",
      "tags": ["Adventure", "Culture"]
    }
  ]
}
Return ONLY the raw JSON object without markdown or formatting.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
          return parsed.recommendations;
        }
      }
    }
  } catch (error) {
    console.warn("[Gemini API] Failed to fetch live recommendations, using curated atlas:", error);
  }

  return filterCurated(query, mood, preferences);
}

function filterCurated(query?: string, mood?: string, preferences?: any): RecommendationItem[] {
  let list = [...CURATED_RECOMMENDATIONS];

  if (mood && mood !== "All") {
    const moodLower = mood.toLowerCase();
    list = list.filter(
      (item) =>
        item.tags.some((t) => t.toLowerCase() === moodLower) ||
        item.bestFor.some((b) => b.toLowerCase().includes(moodLower))
    );
    if (list.length === 0) list = [...CURATED_RECOMMENDATIONS];
  }

  if (query && query.trim()) {
    const qLower = query.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(qLower) ||
        item.location.toLowerCase().includes(qLower) ||
        item.shortDescription.toLowerCase().includes(qLower) ||
        item.tags.some((t) => t.toLowerCase().includes(qLower)) ||
        item.bestFor.some((b) => b.toLowerCase().includes(qLower))
    );
    if (list.length === 0) list = CURATED_RECOMMENDATIONS.slice(0, 4);
  }

  return list;
}
