/**
 * GlobeTrotter Core Domain Models & Types
 * Strictly follows the domain hierarchy:
 * Trip -> TripStop -> ItineraryDay -> Activity / TripActivity
 * Designed for relational persistence (Odoo / PostgreSQL backend).
 */

export type Role = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  id: string;
  userId: string;
  preferredCurrency: string;
  travelStyle: 'budget' | 'moderate' | 'luxury' | 'adventure' | 'cultural' | 'relaxation';
  dietaryRestrictions: string[];
  interests: string[];
  climatePreference?: 'warm' | 'cold' | 'tropical' | 'temperate';
  emailNotifications: boolean;
}

export type TripStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type TripVisibility = 'private' | 'public' | 'shared_link';

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  visibility: TripVisibility;
  totalEstimatedBudget: number;
  currency: string;
  stopsCount: number;
  totalDays: number;
  createdAt: string;
  updatedAt: string;
  // Domain relational hierarchy
  stops?: TripStop[];
  budget?: Budget;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  cityName: string;
  country: string;
  order: number; // Sequence of destination stops in the journey
  arrivalDate: string;
  departureDate: string;
  stayDurationDays: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  city?: City;
  // Child relation in hierarchy
  itineraryDays?: ItineraryDay[];
}

export interface ItineraryDay {
  id: string;
  tripStopId: string;
  tripId: string;
  dayNumber: number; // Day 1, Day 2, etc. in the overall trip or stop
  date: string; // Specific calendar date
  themeOrTitle?: string;
  notes?: string;
  // Child relation in hierarchy
  activities?: TripActivity[];
}

export type ActivityCategory =
  | 'sightseeing'
  | 'adventure'
  | 'food_and_dining'
  | 'nature_outdoors'
  | 'culture_history'
  | 'entertainment'
  | 'shopping'
  | 'relaxation'
  | 'transportation';

export interface Activity {
  id: string;
  cityId: string;
  title: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  currency: string;
  durationMinutes: number;
  imageUrl?: string;
  rating?: number;
  reviewsCount?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  isPopular?: boolean;
}

export interface TripActivity {
  id: string;
  itineraryDayId: string;
  activityId?: string; // Optional reference to catalog activity
  customTitle?: string;
  description?: string;
  category: ActivityCategory;
  startTime?: string; // e.g. "09:30"
  endTime?: string;   // e.g. "12:00"
  durationMinutes: number;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  order: number;
  status: 'planned' | 'completed' | 'skipped';
  locationName?: string;
  notes?: string;
  activity?: Activity;
}

export type ExpenseCategory =
  | 'transport'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'miscellaneous';

export interface Expense {
  id: string;
  tripId: string;
  tripStopId?: string;
  tripActivityId?: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
}

export interface BudgetCategoryBreakdown {
  category: ExpenseCategory;
  allocatedAmount: number;
  spentAmount: number;
  percentageUsed: number;
}

export interface Budget {
  id: string;
  tripId: string;
  totalBudget: number;
  currency: string;
  totalSpent: number;
  remainingBudget: number;
  averageCostPerDay: number;
  budgetPercentageUsed: number;
  isOverBudget: boolean;
  categories: BudgetCategoryBreakdown[];
  expenses?: Expense[];
}

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  stateOrRegion?: string;
  description: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  averageDailyCost: number;
  popularSeason?: string;
  currency: string;
  timezone: string;
  popularActivitiesCount?: number;
}

export interface SharedTrip {
  id: string;
  tripId: string;
  shareCode: string;
  shareUrl: string;
  isPublic: boolean;
  allowCopy: boolean;
  viewsCount: number;
  clonesCount: number;
  tripSummary: {
    title: string;
    description?: string;
    coverImageUrl?: string;
    totalDays: number;
    cities: string[];
    authorName: string;
    startDate: string;
    endDate: string;
    totalEstimatedBudget: number;
    currency: string;
  };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'trip_update' | 'budget_alert' | 'system' | 'community';
  isRead: boolean;
  createdAt: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  activeTrips: number;
  totalCities: number;
  totalActivities: number;
  publicSharedTrips: number;
  popularDestinations: { cityName: string; country: string; tripCount: number }[];
  monthlyTripCreations: { month: string; count: number }[];
}
