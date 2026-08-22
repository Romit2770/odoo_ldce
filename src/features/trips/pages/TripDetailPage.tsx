import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  DollarSign,
  Share2,
  CalendarDays,
  FileText,
  PieChart,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/common/MapView';

export const TripDetailPage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const mockTrip = {
    id: tripId,
    title: 'Coastal Gateway & Heritage Tour',
    description: 'A multi-city adventure traveling down from Mumbai to Goa.',
    startDate: '2026-09-10',
    endDate: '2026-09-18',
    status: 'upcoming' as const,
    totalDays: 8,
    totalBudget: 1500,
    currency: 'USD',
    stops: [
      {
        id: 'stop_1',
        cityName: 'Mumbai',
        country: 'India',
        stayDurationDays: 3,
        latitude: 18.922,
        longitude: 72.8347,
        days: [
          { day: 1, date: '2026-09-10', activities: ['Gateway of India', 'Marine Drive Walk'] },
          { day: 2, date: '2026-09-11', activities: ['Elephanta Caves Tour'] },
          { day: 3, date: '2026-09-12', activities: ['Colaba Causeway & Cafe Leopold'] },
        ],
      },
      {
        id: 'stop_2',
        cityName: 'Goa',
        country: 'India',
        stayDurationDays: 5,
        latitude: 15.2993,
        longitude: 74.124,
        days: [
          { day: 4, date: '2026-09-13', activities: ['Arrival & Baga Beach Sunset'] },
          { day: 5, date: '2026-09-14', activities: ['Fort Aguada & Watersports'] },
          { day: 6, date: '2026-09-15', activities: ['Old Goa Churches & Spice Plantation'] },
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {mockTrip.title}
              </h1>
              <Badge variant="default" className="bg-emerald-600 text-white">
                {mockTrip.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{mockTrip.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/trips/${tripId}/share`)}
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share Trip
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate(`/trips/${tripId}/itinerary`)}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Edit Itinerary
          </Button>
        </div>
      </div>

      {/* Action Sub-nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link
          to={`/trips/${tripId}`}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium text-xs shadow-sm"
        >
          Overview
        </Link>
        <Link
          to={`/trips/${tripId}/itinerary`}
          className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-medium"
        >
          Day-by-Day Itinerary
        </Link>
        <Link
          to={`/trips/${tripId}/calendar`}
          className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-medium"
        >
          Calendar View
        </Link>
        <Link
          to={`/trips/${tripId}/budget`}
          className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-medium"
        >
          Budget & Expenses
        </Link>
      </div>

      {/* Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Trip Hierarchy & Stop Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip Hierarchy Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {mockTrip.stops.map((stop, stopIndex) => (
                <div
                  key={stop.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {stopIndex + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          Stop: {stop.cityName}, {stop.country}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {stop.stayDurationDays} days planned stay
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nested Itinerary Days */}
                  <div className="pl-4 border-l-2 border-emerald-500/30 space-y-2 mt-3">
                    {stop.days.map((d) => (
                      <div
                        key={d.day}
                        className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/70"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                          <span>Day {d.day} ({d.date})</span>
                        </div>
                        <ul className="text-xs text-slate-500 space-y-1">
                          {d.activities.map((act) => (
                            <li key={act} className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Route Map & Financial Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Multi-Stop Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView
                height="280px"
                markers={mockTrip.stops.map((s, idx) => ({
                  id: s.id,
                  title: s.cityName,
                  latitude: s.latitude,
                  longitude: s.longitude,
                  stopOrder: idx + 1,
                }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Budget:</span>
                <span className="font-bold">${mockTrip.totalBudget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Average Daily Cost:</span>
                <span className="font-bold">${(mockTrip.totalBudget / mockTrip.totalDays).toFixed(0)}/day</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full w-1/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
