/**
 * GlobeTrotter Gemini AI Destination Place Detail Service
 * Generates and caches rich, destination-specific travel guide data in MongoDB.
 */

import { getPlaceDetailsCollection, type PlaceDetailDocument } from "../db/mongodb.js";

// Curated Registry of Known Places & Fallbacks
type BasePlaceInfo = {
  placeKey: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  about: string;
  whyVisit: string[];
  highlights: string[];
  famousFor: string[];
  food: string[];
  activities: string[];
  nearbyPlaces: Array<{ name: string; slug: string; distance?: string; description?: string }>;
  bestTimeToVisit: string;
  recommendedDuration: string;
  travelTips: string[];
  budgetLevel: string;
};

const KNOWN_PLACES: Record<string, BasePlaceInfo> = {
  baga: {
    placeKey: "baga",
    slug: "baga-beach",
    name: "Baga Beach",
    tagline: "Lively coastal shores, water sports & golden sunsets",
    category: "Beach & Nightlife",
    city: "Goa",
    state: "Goa",
    country: "India",
    latitude: 15.5553,
    longitude: 73.7517,
    about:
      "Baga Beach is one of North Goa's most celebrated coastal destinations, known for its vibrant shoreline, water sports, sunset views, and energetic beach shacks along the Arabian Sea.",
    whyVisit: [
      "Iconic golden sand shoreline lined with traditional Goan beach shacks",
      "Wide array of water sports including parasailing, jet skiing, and banana rides",
      "Mesmerizing Arabian Sea sunset views accompanied by evening live music",
      "Lively nightlife around Tito's Lane and bustling beach markets",
      "Diverse coastal cuisine and fresh seafood shacks along the water",
    ],
    highlights: ["Beach", "Sunset", "Water activities", "Nightlife", "Shopping", "Seafood"],
    famousFor: ["Water sports", "Tito's Lane nightlife", "Beach shacks", "Sunset viewpoints", "Flea markets"],
    food: [
      "Goan fish curry rice with freshly caught Kingfish or Pomfret",
      "Prawn balchão and butter garlic calamari at beach shacks",
      "Traditional pork vindaloo or chicken xacuti with warm poi bread",
      "Bebinca — the multi-layered traditional Goan dessert",
      "Fresh tender coconut water and tropical fruit smoothies",
    ],
    activities: [
      "Spend a breezy morning relaxing under coconut palm umbrellas",
      "Experience thrilling parasailing with panoramic coastal views",
      "Rent a kayak or take a dolphin-spotting boat trip off the coast",
      "Stroll the evening flea market for handmade souvenirs and beachwear",
      "Enjoy candlelit beach dinners with live acoustic music and sea breezes",
    ],
    nearbyPlaces: [
      { name: "Calangute Beach", slug: "calangute-beach", distance: "2 km", description: "Goa's bustling commercial beach hub" },
      { name: "Anjuna Beach", slug: "anjuna-beach", distance: "5 km", description: "Famous rocky coves and sunset flea market" },
      { name: "Fort Aguada", slug: "fort-aguada", distance: "8 km", description: "17th-century Portuguese fortress and lighthouse" },
    ],
    bestTimeToVisit: "November to February for pleasant weather, calm sea conditions, and ideal beach temperatures.",
    recommendedDuration: "2–3 hours (or full afternoon into evening)",
    travelTips: [
      "Visit during early morning (8–10 AM) for peaceful walking or late afternoon (4–7 PM) for stunning sunsets.",
      "Carry sunscreen, sunglasses, comfortable sandals, and a waterproof phone pouch.",
      "Agree on water sports rates beforehand or book with licensed operators.",
      "Respect swimming flags posted by coastal lifeguards along the beach.",
    ],
    budgetLevel: "₹₹ · Moderate",
  },
  palolem: {
    placeKey: "palolem",
    slug: "palolem-beach",
    name: "Palolem Beach",
    tagline: "Crescent white sand bay & serene backwaters",
    category: "Slow Coastal Days",
    city: "Canacona",
    state: "Goa",
    country: "India",
    latitude: 15.0101,
    longitude: 74.0232,
    about:
      "Palolem Beach is a stunning semi-circular bay in South Goa bordered by towering coconut palms, gentle turquoise waves, and colourful wooden beach huts with a laid-back, bohemian charm.",
    whyVisit: [
      "Tranquil crescent-shaped bay with calm, swimmable turquoise waters",
      "Picturesque pastel-coloured beach huts built right on the sand",
      "Silent Noise headphone beach parties at the southern end",
      "Scenic kayak paddling to Butterfly Beach and Honeymoon Island",
      "Peaceful morning yoga retreats and beachfront Ayurvedic wellness",
    ],
    highlights: ["Scenic Bay", "Kayaking", "Quiet Escapes", "Yoga & Wellness", "Sunsets", "Beach Huts"],
    famousFor: ["Crescent bay shape", "Gentle swimming waters", "Dolphin spotting boat rides", "Silent discos", "Sunset viewpoints"],
    food: [
      "Grilled butter garlic tiger prawns with Goan red rice",
      "Authentic Fish Thali with sol kadhi and fried mackerel",
      "Goan Crab Xec Xec cooked in rich roasted coconut spices",
      "Woodfired sourdough pizzas and vegan smoothie bowls at beach cafés",
      "Fresh mango lassi and cashew feni cocktails",
    ],
    activities: [
      "Rent a sea kayak in the morning to explore Monkey Island and rocky inlets",
      "Take an early morning boat ride to spot wild dolphins in the Arabian Sea",
      "Join a beachfront morning yoga class or sound healing session",
      "Hike the rocky outcrop at the northern headland for panoramic bay views",
      "Dine under fairy lights while listening to gentle tidal waves",
    ],
    nearbyPlaces: [
      { name: "Agonda Beach", slug: "agonda-beach", distance: "8 km", description: "Pristine turtle-nesting beach with quiet surf" },
      { name: "Butterfly Beach", slug: "butterfly-beach", distance: "3 km (by boat)", description: "Hidden secluded cove surrounded by lush hills" },
      { name: "Cabo de Rama Fort", slug: "cabo-de-rama", distance: "22 km", description: "Historic cliffside fort with sweeping ocean panoramas" },
    ],
    bestTimeToVisit: "November to March when the seasonal beach huts are open and the sea is calmest.",
    recommendedDuration: "Half day to full day",
    travelTips: [
      "Early mornings are the most magical time for paddleboarding and dolphin tours.",
      "Bring cash as network connectivity for digital payments can be intermittent.",
      "Rent a scooter to explore the untouched coastal villages of South Goa.",
    ],
    budgetLevel: "₹₹ · Moderate",
  },
  aguada: {
    placeKey: "aguada",
    slug: "fort-aguada",
    name: "Fort Aguada",
    tagline: "17th-century Portuguese fortress & lighthouse overlooking the Arabian Sea",
    category: "History & Views",
    city: "Candolim",
    state: "Goa",
    country: "India",
    latitude: 15.492,
    longitude: 73.7736,
    about:
      "Built in 1612 by the Portuguese to guard against Dutch and Maratha fleets, Fort Aguada stands majestically atop Sinquerim beach, featuring red laterite battlements, a freshwater spring, and an iconic 4-storey lighthouse.",
    whyVisit: [
      "Commanding 360-degree views of the Arabian Sea and the Mandovi river mouth",
      "Historic 19th-century lighthouse, one of the oldest in Asia",
      "Ancient subterranean water storage vault that supplied passing ships",
      "Stunning sunset photography against weathered red laterite stone walls",
      "Well-preserved colonial military architecture and cannon emplacements",
    ],
    highlights: ["Heritage Architecture", "Lighthouse", "Ocean Views", "Sunset Photography", "History"],
    famousFor: ["Portuguese fortress", "Historic lighthouse", "Freshwater cistern", "Dil Chahta Hai movie location", "Mandovi River views"],
    food: [
      "Traditional Goan Poi sandwiches and beef/vegetable croquettes from local bakeries",
      "Fresh coconut water and sugarcane juice from vendors outside the fort",
      "Rava fried prawns and crab curry at nearby Sinquerim seafood shacks",
      "Traditional tea and Goan bibik at hillside heritage cafés",
    ],
    activities: [
      "Walk the upper fort ramparts for uninterrupted coastal panoramic vistas",
      "Photograph the iconic circular lighthouse against the afternoon sky",
      "Explore the lower fort walls that touch the ocean waves near Sinquerim Beach",
      "Visit the newly restored Aguada Central Jail heritage museum complex",
      "Catch the golden hour breeze as fishing trawlers return to the harbor",
    ],
    nearbyPlaces: [
      { name: "Sinquerim Beach", slug: "sinquerim-beach", distance: "1.5 km", description: "Golden sand beach directly below the fort" },
      { name: "Candolim Beach", slug: "candolim-beach", distance: "3.5 km", description: "Upscale beachfront with excellent dining" },
      { name: "Reis Magos Fort", slug: "reis-magos-fort", distance: "8 km", description: "Charming restored fortress on the Mandovi riverbank" },
    ],
    bestTimeToVisit: "October to March. Late afternoon (4:00 PM – 6:00 PM) is ideal to avoid midday heat and catch sunset.",
    recommendedDuration: "1.5–2 hours",
    travelTips: [
      "Wear comfortable walking shoes with good grip on historic stone pathways.",
      "Carry a sunhat and water bottle as there is limited shade on the open upper battlements.",
      "The fort closes around 6:00 PM, so arrive before 4:30 PM to explore leisurely.",
    ],
    budgetLevel: "₹ · Budget friendly (Nominal entry fee)",
  },
  coast: {
    placeKey: "coast",
    slug: "coastal-lookout",
    name: "Coastal Lookout",
    tagline: "High clifftop panoramas, sea breeze & sunset vistas",
    category: "Nature & Sunsets",
    city: "Vagator",
    state: "Goa",
    country: "India",
    latitude: 15.603,
    longitude: 73.7338,
    about:
      "Perched high above the red laterite sea cliffs of North Goa, the Coastal Lookout offers dramatic vistas where crashing Arabian Sea waves meet rugged headlands and sweeping sandy coves.",
    whyVisit: [
      "Dramatic clifftop elevation with panoramic sunset horizons",
      "Cool sea breezes and quieter natural vantage points away from crowded sands",
      "Ideal spot for landscape photography, birdwatching, and evening contemplation",
      "Proximity to historic clifftop ruins and hillside cliff cafés",
    ],
    highlights: ["Cliff Panoramas", "Sunset Point", "Sea Breeze", "Photography", "Nature Walks"],
    famousFor: ["Panoramic ocean vistas", "Red cliff landscapes", "Golden hour views", "Peaceful atmosphere"],
    food: [
      "Refreshing iced kokum coolers and fresh lime soda",
      "Artisanal Mediterranean meze and grilled seafood at nearby cliff cafés",
      "Goan chorizo pao from roadside food trucks",
      "Chilled tender coconut water",
    ],
    activities: [
      "Trek along the coastal cliff trail between Ozran Beach and Vagator",
      "Capture long-exposure sunset photographs of the crashing waves below",
      "Unwind at a clifftop café with fresh juices and chilled acoustic music",
      "Watch local fishermen cast nets from the rocky shoreline below",
    ],
    nearbyPlaces: [
      { name: "Chapora Fort", slug: "chapora-fort", distance: "1.2 km", description: "Famous hilltop fort overlooking Vagator" },
      { name: "Ozran Beach (Little Vagator)", slug: "ozran-beach", distance: "0.8 km", description: "Intimate rocky cove with Shiva rock carving" },
      { name: "Anjuna Flea Market", slug: "anjuna-beach", distance: "4 km", description: "Legendary weekly artisan market" },
    ],
    bestTimeToVisit: "5:00 PM – 6:45 PM for golden hour lighting and sunset.",
    recommendedDuration: "1–1.5 hours",
    travelTips: [
      "Watch your footing near the cliff edges, especially during breezy evenings.",
      "Bring a light windbreaker or jacket for late evening coastal breezes.",
      "A flashlight or phone light is helpful for walking down after twilight.",
    ],
    budgetLevel: "Free",
  },
  palms: {
    placeKey: "palms",
    slug: "palm-cove",
    name: "Palm Cove",
    tagline: "Secluded tropical cove flanked by lush coconut groves",
    category: "A Little Escape",
    city: "Morjim",
    state: "Goa",
    country: "India",
    latitude: 15.632,
    longitude: 73.738,
    about:
      "Tucked away where tropical coconut groves meet the tranquil waters of North Goa, Palm Cove is a peaceful haven for travelers seeking quiet shores, gentle tides, and slow travel rhythms.",
    whyVisit: [
      "Serene, uncrowded tropical grove setting away from commercial bustle",
      "Gentle shallow waters perfect for peaceful wading and paddleboarding",
      "Abundant birdlife and occasional Olive Ridley sea turtle sightings in season",
      "Slow, restorative atmosphere with hammocks strung between palm trees",
    ],
    highlights: ["Coconut Palms", "Quiet Waters", "Birdwatching", "Slow Travel", "Hammock Relaxation"],
    famousFor: ["Lush palm groves", "Olive Ridley turtle conservation", "Quiet estuaries", "Peaceful vibes"],
    food: [
      "Fresh coconut water straight from local palm growers",
      "Steamed Goan rice cakes (sannas) with mild vegetable stew",
      "Freshly grilled kingfish with lemon butter and herbed rice",
      "Tropical fruit platters with papaya, pineapple, and passionfruit",
    ],
    activities: [
      "Read a book in a rope hammock shaded by coconut palms",
      "Take a peaceful kayak paddle along the calm coastal estuary",
      "Spot kingfishers, sea eagles, and sandpipers along the shoreline",
      "Walk barefoot on the soft, uncrowded sands at low tide",
    ],
    nearbyPlaces: [
      { name: "Morjim Beach", slug: "morjim-beach", distance: "1.5 km", description: "Known as Little Russia and turtle nesting sanctuary" },
      { name: "Ashwem Beach", slug: "ashwem-beach", distance: "3 km", description: "Chic beachfront with boutique seaside dining" },
      { name: "Mandrem Beach", slug: "mandrem-beach", distance: "5 km", description: "Tranquil beach with charming wooden footbridges" },
    ],
    bestTimeToVisit: "November to March. Early morning or late afternoon offers the most serene experience.",
    recommendedDuration: "2–4 hours of relaxed leisure",
    travelTips: [
      "Respect turtle nesting zones and keep noise levels low during nesting season (Dec–Feb).",
      "Carry eco-friendly sunscreen and a reusable water flask.",
      "Ideal destination for travelers looking to disconnect and recharge.",
    ],
    budgetLevel: "₹₹ · Moderate",
  },
};

// Normalize Slug helper
export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Find base matching key from slug
function findMatchingBase(slug: string): BasePlaceInfo | null {
  const normalized = normalizeSlug(slug);

  // Exact key match
  if (KNOWN_PLACES[normalized]) return KNOWN_PLACES[normalized];

  // Check slugs
  for (const place of Object.values(KNOWN_PLACES)) {
    if (place.slug === normalized || normalized.includes(place.placeKey) || place.slug.includes(normalized)) {
      return place;
    }
  }

  return null;
}

/**
 * Main Service: Get Cached or Generate with Gemini AI
 */
export async function getOrGeneratePlaceDetail(rawSlugOrKey: string): Promise<PlaceDetailDocument> {
  const slug = normalizeSlug(rawSlugOrKey);
  const placesCol = await getPlaceDetailsCollection();

  // 1. Check MongoDB Cache first
  const cached = await placesCol.findOne({
    $or: [{ slug }, { placeKey: slug }, { slug: { $regex: new RegExp(`^${slug}`, "i") } }],
  });

  if (cached && cached.about && Array.isArray(cached.highlights) && cached.highlights.length > 0) {
    return cached;
  }

  const baseMatch = findMatchingBase(slug);
  const placeName = baseMatch ? baseMatch.name : slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const city = baseMatch?.city || "Goa";
  const state = baseMatch?.state || "Goa";
  const country = baseMatch?.country || "India";

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  // 2. Call Gemini AI if API key is present
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const prompt = `You are an expert travel writer and local destination specialist for GlobeTrotter, a curated travel atlas.
Generate a structured, authentic, highly specific travel guide for the place: "${placeName}" located in ${city}, ${state}, ${country}.

Provide real, locally accurate details (food, highlights, activities, nearby attractions). Avoid generic filler like "this is a beautiful place".

Return a strictly valid JSON object matching this schema:
{
  "name": "${placeName}",
  "tagline": "A short, evocative 1-sentence tagline about this place",
  "category": "e.g. Beach & Nightlife | History & Views | Nature & Sunsets | Slow Coastal Days | Heritage & Culture",
  "city": "${city}",
  "state": "${state}",
  "country": "${country}",
  "latitude": ${baseMatch?.latitude || 15.4989},
  "longitude": ${baseMatch?.longitude || 73.8278},
  "about": "A rich 2-3 sentence overview explaining what this place is, its atmosphere, and why it matters.",
  "whyVisit": [
    "Compelling specific reason 1",
    "Compelling specific reason 2",
    "Compelling specific reason 3",
    "Compelling specific reason 4"
  ],
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Highlight 5"],
  "famousFor": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "food": [
    "Specific local dish 1 with brief context",
    "Specific local dish 2 with brief context",
    "Specific local drink or dessert 3",
    "Specific culinary experience 4"
  ],
  "activities": [
    "Actionable thing to do 1",
    "Actionable thing to do 2",
    "Actionable thing to do 3",
    "Actionable thing to do 4"
  ],
  "nearbyPlaces": [
    { "name": "Nearby Attraction 1", "slug": "nearby-attraction-1", "distance": "e.g. 2 km", "description": "Short 1-line note" },
    { "name": "Nearby Attraction 2", "slug": "nearby-attraction-2", "distance": "e.g. 4 km", "description": "Short 1-line note" },
    { "name": "Nearby Attraction 3", "slug": "nearby-attraction-3", "distance": "e.g. 7 km", "description": "Short 1-line note" }
  ],
  "bestTimeToVisit": "Best months / time of year with a short seasonal explanation.",
  "recommendedDuration": "e.g. 2–3 hours or Half day",
  "travelTips": [
    "Practical tip 1 regarding timing or crowd",
    "Practical tip 2 regarding what to bring or footwear",
    "Practical tip 3 regarding safety or local guidelines"
  ],
  "budgetLevel": "e.g. ₹ · Budget friendly | ₹₹ · Moderate | ₹₹₹ · Premium"
}
Return ONLY valid JSON with no backticks, no markdown prefix, no extra text.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);

          // Validation
          if (
            typeof parsed.about === "string" &&
            Array.isArray(parsed.whyVisit) &&
            Array.isArray(parsed.highlights) &&
            Array.isArray(parsed.food) &&
            Array.isArray(parsed.activities)
          ) {
            const newDoc: PlaceDetailDocument = {
              placeKey: baseMatch?.placeKey || slug,
              slug,
              name: parsed.name || placeName,
              tagline: parsed.tagline || `${placeName} in ${city}, ${country}`,
              category: parsed.category || baseMatch?.category || "Travel Destination",
              city: parsed.city || city,
              state: parsed.state || state,
              country: parsed.country || country,
              latitude: Number(parsed.latitude) || baseMatch?.latitude || 15.4989,
              longitude: Number(parsed.longitude) || baseMatch?.longitude || 73.8278,
              about: parsed.about,
              whyVisit: parsed.whyVisit,
              highlights: parsed.highlights,
              famousFor: Array.isArray(parsed.famousFor) ? parsed.famousFor : parsed.highlights,
              food: parsed.food,
              activities: parsed.activities,
              nearbyPlaces: Array.isArray(parsed.nearbyPlaces) ? parsed.nearbyPlaces : (baseMatch?.nearbyPlaces || []),
              bestTimeToVisit: parsed.bestTimeToVisit || "October to March",
              recommendedDuration: parsed.recommendedDuration || "2–3 hours",
              travelTips: Array.isArray(parsed.travelTips) ? parsed.travelTips : [],
              budgetLevel: parsed.budgetLevel || "₹₹ · Moderate",
              source: "gemini",
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            await placesCol.updateOne(
              { slug },
              { $set: newDoc },
              { upsert: true }
            );

            return newDoc;
          }
        }
      }
    } catch (err) {
      console.warn(`[Gemini Place Service] API generation failed for ${slug}, using curated fallback:`, err);
    }
  }

  // 3. Fallback to Curated Base Data
  const fallbackDoc: PlaceDetailDocument = {
    placeKey: baseMatch?.placeKey || slug,
    slug,
    name: baseMatch?.name || placeName,
    tagline: baseMatch?.tagline || `Discover the beauty and local culture of ${placeName}`,
    category: baseMatch?.category || "Travel Destination",
    city: baseMatch?.city || city,
    state: baseMatch?.state || state,
    country: baseMatch?.country || country,
    latitude: baseMatch?.latitude || 15.4989,
    longitude: baseMatch?.longitude || 73.8278,
    about:
      baseMatch?.about ||
      `${placeName} is a celebrated destination in ${city}, offering rich scenic beauty, authentic regional experiences, and warm local hospitality.`,
    whyVisit: baseMatch?.whyVisit || [
      "Picturesque landscapes and authentic regional atmosphere",
      "Rich local culinary flavors and traditional recipes",
      "Ideal spot for memorable photography and relaxing travel moments",
      "Close proximity to other prominent attractions in the region",
    ],
    highlights: baseMatch?.highlights || ["Scenic Views", "Local Culture", "Photography", "Sightseeing"],
    famousFor: baseMatch?.famousFor || ["Local Landmarks", "Cultural Heritage", "Scenic Vistas"],
    food: baseMatch?.food || [
      "Traditional regional specialties and seasonal delicacies",
      "Freshly prepared local snacks and beverages",
      "Authentic coastal curries and rice dishes",
    ],
    activities: baseMatch?.activities || [
      "Take a guided or self-paced walking tour around the landmark",
      "Photograph the scenic surroundings during early morning or sunset",
      "Explore nearby cafés and markets offering regional crafts",
    ],
    nearbyPlaces: baseMatch?.nearbyPlaces || [
      { name: "Goa Coast", slug: "coastal-lookout", distance: "5 km", description: "Breathtaking clifftop views" },
      { name: "Fort Aguada", slug: "fort-aguada", distance: "8 km", description: "Historic 17th-century lighthouse" },
    ],
    bestTimeToVisit: baseMatch?.bestTimeToVisit || "November to February for pleasant weather and comfortable sightseeing.",
    recommendedDuration: baseMatch?.recommendedDuration || "2–3 hours",
    travelTips: baseMatch?.travelTips || [
      "Visit during morning or late afternoon hours to avoid midday sun.",
      "Carry sunscreen, comfortable walking footwear, and drinking water.",
      "Respect local environment and heritage guidelines.",
    ],
    budgetLevel: baseMatch?.budgetLevel || "₹₹ · Moderate",
    source: "curated",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Cache fallback to MongoDB
  try {
    await placesCol.updateOne(
      { slug },
      { $set: fallbackDoc },
      { upsert: true }
    );
  } catch (err) {
    console.warn("Failed to cache fallback place to DB:", err);
  }

  return fallbackDoc;
}
