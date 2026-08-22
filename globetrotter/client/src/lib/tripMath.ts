/** Storybook Atlas UI: costs derived safely from trip state with defensive fallbacks */

import type { ExpenseCategory, Trip } from "@/domain/trip";

export const formatRupees = (amount: number) => `₹${Math.round(amount || 0).toLocaleString("en-IN")}`;

export function getAllDays(trip: Trip) {
  if (!trip || !Array.isArray(trip.stops)) return [];
  return trip.stops.flatMap((stop) => (Array.isArray(stop?.days) ? stop.days : []));
}

export function getAllActivities(trip: Trip) {
  return getAllDays(trip).flatMap((day) => (Array.isArray(day?.activities) ? day.activities : []));
}

export function getActivityTotal(trip: Trip) {
  return getAllActivities(trip).reduce((sum, activity) => sum + (Number(activity?.cost) || 0), 0);
}

export function getExpenseBreakdown(trip: Trip, buffetIncluded: boolean): Record<ExpenseCategory, number> {
  const est = Number(trip?.estimatedCost) || Number(trip?.budget) || 25000;
  const defTransport = Math.round(est * 0.35);
  const defAccommodation = Math.round(est * 0.35);
  const defFood = Math.round(est * 0.2);
  const defMisc = Math.round(est * 0.1);

  const base = trip?.baseExpenses;

  return {
    Transport: typeof base?.Transport === "number" ? base.Transport : defTransport,
    Accommodation: typeof base?.Accommodation === "number" ? base.Accommodation : defAccommodation,
    Food: (typeof base?.Food === "number" ? base.Food : defFood) + (buffetIncluded ? 700 : 0),
    Activities: getActivityTotal(trip),
    Miscellaneous: typeof base?.Miscellaneous === "number" ? base.Miscellaneous : defMisc,
  };
}

export function getEstimatedCost(trip: Trip, buffetIncluded: boolean) {
  if (!trip) return 0;
  const breakdown = getExpenseBreakdown(trip, buffetIncluded);
  return Object.values(breakdown).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function getPlanningProgress(trip: Trip) {
  if (!trip) return 0;
  const activityCount = getAllActivities(trip).length;
  const days = getAllDays(trip).length;
  return Math.min(96, Math.max(20, Math.round(35 + activityCount * 5 + days * 3)));
}

