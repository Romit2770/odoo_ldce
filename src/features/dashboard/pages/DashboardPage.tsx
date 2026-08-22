import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/AuthProvider';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Smart Travel Planning</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Welcome back, {user?.name || 'Traveler'}!
          </h1>
          <p className="text-sm text-emerald-100/85 leading-relaxed">
            Plan your next journey with seamless multi-city stops, day-by-day scheduling, and real-time budget tracking.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/trips/new')}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold shadow-md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create New Trip
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/discover')}
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <Compass className="h-4 w-4 mr-1.5" />
              Explore Community Itineraries
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Active Trips</CardTitle>
            <Compass className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">1</div>
            <p className="text-xs text-slate-400 mt-1">Upcoming journey to Mumbai & Goa</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Total Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">2 Stops</div>
            <p className="text-xs text-slate-400 mt-1">Across 8 planned days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Estimated Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">$1,500</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Within allocated limit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">Saved Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">6 Planned</div>
            <p className="text-xs text-slate-400 mt-1">Sightseeing & water sports</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Current Trip Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Journey</h2>
            <p className="text-xs text-slate-500">Your next scheduled adventure</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/trips')} className="text-xs">
            View All Trips <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <div className="grid md:grid-cols-3">
            <div className="relative h-48 md:h-full bg-slate-200 dark:bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80"
                alt="Goa & Mumbai"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="default" className="bg-emerald-600/90 backdrop-blur-sm text-white">
                  Upcoming
                </Badge>
              </div>
            </div>

            <div className="p-6 md:col-span-2 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Sep 10, 2026 - Sep 18, 2026 (8 days)</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Coastal Gateway & Heritage Tour
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  A balanced trip starting with historical Mumbai landmarks and moving down to coastal Goa beaches and water activities.
                </p>

                {/* Stop Hierarchy Preview */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3 w-3 text-emerald-600" /> Stop 1: Mumbai (3 days)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <MapPin className="h-3 w-3 text-emerald-600" /> Stop 2: Goa (5 days)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Budget:</span>{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">$1,500</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Activities:</span>{' '}
                    <span className="font-bold text-slate-800 dark:text-slate-200">6 Items</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/trips/trip_1/budget')}
                  >
                    Budget
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/trips/trip_1/calendar')}
                  >
                    Calendar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => navigate('/trips/trip_1/itinerary')}
                  >
                    Open Itinerary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
