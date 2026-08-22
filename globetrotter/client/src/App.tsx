/**
 * GlobeTrotter Main App & Router
 * Storybook Atlas multi-city travel planning platform with demo authentication,
 * 4-step onboarding, and route guards.
 */

import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AdminConsolePage } from "@/pages/AdminConsole";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  AdminPage,
  BudgetPage,
  DashboardPage,
  DiscoverPage,
  DestinationsPage,
  ActivitiesPage,
  MapCalendarPage,
  ProfileSettingsPage,
  SharePage,
  TripOverviewPage,
  TripsPage,
  TripWizardPage,
  ItineraryPage,
} from "./pages/ProductPages";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { OnboardingPage } from "./pages/auth/OnboardingPage";
import { Redirect, Route, Switch } from "wouter";

function ProtectedProductRoutes() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // If user signed up but hasn't completed the 4-step onboarding, guide them there
  if (user && user.onboardingCompleted === false) {
    return <Redirect to="/onboarding" />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/trips" component={TripsPage} />
        <Route path="/trips/new" component={TripWizardPage} />
        <Route path="/trips/:tripId" component={TripOverviewPage} />
        <Route path="/trips/:tripId/itinerary" component={ItineraryPage} />
        <Route path="/trips/:tripId/calendar" component={MapCalendarPage} />
        <Route path="/trips/:tripId/budget" component={BudgetPage} />
        <Route path="/trips/:tripId/map" component={MapCalendarPage} />
        <Route path="/trips/:tripId/share" component={SharePage} />
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/destinations" component={DestinationsPage} />
        <Route path="/activities" component={ActivitiesPage} />
        <Route path="/profile" component={ProfileSettingsPage} />
        <Route path="/settings" component={ProfileSettingsPage} />
        <Route path="/shared/:shareId" component={SharePage} />
        <Route component={DashboardPage} />
      </Switch>
    </AppShell>
  );
}

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin" component={AdminConsolePage} />
      <Route path="/admin/users" component={AdminConsolePage} />
      <Route path="/admin/trips" component={AdminConsolePage} />
      <Route path="/admin/cities" component={AdminConsolePage} />
      <Route path="/admin/activities" component={AdminConsolePage} />
      <Route path="/admin/analytics" component={AdminConsolePage} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Switch>
      <Route path="/login">
        {isAuthenticated && user?.onboardingCompleted !== false ? (
          <Redirect to="/dashboard" />
        ) : (
          <LoginPage />
        )}
      </Route>
      <Route path="/register">
        {isAuthenticated && user?.onboardingCompleted !== false ? (
          <Redirect to="/dashboard" />
        ) : (
          <RegisterPage />
        )}
      </Route>
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/onboarding">
        {!isAuthenticated ? <Redirect to="/login" /> : <OnboardingPage />}
      </Route>
      <Route path="/admin/:rest*" component={AdminRoutes} />
      <Route path="/admin" component={AdminRoutes} />
      <Route component={ProtectedProductRoutes} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <TripPlannerProvider>
              <Toaster richColors position="top-center" />
              <Router />
            </TripPlannerProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
