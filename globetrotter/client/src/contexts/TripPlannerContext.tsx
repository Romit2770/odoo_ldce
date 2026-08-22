/**
 * Storybook Atlas UI: connected front-end state with Odoo backend API service integration.
 * Performs optimistic updates locally while syncing with Odoo ORM & PostgreSQL in the background.
 */

import type { Activity, ActivityIdea, Trip, TripStop } from "@/domain/trip";
import { demoTrip } from "@/domain/trip";
import { getEstimatedCost } from "@/lib/tripMath";
import {
  tripService,
  itineraryService,
  budgetService,
  destinationService,
  profileService,
} from "@/services";
import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";

type PlannerContextValue = {
  trip: Trip;
  setTrip: (trip: Trip) => void;
  buffetIncluded: boolean;
  estimatedCost: number;
  addActivity: (stopId: string, dayId: string, idea: ActivityIdea, time?: string) => void;
  deleteActivity: (dayId: string, activityId: string) => void;
  duplicateActivity: (dayId: string, activityId: string) => void;
  moveActivity: (sourceDayId: string, activityId: string, targetDayId: string, targetIndex?: number) => void;
  reorderStops: (sourceId: string, targetId: string) => void;
  reorderStopIndex: (fromIndex: number, toIndex: number) => void;
  addStop: (city: Omit<TripStop, "id" | "days" | "color">) => void;
  removeStop: (stopId: string) => void;
  toggleBuffet: () => void;
  updateTripBasics: (updates: Partial<Pick<Trip, "name" | "budget" | "description" | "travelStyle" | "dateRange">>) => void;
  savedDestinationIds: string[];
  toggleSavedDestination: (id: string) => void;
  expenses: { id: string; category: string; description: string; amount: number; date: string; notes?: string }[];
  addExpense: (expense: Omit<PlannerContextValue["expenses"][number], "id">) => void;
  demoRole: "traveler" | "admin";
  setDemoRole: (role: "traveler" | "admin") => void;
};

const PlannerContext = createContext<PlannerContextValue | undefined>(undefined);

const orderItems = <T extends { id: string }>(items: T[], sourceId: string, targetId: string) => {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return items;
  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
};

// Sanitize and guarantee a completely valid domain Trip structure
export function sanitizeTrip(raw: any): Trip {
  if (!raw) return demoTrip;
  const budget = Number(raw.budget) || 25000;
  const estimatedCost = Number(raw.estimatedCost) || Math.round(budget * 0.85);

  const baseExpenses =
    raw.baseExpenses && typeof raw.baseExpenses === "object"
      ? {
          Transport: Number(raw.baseExpenses.Transport) || Math.round(estimatedCost * 0.35),
          Accommodation: Number(raw.baseExpenses.Accommodation) || Math.round(estimatedCost * 0.35),
          Food: Number(raw.baseExpenses.Food) || Math.round(estimatedCost * 0.2),
          Miscellaneous: Number(raw.baseExpenses.Miscellaneous) || Math.round(estimatedCost * 0.1),
        }
      : {
          Transport: Math.round(estimatedCost * 0.35),
          Accommodation: Math.round(estimatedCost * 0.35),
          Food: Math.round(estimatedCost * 0.2),
          Miscellaneous: Math.round(estimatedCost * 0.1),
        };

  const rawStops = Array.isArray(raw.stops) ? raw.stops : [];
  const stops: TripStop[] = rawStops.map((stop: any, stopIdx: number) => {
    const cityName = stop.city || stop.name || `Stop ${stopIdx + 1}`;
    const rawDays =
      Array.isArray(stop.days) && stop.days.length > 0
        ? stop.days
        : [
            {
              id: `${stop.id || `stop-${stopIdx}`}-day-1`,
              dayNumber: 1,
              date: stop.arrival || stop.dateRange || "Day 1",
              city: cityName,
              activities: [
                {
                  id: `act-${stopIdx}-1`,
                  name: `${cityName} arrival & check-in`,
                  time: "10:00",
                  duration: "1.5h",
                  cost: 0,
                  category: "Sightseeing" as const,
                  location: cityName,
                  description: `Settle in and take an introductory walking tour of ${cityName}.`,
                },
                {
                  id: `act-${stopIdx}-2`,
                  name: `${cityName} evening market & local food`,
                  time: "17:00",
                  duration: "2h",
                  cost: 650,
                  category: "Food" as const,
                  location: cityName,
                  description: `Explore renowned culinary spots and regional specialties in ${cityName}.`,
                },
              ],
            },
          ];

    return {
      id: stop.id || `stop-${stopIdx}`,
      city: cityName,
      country: stop.country || "India",
      region: stop.region || cityName,
      dateRange: stop.dateRange || "12–14 Aug",
      arrival: stop.arrival || "12 Aug",
      departure: stop.departure || "14 Aug",
      color: stop.color || (stopIdx % 2 === 0 ? "#2CB9AA" : "#FF6550"),
      days: rawDays,
      latitude: stop.latitude,
      longitude: stop.longitude,
      address: stop.address,
    };
  });

  return {
    id: raw.id || `trip-${Date.now()}`,
    name: raw.name || "My Journey",
    dateRange: raw.dateRange || "12–16 Aug 2026",
    duration: raw.duration || "5 days",
    description: raw.description || "A curated travel adventure.",
    status: raw.status || "Upcoming",
    budget,
    estimatedCost,
    travelStyle: raw.travelStyle || "Adventure",
    baseExpenses,
    stops: stops.length > 0 ? stops : demoTrip.stops,
  };
}

export function TripPlannerProvider({ children }: { children: ReactNode }) {
  const [trip, setTripState] = useState<Trip>(demoTrip);
  const setTrip = useCallback((newTrip: Trip) => {
    setTripState(sanitizeTrip(newTrip));
  }, []);
  const [buffetIncluded, setBuffetIncluded] = useState(false);
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(["jaipur", "udaipur"]);
  const [expenses, setExpenses] = useState<PlannerContextValue["expenses"]>([]);
  const [demoRole, setDemoRole] = useState<"traveler" | "admin">("traveler");

  // Hydrate initial state from Odoo backend if available
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const backendTrip = await tripService.getById(demoTrip.id);
        if (isMounted && backendTrip && backendTrip.stops && backendTrip.stops.length > 0) {
          setTrip(backendTrip);
        }
      } catch {
        // Fallback gracefully to demoTrip on offline or dev environment
      }

      try {
        const profile = await profileService.getProfile();
        if (isMounted && profile) {
          if (profile.savedDestinationIds) {
            setSavedDestinationIds(profile.savedDestinationIds);
          }
          if (profile.role) {
            setDemoRole(profile.role);
          }
        }
      } catch {
        // Fallback to local profile defaults
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const estimatedCost = useMemo(() => getEstimatedCost(trip, buffetIncluded), [trip, buffetIncluded]);

  const value = useMemo<PlannerContextValue>(() => ({
    trip,
    setTrip,
    buffetIncluded,
    estimatedCost,
    toggleBuffet: () => {
      setBuffetIncluded((included) => !included);
      budgetService.toggleBuffet(trip.id).catch(() => {});
    },
    updateTripBasics: (updates) => {
      setTripState((current) => ({ ...current, ...updates }));
      tripService.update(trip.id, updates).catch(() => {});
    },
    savedDestinationIds,
    toggleSavedDestination: (id) => {
      setSavedDestinationIds((current) =>
        current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
      );
      destinationService.toggleSave(id).catch(() => {});
    },
    expenses,
    addExpense: (expense) => {
      const tempId = `expense-${Date.now()}`;
      setExpenses((current) => [...current, { ...expense, id: tempId }]);
      budgetService.addExpense(trip.id, expense).catch(() => {});
    },
    demoRole,
    setDemoRole,
    addActivity: (stopId, dayId, idea, time = "15:00") => {
      const tempActivityId = `activity-${Date.now()}`;
      const activity: Activity = { id: tempActivityId, time, ...idea };
      setTripState((current: Trip) => ({
        ...current,
        stops: current.stops.map((stop: TripStop) =>
          stop.id !== stopId
            ? stop
            : {
                ...stop,
                days: stop.days.map((day) =>
                  day.id !== dayId ? day : { ...day, activities: [...day.activities, activity] }
                ),
              }
        ),
      }));

      // Async sync with Odoo backend
      itineraryService
        .addActivity(trip.id, {
          stopId,
          dayId,
          name: idea.name,
          time,
          duration: idea.duration,
          cost: idea.cost,
          category: idea.category,
          location: idea.location,
          description: idea.description,
        })
        .catch(() => {});
    },
    deleteActivity: (dayId, activityId) => {
      setTripState((current: Trip) => ({
        ...current,
        stops: current.stops.map((stop: TripStop) => ({
          ...stop,
          days: stop.days.map((day) =>
            day.id !== dayId
              ? day
              : { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
          ),
        })),
      }));

      const numId = parseInt(activityId, 10);
      if (!isNaN(numId)) {
        itineraryService.deleteActivity(numId).catch(() => {});
      }
    },
    duplicateActivity: (dayId, activityId) => {
      setTripState((current: Trip) => ({
        ...current,
        stops: current.stops.map((stop: TripStop) => ({
          ...stop,
          days: stop.days.map((day) => {
            if (day.id !== dayId) return day;
            const original = day.activities.find((activity) => activity.id === activityId);
            return original
              ? {
                  ...day,
                  activities: [
                    ...day.activities,
                    { ...original, id: `activity-${Date.now()}`, name: `${original.name} (copy)` },
                  ],
                }
              : day;
          }),
        })),
      }));

      const numId = parseInt(activityId, 10);
      if (!isNaN(numId)) {
        itineraryService.duplicateActivity(numId).catch(() => {});
      }
    },
    moveActivity: (sourceDayId, activityId, targetDayId, targetIndex) => {
      setTripState((current: Trip) => {
        let moving: Activity | undefined;
        const withoutSource = current.stops.map((stop: TripStop) => ({
          ...stop,
          days: stop.days.map((day) => {
            if (day.id !== sourceDayId) return day;
            moving = day.activities.find((activity) => activity.id === activityId);
            return { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) };
          }),
        }));
        if (!moving) return current;
        return {
          ...current,
          stops: withoutSource.map((stop: TripStop) => ({
            ...stop,
            days: stop.days.map((day) => {
              if (day.id !== targetDayId) return day;
              const activities = [...day.activities];
              activities.splice(targetIndex ?? activities.length, 0, moving as Activity);
              return { ...day, activities };
            }),
          })),
        };
      });

      const numId = parseInt(activityId, 10);
      if (!isNaN(numId)) {
        itineraryService.moveActivity(numId, targetDayId, targetIndex).catch(() => {});
      }
    },
    reorderStops: (sourceId, targetId) =>
      setTripState((current: Trip) => ({ ...current, stops: orderItems(current.stops, sourceId, targetId) })),
    reorderStopIndex: (fromIndex, toIndex) =>
      setTripState((current: Trip) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.stops.length || toIndex >= current.stops.length) {
          return current;
        }
        const updated = [...current.stops];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return { ...current, stops: updated };
      }),
    addStop: (city) => {
      const stopObj: TripStop = {
        ...city,
        id: `${city.city.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`,
        color: "#FF6550",
        days: [
          {
            id: `day-${Date.now()}`,
            dayNumber: trip.stops.flatMap((stop) => stop.days).length + 1,
            date: city.arrival,
            city: city.city,
            activities: [],
          },
        ],
      };
      setTripState((current: Trip) => ({
        ...current,
        stops: [...current.stops, stopObj],
      }));

      tripService
        .addStop(trip.id, {
          city: city.city,
          country: city.country,
          region: city.region,
          arrivalDate: city.arrival,
          departureDate: city.departure,
        })
        .catch(() => {});
    },
    removeStop: (stopId) => {
      setTripState((current: Trip) =>
        current.stops.length <= 1 ? current : { ...current, stops: current.stops.filter((stop: TripStop) => stop.id !== stopId) }
      );
      const numId = parseInt(stopId, 10);
      if (!isNaN(numId)) {
        tripService.removeStop(trip.id, numId).catch(() => {});
      }
    },
  }), [buffetIncluded, demoRole, estimatedCost, expenses, savedDestinationIds, trip]);

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function useTripPlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("useTripPlanner must be used inside TripPlannerProvider");
  return context;
}

