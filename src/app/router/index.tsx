import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

// Public & Community Pages
import { LandingPage } from '@/features/community/pages/LandingPage';
import { DiscoverPage } from '@/features/community/pages/DiscoverPage';
import { SharedTripViewPage } from '@/features/community/pages/SharedTripViewPage';

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';

// Authenticated Pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { TripsListPage } from '@/features/trips/pages/TripsListPage';
import { CreateTripPage } from '@/features/trips/pages/CreateTripPage';
import { TripDetailPage } from '@/features/trips/pages/TripDetailPage';
import { TripSharePage } from '@/features/trips/pages/TripSharePage';
import { ItineraryBuilderPage } from '@/features/itinerary/pages/ItineraryBuilderPage';
import { TripCalendarPage } from '@/features/calendar/pages/TripCalendarPage';
import { TripBudgetPage } from '@/features/budget/pages/TripBudgetPage';
import { DestinationsPage } from '@/features/destinations/pages/DestinationsPage';
import { ActivitiesPage } from '@/features/activities/pages/ActivitiesPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { SettingsPage } from '@/features/profile/pages/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/features/admin/pages/AdminUsersPage';
import { AdminTripsPage } from '@/features/admin/pages/AdminTripsPage';
import { AdminCitiesPage } from '@/features/admin/pages/AdminCitiesPage';
import { AdminActivitiesPage } from '@/features/admin/pages/AdminActivitiesPage';
import { AdminAnalyticsPage } from '@/features/admin/pages/AdminAnalyticsPage';

export const router = createBrowserRouter([
  // Public Landing & Discover
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/discover',
    element: <DiscoverPage />,
  },
  {
    path: '/shared/:shareId',
    element: <SharedTripViewPage />,
  },

  // Auth Group
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Authenticated App Group
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/trips', element: <TripsListPage /> },
      { path: '/trips/new', element: <CreateTripPage /> },
      { path: '/trips/:tripId', element: <TripDetailPage /> },
      { path: '/trips/:tripId/itinerary', element: <ItineraryBuilderPage /> },
      { path: '/trips/:tripId/calendar', element: <TripCalendarPage /> },
      { path: '/trips/:tripId/budget', element: <TripBudgetPage /> },
      { path: '/trips/:tripId/share', element: <TripSharePage /> },
      { path: '/destinations', element: <DestinationsPage /> },
      { path: '/activities', element: <ActivitiesPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },

  // Admin Console Group
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'trips', element: <AdminTripsPage /> },
      { path: 'cities', element: <AdminCitiesPage /> },
      { path: 'activities', element: <AdminActivitiesPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
    ],
  },

  // Fallback 404 / Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
