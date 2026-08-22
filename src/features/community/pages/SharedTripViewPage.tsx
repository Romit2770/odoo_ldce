import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Calendar, MapPin, DollarSign, ArrowLeft, Compass, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/common/MapView';

export const SharedTripViewPage: React.FC = () => {
  const { shareId = 'GOA-EXPLORE-2026' } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [cloned, setCloned] = React.useState(false);

  const sharedTrip = {
    title: 'Coastal Gateway & Heritage Tour',
    author: 'Alex Johnson',
    durationDays: 8,
    budget: 1500,
    currency: 'USD',
    description: 'A multi-city adventure traveling down from historical Mumbai to the sunny beaches of Goa.',
    stops: [
      {
        cityName: 'Mumbai',
        daysCount: 3,
        latitude: 18.922,
        longitude: 72.8347,
        activities: ['Gateway of India Walk', 'Marine Drive Sunset', 'Elephanta Island Caves'],
      },
      {
        cityName: 'Goa',
        daysCount: 5,
        latitude: 15.2993,
        longitude: 74.124,
        activities: ['Baga Beach Watersports', 'Fort Aguada Visit', 'Old Goa Churches'],
      },
    ],
  };

  const handleClone = () => {
    setCloned(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/discover')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {sharedTrip.title}
              </h1>
              <Badge variant="secondary" className="text-xs">
                Shared Itinerary
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created by {sharedTrip.author} • Code: {shareId}
            </p>
          </div>
        </div>

        <Button
          onClick={handleClone}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
        >
          {cloned ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
          {cloned ? 'Cloned to Your Trips!' : 'Copy to My Trips'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip Itinerary Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sharedTrip.stops.map((stop, idx) => (
                <div
                  key={stop.cityName}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        Stop: {stop.cityName}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{stop.daysCount} days</span>
                  </div>

                  <ul className="pl-8 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {stop.activities.map((a) => (
                      <li key={a} className="list-disc">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView
                height="220px"
                markers={sharedTrip.stops.map((s, idx) => ({
                  id: `stop_${idx}`,
                  title: s.cityName,
                  latitude: s.latitude,
                  longitude: s.longitude,
                  stopOrder: idx + 1,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
