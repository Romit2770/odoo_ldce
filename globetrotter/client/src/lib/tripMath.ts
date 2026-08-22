/** Storybook Atlas UI reminder: costs must be derived from the shared trip state, never copied into screens. */

import type { ExpenseCategory, Trip } from "@/domain/trip";

export const formatRupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;

export function getAllDays(trip: Trip) {
  return trip.stops.flatMap((stop) => stop.days);
}

export function getAllActivities(trip: Trip) {
  return getAllDays(trip).flatMap((day) => day.activities);
}

export function getActivityTotal(trip: Trip) {
  return getAllActivities(trip).reduce((sum, activity) => sum + activity.cost, 0);
}

export function getExpenseBreakdown(trip: Trip, buffetIncluded: boolean): Record<ExpenseCategory, number> {
  return {
    Transport: trip.baseExpenses.Transport,
    Accommodation: trip.baseExpenses.Accommodation,
    Food: trip.baseExpenses.Food + (buffetIncluded ? 700 : 0),
    Activities: getActivityTotal(trip),
    Miscellaneous: trip.baseExpenses.Miscellaneous,
  };
}

export function getEstimatedCost(trip: Trip, buffetIncluded: boolean) {
  return Object.values(getExpenseBreakdown(trip, buffetIncluded)).reduce((sum, value) => sum + value, 0);
}

export function getPlanningProgress(trip: Trip) {
  const activityCount = getAllActivities(trip).length;
  const days = getAllDays(trip).length;
  return Math.min(96, Math.round(42 + activityCount * 5 + days * 3));
}
