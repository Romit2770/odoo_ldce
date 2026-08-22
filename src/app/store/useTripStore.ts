import { useState, useEffect } from 'react';
import { Trip, TripStop, ItineraryDay, TripActivity, Expense, City, Activity, SharedTrip } from '@/types/domain';
import { storage } from '@/services/storage/localStorage';

// Seed Initial Data
const SEED_CITIES: City[] = [
  {
    id: 'city_mumbai',
    name: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    stateOrRegion: 'Maharashtra',
    description: 'The vibrant coastal financial hub known for Victorian colonial architecture, bustling street life, and Marine Drive.',
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
    description: 'A tropical coastal haven famous for pristine beaches, historic Portuguese churches, spice plantations, and watersports.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    latitude: 15.2993,
    longitude: 74.124,
    averageDailyCost: 55,
    popularSeason: 'Nov - Feb',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    popularActivitiesCount: 38,
  },
  {
    id: 'city_kyoto',
    name: 'Kyoto',
    country: 'Japan',
    countryCode: 'JP',
    stateOrRegion: 'Kansai',
    description: 'The cultural capital of Japan with thousands of classical temples, peaceful Zen gardens, and traditional teahouses.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    latitude: 35.0116,
    longitude: 135.7681,
    averageDailyCost: 110,
    popularSeason: 'Mar - May',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    popularActivitiesCount: 64,
  },
  {
    id: 'city_paris',
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    stateOrRegion: 'Île-de-France',
    description: 'City of light celebrated for world-class museums, culinary mastery, iconic boulevards, and landmarks like the Eiffel Tower.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    latitude: 48.8566,
    longitude: 2.3522,
    averageDailyCost: 140,
    popularSeason: 'May - Sep',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    popularActivitiesCount: 88,
  },
];

const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act_gateway',
    cityId: 'city_mumbai',
    title: 'Gateway of India & Harbor Walk',
    description: 'Explore the grand 20th-century arch monument overlooking the Arabian Sea.',
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
    description: 'A 3.6-km picturesque promenade along South Mumbai known as the Queen\'s Necklace.',
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
    id: 'act_elephanta',
    cityId: 'city_mumbai',
    title: 'Elephanta Caves Ferry & Temple Tour',
    description: 'UNESCO World Heritage rock-cut cave temples dedicated to Lord Shiva on Elephanta Island.',
    category: 'culture_history',
    estimatedCost: 25,
    currency: 'USD',
    durationMinutes: 240,
    rating: 4.7,
    reviewsCount: 890,
    latitude: 18.9633,
    longitude: 72.9315,
    isPopular: true,
  },
  {
    id: 'act_baga',
    cityId: 'city_goa',
    title: 'Baga Beach Watersports & Shacks',
    description: 'Parasailing, jet ski rides, and vibrant beach shack dining along North Goa shores.',
    category: 'adventure',
    estimatedCost: 45,
    currency: 'USD',
    durationMinutes: 180,
    rating: 4.7,
    reviewsCount: 1120,
    latitude: 15.5553,
    longitude: 73.7516,
    isPopular: true,
  },
  {
    id: 'act_aguada',
    cityId: 'city_goa',
    title: 'Fort Aguada & Lighthouse Exploration',
    description: '17th-century Portuguese fortress and lighthouse offering panoramic Arabian Sea views.',
    category: 'sightseeing',
    estimatedCost: 8,
    currency: 'USD',
    durationMinutes: 120,
    rating: 4.8,
    reviewsCount: 780,
    latitude: 15.4925,
    longitude: 73.7736,
    isPopular: true,
  },
  {
    id: 'act_old_goa',
    cityId: 'city_goa',
    title: 'Old Goa Heritage Churches Tour',
    description: 'Explore the Basilica of Bom Jesus and Se Cathedral, rich in Portuguese baroque architecture.',
    category: 'culture_history',
    estimatedCost: 12,
    currency: 'USD',
    durationMinutes: 150,
    rating: 4.9,
    reviewsCount: 940,
    latitude: 15.5009,
    longitude: 73.9116,
    isPopular: true,
  },
];

const SEED_TRIP: Trip = {
  id: 'trip_1',
  userId: 'usr_demo_1',
  title: 'Coastal Gateway & Heritage Tour',
  description: 'An unforgettable 8-day expedition spanning Mumbai’s historic architecture and Goa’s sunny shores.',
  coverImageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
  startDate: '2026-09-10',
  endDate: '2026-09-17',
  status: 'upcoming',
  visibility: 'public',
  totalEstimatedBudget: 1500,
  currency: 'USD',
  stopsCount: 2,
  totalDays: 8,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stops: [
    {
      id: 'stop_1',
      tripId: 'trip_1',
      cityId: 'city_mumbai',
      cityName: 'Mumbai',
      country: 'India',
      order: 1,
      arrivalDate: '2026-09-10',
      departureDate: '2026-09-13',
      stayDurationDays: 3,
      latitude: 18.922,
      longitude: 72.8347,
      itineraryDays: [
        {
          id: 'day_1',
          tripStopId: 'stop_1',
          tripId: 'trip_1',
          dayNumber: 1,
          date: '2026-09-10',
          themeOrTitle: 'Arrival & Colonial Waterfront',
          activities: [
            {
              id: 'tact_1',
              itineraryDayId: 'day_1',
              customTitle: 'Gateway of India & Harbor Promenade',
              category: 'sightseeing',
              startTime: '10:00',
              endTime: '11:30',
              durationMinutes: 90,
              estimatedCost: 10,
              currency: 'USD',
              order: 1,
              status: 'planned',
              locationName: 'South Mumbai',
            },
            {
              id: 'tact_2',
              itineraryDayId: 'day_1',
              customTitle: 'Marine Drive Sunset Stroll',
              category: 'relaxation',
              startTime: '17:30',
              endTime: '19:00',
              durationMinutes: 90,
              estimatedCost: 0,
              currency: 'USD',
              order: 2,
              status: 'planned',
              locationName: 'Marine Drive',
            },
          ],
        },
        {
          id: 'day_2',
          tripStopId: 'stop_1',
          tripId: 'trip_1',
          dayNumber: 2,
          date: '2026-09-11',
          themeOrTitle: 'Island Caves & Heritage Art',
          activities: [
            {
              id: 'tact_3',
              itineraryDayId: 'day_2',
              customTitle: 'Elephanta Caves Boat Tour',
              category: 'culture_history',
              startTime: '09:30',
              endTime: '13:30',
              durationMinutes: 240,
              estimatedCost: 25,
              currency: 'USD',
              order: 1,
              status: 'planned',
              locationName: 'Elephanta Island',
            },
          ],
        },
        {
          id: 'day_3',
          tripStopId: 'stop_1',
          tripId: 'trip_1',
          dayNumber: 3,
          date: '2026-09-12',
          themeOrTitle: 'Colaba Market & Coastal Dining',
          activities: [
            {
              id: 'tact_4',
              itineraryDayId: 'day_3',
              customTitle: 'Colaba Causeway Shopping & Leopold Cafe',
              category: 'shopping',
              startTime: '11:00',
              endTime: '14:00',
              durationMinutes: 180,
              estimatedCost: 35,
              currency: 'USD',
              order: 1,
              status: 'planned',
              locationName: 'Colaba Causeway',
            },
          ],
        },
      ],
    },
    {
      id: 'stop_2',
      tripId: 'trip_1',
      cityId: 'city_goa',
      cityName: 'Goa',
      country: 'India',
      order: 2,
      arrivalDate: '2026-09-13',
      departureDate: '2026-09-17',
      stayDurationDays: 5,
      latitude: 15.2993,
      longitude: 74.124,
      itineraryDays: [
        {
          id: 'day_4',
          tripStopId: 'stop_2',
          tripId: 'trip_1',
          dayNumber: 4,
          date: '2026-09-13',
          themeOrTitle: 'Arrival & North Goa Beach Sunset',
          activities: [
            {
              id: 'tact_5',
              itineraryDayId: 'day_4',
              customTitle: 'Baga Beach Watersports',
              category: 'adventure',
              startTime: '14:30',
              endTime: '17:30',
              durationMinutes: 180,
              estimatedCost: 45,
              currency: 'USD',
              order: 1,
              status: 'planned',
              locationName: 'Baga Beach',
            },
          ],
        },
        {
          id: 'day_5',
          tripStopId: 'stop_2',
          tripId: 'trip_1',
          dayNumber: 5,
          date: '2026-09-14',
          themeOrTitle: 'Portuguese Forts & Coastal Panoramic Views',
          activities: [
            {
              id: 'tact_6',
              itineraryDayId: 'day_5',
              customTitle: 'Fort Aguada & Lighthouse Visit',
              category: 'sightseeing',
              startTime: '10:00',
              endTime: '12:30',
              durationMinutes: 150,
              estimatedCost: 8,
              currency: 'USD',
              order: 1,
              status: 'planned',
              locationName: 'Candolim',
            },
          ],
        },
      ],
    },
  ],
};

const SEED_EXPENSES: Expense[] = [
  {
    id: 'exp_1',
    tripId: 'trip_1',
    title: 'Flight tickets to Mumbai',
    category: 'transport',
    amount: 180,
    currency: 'USD',
    date: '2026-09-10',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_2',
    tripId: 'trip_1',
    title: 'Hotel Colaba 3 nights',
    category: 'accommodation',
    amount: 220,
    currency: 'USD',
    date: '2026-09-10',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_3',
    tripId: 'trip_1',
    title: 'Elephanta Caves Guided Ferry',
    category: 'activities',
    amount: 35,
    currency: 'USD',
    date: '2026-09-11',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_4',
    tripId: 'trip_1',
    title: 'Mumbai Street Food & Dinners',
    category: 'food',
    amount: 65,
    currency: 'USD',
    date: '2026-09-11',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_5',
    tripId: 'trip_1',
    title: 'Scenic Train to Goa',
    category: 'transport',
    amount: 45,
    currency: 'USD',
    date: '2026-09-13',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp_6',
    tripId: 'trip_1',
    title: 'Goa Beachfront Resort Stay',
    category: 'accommodation',
    amount: 280,
    currency: 'USD',
    date: '2026-09-13',
    createdAt: new Date().toISOString(),
  },
];

// Singleton Store with custom listeners
class TripStore {
  private trips: Trip[] = [];
  private expenses: Expense[] = [];
  private cities: City[] = [];
  private activities: Activity[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.trips = storage.get<Trip[]>('trips', [SEED_TRIP]);
    this.expenses = storage.get<Expense[]>('expenses', SEED_EXPENSES);
    this.cities = storage.get<City[]>('cities', SEED_CITIES);
    this.activities = storage.get<Activity[]>('activities', SEED_ACTIVITIES);
  }

  private notify() {
    storage.set('trips', this.trips);
    storage.set('expenses', this.expenses);
    storage.set('cities', this.cities);
    storage.set('activities', this.activities);
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Getters
  getTrips(): Trip[] {
    return this.trips;
  }

  getTrip(tripId: string): Trip | undefined {
    return this.trips.find((t) => t.id === tripId);
  }

  getCities(): City[] {
    return this.cities;
  }

  getActivities(cityId?: string): Activity[] {
    if (!cityId) return this.activities;
    return this.activities.filter((a) => a.cityId === cityId);
  }

  getExpenses(tripId: string): Expense[] {
    return this.expenses.filter((e) => e.tripId === tripId);
  }

  // Trip Mutations
  createTrip(tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Trip {
    const newTrip: Trip = {
      ...tripData,
      id: `trip_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.trips.unshift(newTrip);
    this.notify();
    return newTrip;
  }

  updateTrip(tripId: string, updates: Partial<Trip>): Trip | undefined {
    const index = this.trips.findIndex((t) => t.id === tripId);
    if (index === -1) return undefined;

    this.trips[index] = {
      ...this.trips[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.notify();
    return this.trips[index];
  }

  deleteTrip(tripId: string): void {
    this.trips = this.trips.filter((t) => t.id !== tripId);
    this.expenses = this.expenses.filter((e) => e.tripId !== tripId);
    this.notify();
  }

  // Stop Mutations
  addStopToTrip(tripId: string, stop: Omit<TripStop, 'id' | 'tripId'>): TripStop | undefined {
    const trip = this.getTrip(tripId);
    if (!trip) return undefined;

    const newStop: TripStop = {
      ...stop,
      id: `stop_${Date.now()}`,
      tripId,
      itineraryDays: stop.itineraryDays || [],
    };

    const stops = trip.stops || [];
    trip.stops = [...stops, newStop];
    trip.stopsCount = trip.stops.length;
    this.notify();
    return newStop;
  }

  // Day & Activity Mutations
  addActivityToDay(
    tripId: string,
    stopId: string,
    dayId: string,
    activity: Omit<TripActivity, 'id' | 'itineraryDayId'>
  ): TripActivity | undefined {
    const trip = this.getTrip(tripId);
    if (!trip || !trip.stops) return undefined;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop || !stop.itineraryDays) return undefined;

    const day = stop.itineraryDays.find((d) => d.id === dayId);
    if (!day) return undefined;

    const newActivity: TripActivity = {
      ...activity,
      id: `tact_${Date.now()}`,
      itineraryDayId: dayId,
    };

    day.activities = [...(day.activities || []), newActivity];
    this.notify();
    return newActivity;
  }

  removeActivity(tripId: string, stopId: string, dayId: string, activityId: string): void {
    const trip = this.getTrip(tripId);
    if (!trip || !trip.stops) return;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop || !stop.itineraryDays) return;

    const day = stop.itineraryDays.find((d) => d.id === dayId);
    if (!day || !day.activities) return;

    day.activities = day.activities.filter((a) => a.id !== activityId);
    this.notify();
  }

  // Expense Mutations
  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    this.notify();
    return newExpense;
  }

  deleteExpense(expenseId: string): void {
    this.expenses = this.expenses.filter((e) => e.id !== expenseId);
    this.notify();
  }

  // Community Clone Mutation
  cloneTrip(tripToClone: Trip, newTitle?: string): Trip {
    const clonedTrip: Trip = {
      ...tripToClone,
      id: `trip_${Date.now()}`,
      title: newTitle || `Copy of ${tripToClone.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: 'private',
      stops: tripToClone.stops?.map((stop, sIdx) => ({
        ...stop,
        id: `stop_cloned_${Date.now()}_${sIdx}`,
        itineraryDays: stop.itineraryDays?.map((day, dIdx) => ({
          ...day,
          id: `day_cloned_${Date.now()}_${dIdx}`,
          activities: day.activities?.map((act, aIdx) => ({
            ...act,
            id: `tact_cloned_${Date.now()}_${aIdx}`,
          })),
        })),
      })),
    };

    this.trips.unshift(clonedTrip);
    this.notify();
    return clonedTrip;
  }

  // Admin Catalog Mutations
  addCity(city: Omit<City, 'id'>): City {
    const newCity: City = { ...city, id: `city_${Date.now()}` };
    this.cities.push(newCity);
    this.notify();
    return newCity;
  }

  addActivity(activity: Omit<Activity, 'id'>): Activity {
    const newAct: Activity = { ...activity, id: `act_${Date.now()}` };
    this.activities.push(newAct);
    this.notify();
    return newAct;
  }
}

export const tripStore = new TripStore();

export function useTripStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = tripStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    trips: tripStore.getTrips(),
    cities: tripStore.getCities(),
    activities: tripStore.getActivities(),
    getTrip: (id: string) => tripStore.getTrip(id),
    getExpenses: (tripId: string) => tripStore.getExpenses(tripId),
    createTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => tripStore.createTrip(data),
    updateTrip: (id: string, data: Partial<Trip>) => tripStore.updateTrip(id, data),
    deleteTrip: (id: string) => tripStore.deleteTrip(id),
    addStopToTrip: (tripId: string, stop: Omit<TripStop, 'id' | 'tripId'>) =>
      tripStore.addStopToTrip(tripId, stop),
    addActivityToDay: (
      tripId: string,
      stopId: string,
      dayId: string,
      act: Omit<TripActivity, 'id' | 'itineraryDayId'>
    ) => tripStore.addActivityToDay(tripId, stopId, dayId, act),
    removeActivity: (tripId: string, stopId: string, dayId: string, actId: string) =>
      tripStore.removeActivity(tripId, stopId, dayId, actId),
    addExpense: (exp: Omit<Expense, 'id' | 'createdAt'>) => tripStore.addExpense(exp),
    deleteExpense: (id: string) => tripStore.deleteExpense(id),
    cloneTrip: (trip: Trip, title?: string) => tripStore.cloneTrip(trip, title),
    addCity: (city: Omit<City, 'id'>) => tripStore.addCity(city),
    addActivity: (activity: Omit<Activity, 'id'>) => tripStore.addActivity(activity),
  };
}
