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
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type PlannerContextValue = {
  trip: Trip;
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

export function TripPlannerProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<Trip>(demoTrip);
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
    buffetIncluded,
    estimatedCost,
    toggleBuffet: () => {
      setBuffetIncluded((included) => !included);
      budgetService.toggleBuffet(trip.id).catch(() => {});
    },
    updateTripBasics: (updates) => {
      setTrip((current) => ({ ...current, ...updates }));
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
      setTrip((current) => ({
        ...current,
        stops: current.stops.map((stop) =>
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
      setTrip((current) => ({
        ...current,
        stops: current.stops.map((stop) => ({
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
      setTrip((current) => ({
        ...current,
        stops: current.stops.map((stop) => ({
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
      setTrip((current) => {
        let moving: Activity | undefined;
        const withoutSource = current.stops.map((stop) => ({
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
          stops: withoutSource.map((stop) => ({
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
      setTrip((current) => ({ ...current, stops: orderItems(current.stops, sourceId, targetId) })),
    reorderStopIndex: (fromIndex, toIndex) =>
      setTrip((current) => {
        if (fromIndex < 0 || toIndex < 0 || fromIndex >= current.stops.length || toIndex >= current.stops.length) {
          return current;
        }
        const updated = [...current.stops];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        return { ...current, stops: updated };
      }),
    addStop: (city) => {
      const stopObj = {
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
      setTrip((current) => ({
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
      setTrip((current) =>
        current.stops.length <= 1 ? current : { ...current, stops: current.stops.filter((stop) => stop.id !== stopId) }
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

