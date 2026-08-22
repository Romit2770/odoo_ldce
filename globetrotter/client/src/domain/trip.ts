/**
 * Storybook Atlas domain model: all travel data keeps the product hierarchy
 * Trip → Trip Stop → Itinerary Day → Activity, independent from UI screens.
 */

export type ActivityCategory = "Adventure" | "Sightseeing" | "Food" | "Culture" | "Nature" | "Nightlife";
export type TripStatus = "Upcoming" | "Ongoing" | "Completed" | "Draft";
export type TravelStyle = "Adventure" | "Relaxation" | "Culture" | "Food" | "Nature" | "Luxury" | "Budget" | "Family";
export type ExpenseCategory = "Transport" | "Accommodation" | "Food" | "Activities" | "Miscellaneous";

export type Activity = {
  id: string;
  name: string;
  time: string;
  duration: string;
  cost: number;
  category: ActivityCategory;
  location: string;
  description: string;
};

export type ItineraryDay = {
  id: string;
  dayNumber: number;
  date: string;
  city: string;
  activities: Activity[];
};

export type TripStop = {
  id: string;
  city: string;
  country: string;
  region: string;
  dateRange: string;
  arrival: string;
  departure: string;
  color: string;
  days: ItineraryDay[];
};

export type Trip = {
  id: string;
  name: string;
  dateRange: string;
  duration: string;
  description: string;
  status: TripStatus;
  budget: number;
  estimatedCost: number;
  travelStyle: TravelStyle;
  baseExpenses: Record<Exclude<ExpenseCategory, "Activities">, number>;
  stops: TripStop[];
};

export type City = {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: "Easy on the wallet" | "Balanced" | "A little luxe";
  popularity: string;
  season: string;
  description: string;
  accent: "coral" | "teal" | "mustard";
};

export type ActivityIdea = Omit<Activity, "id" | "time"> & { icon: string; rating: string };

export const demoTrip: Trip = {
  id: "goa-adventure",
  name: "Goa Adventure",
  dateRange: "12–16 Aug 2026",
  duration: "5 sunny days",
  description: "A coastal story that begins with Mumbai’s harbour and ends with saltwater sunsets in Goa.",
  status: "Upcoming",
  budget: 25000,
  estimatedCost: 21500,
  travelStyle: "Adventure",
  baseExpenses: { Transport: 4500, Accommodation: 7000, Food: 3200, Miscellaneous: 1700 },
  stops: [
    {
      id: "mumbai",
      city: "Mumbai",
      country: "India",
      region: "Maharashtra",
      dateRange: "12–13 Aug",
      arrival: "12 Aug",
      departure: "13 Aug",
      color: "#FFC53D",
      days: [
        {
          id: "mumbai-day-1",
          dayNumber: 1,
          date: "Wed, 12 Aug",
          city: "Mumbai",
          activities: [
            { id: "breakfast", name: "Kala Ghoda breakfast", time: "09:00", duration: "1h", cost: 400, category: "Food", location: "Kala Ghoda", description: "Start with a slow café table and the neighbourhood’s early street life." },
            { id: "gateway", name: "Gateway of India", time: "11:00", duration: "1.5h", cost: 0, category: "Sightseeing", location: "Apollo Bunder", description: "A harbour-side landmark walk with a view across to the water." },
            { id: "marine", name: "Marine Drive sunset", time: "17:00", duration: "2h", cost: 0, category: "Nature", location: "Marine Drive", description: "Golden-hour promenade time and a no-rush evening walk." },
          ],
        },
        {
          id: "mumbai-day-2",
          dayNumber: 2,
          date: "Thu, 13 Aug",
          city: "Mumbai",
          activities: [
            { id: "train", name: "Konkan coast train", time: "10:30", duration: "8h", cost: 650, category: "Sightseeing", location: "Mumbai CSMT", description: "A scenic travel day that turns the transfer into part of the story." },
          ],
        },
      ],
    },
    {
      id: "goa",
      city: "Goa",
      country: "India",
      region: "Goa",
      dateRange: "14–16 Aug",
      arrival: "14 Aug",
      departure: "16 Aug",
      color: "#2CB9AA",
      days: [
        {
          id: "goa-day-3",
          dayNumber: 3,
          date: "Fri, 14 Aug",
          city: "Goa",
          activities: [
            { id: "baga", name: "Baga Beach picnic", time: "10:00", duration: "3h", cost: 650, category: "Nature", location: "Baga Beach", description: "A breezy beach morning with snacks, shade, and an unplanned swim." },
            { id: "fort", name: "Fort Aguada", time: "16:00", duration: "1.5h", cost: 250, category: "Culture", location: "Candolim", description: "A warm late-afternoon fort visit before the coast changes colour." },
          ],
        },
        {
          id: "goa-day-4",
          dayNumber: 4,
          date: "Sat, 15 Aug",
          city: "Goa",
          activities: [
            { id: "scuba", name: "Scuba diving discovery", time: "09:30", duration: "4h", cost: 2200, category: "Adventure", location: "Grande Island", description: "A guided first underwater adventure with equipment included." },
            { id: "dinner", name: "Beach dinner at sunset", time: "19:30", duration: "2h", cost: 1250, category: "Food", location: "Anjuna", description: "A relaxed beachside dinner after a saltwater day." },
          ],
        },
        {
          id: "goa-day-5",
          dayNumber: 5,
          date: "Sun, 16 Aug",
          city: "Goa",
          activities: [
            { id: "market", name: "Mapusa market wander", time: "10:00", duration: "1.5h", cost: 750, category: "Culture", location: "Mapusa", description: "Pick up spices, postcards, and one small thing you will keep." },
          ],
        },
      ],
    },
  ],
};

export const cityCatalog: City[] = [
  { id: "jaipur", name: "Jaipur", country: "India", region: "Rajasthan", costIndex: "Balanced", popularity: "Loved by culture seekers", season: "Oct–Mar", description: "Terracotta lanes, observatories, palaces, and slow rooftop evenings.", accent: "coral" },
  { id: "udaipur", name: "Udaipur", country: "India", region: "Rajasthan", costIndex: "A little luxe", popularity: "A favourite for slow days", season: "Sep–Mar", description: "Lake light, palace courtyards, and boat rides made for gentle detours.", accent: "teal" },
  { id: "gokarna", name: "Gokarna", country: "India", region: "Karnataka", costIndex: "Easy on the wallet", popularity: "Rising beach favourite", season: "Oct–Feb", description: "Cliff walks, quiet beaches, and a softer coastal rhythm.", accent: "mustard" },
  { id: "bengaluru", name: "Bengaluru", country: "India", region: "Karnataka", costIndex: "Balanced", popularity: "Popular city stop", season: "Oct–Feb", description: "Garden lanes, coffee rooms, and a strong food-and-design scene.", accent: "teal" },
];

export const activityIdeas: ActivityIdea[] = [
  { name: "Sunset kayaking", category: "Adventure", cost: 1250, duration: "2 hours", location: "Chapora River", description: "Paddle through mangrove light while the day turns coral.", icon: "🛶", rating: "4.8" },
  { name: "Old Goa heritage walk", category: "Culture", cost: 450, duration: "2.5 hours", location: "Old Goa", description: "A small-group walk through churches, lanes, and layered history.", icon: "🏛️", rating: "4.7" },
  { name: "Spice plantation lunch", category: "Food", cost: 850, duration: "3 hours", location: "Ponda", description: "A garden lunch with local spices, stories, and a soft afternoon pace.", icon: "🍲", rating: "4.9" },
  { name: "Dolphin coast cruise", category: "Nature", cost: 900, duration: "2 hours", location: "Candolim", description: "A bright early cruise along Goa’s calm western coast.", icon: "🐬", rating: "4.6" },
];

export const sampleTripSummaries = [
  { id: "goa-adventure", name: "Goa Adventure", route: "Mumbai → Goa", dateRange: "12–16 Aug 2026", budget: 25000, status: "Upcoming" as TripStatus, progress: 82, accent: "teal" },
  { id: "jaipur-notebook", name: "Jaipur Notebook", route: "Jaipur → Udaipur", dateRange: "14–18 Nov 2026", budget: 32000, status: "Draft" as TripStatus, progress: 34, accent: "coral" },
  { id: "kerala-slow", name: "Kerala Slow Days", route: "Kochi → Alleppey", dateRange: "18–22 Jan 2027", budget: 28000, status: "Upcoming" as TripStatus, progress: 18, accent: "mustard" },
];
