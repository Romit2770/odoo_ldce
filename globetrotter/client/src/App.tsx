/** Storybook Atlas UI reminder: routes form one coherent planning journey rather than disconnected demo screens. */

import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TripPlannerProvider } from "@/contexts/TripPlannerContext";
import { AdminConsolePage } from "@/pages/AdminConsole";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminPage, AuthPage, BudgetPage, DashboardPage, DiscoverPage, MapCalendarPage, ProfileSettingsPage, SharePage, TripOverviewPage, TripsPage, TripWizardPage, ItineraryPage } from "./pages/ProductPages";
import { Route, Switch } from "wouter";

function ProtectedProductRoutes() {
  return <AppShell><Switch>
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
    <Route path="/destinations" component={DiscoverPage} />
    <Route path="/activities" component={DiscoverPage} />
    <Route path="/profile" component={ProfileSettingsPage} />
    <Route path="/settings" component={ProfileSettingsPage} />
    <Route path="/shared/:shareId" component={SharePage} />
    <Route component={DashboardPage} />
  </Switch></AppShell>;
}

function AdminRoutes() {
  return <Switch>
    <Route path="/admin" component={AdminConsolePage} />
    <Route path="/admin/users" component={AdminConsolePage} />
    <Route path="/admin/trips" component={AdminConsolePage} />
    <Route path="/admin/cities" component={AdminConsolePage} />
    <Route path="/admin/activities" component={AdminConsolePage} />
    <Route path="/admin/analytics" component={AdminConsolePage} />
  </Switch>;
}

function Router() {
  return <Switch>
    <Route path="/login"><AuthPage mode="login" /></Route>
    <Route path="/register"><AuthPage mode="register" /></Route>
    <Route path="/forgot-password"><AuthPage mode="forgot" /></Route>
    <Route path="/admin/:rest*" component={AdminRoutes} />
    <Route path="/admin" component={AdminRoutes} />
    <Route component={ProtectedProductRoutes} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><TripPlannerProvider><Toaster richColors position="top-center" /><Router /></TripPlannerProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
