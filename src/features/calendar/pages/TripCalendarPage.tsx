import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowLeft, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TripCalendarPage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const daysTimeline = [
    {
      date: 'Sep 10, 2026',
      dayNumber: 1,
      stopName: 'Mumbai Stop',
      events: [
        { time: '10:00 AM', title: 'Gateway of India Walk', category: 'sightseeing' },
        { time: '05:30 PM', title: 'Marine Drive Sunset', category: 'relaxation' },
      ],
    },
    {
      date: 'Sep 11, 2026',
      dayNumber: 2,
      stopName: 'Mumbai Stop',
      events: [
        { time: '09:00 AM', title: 'Elephanta Island Caves', category: 'culture_history' },
      ],
    },
    {
      date: 'Sep 13, 2026',
      dayNumber: 4,
      stopName: 'Goa Stop',
      events: [
        { time: '11:00 AM', title: 'Baga Beach Watersports', category: 'adventure' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Trip Itinerary Calendar
            </h1>
            <p className="text-xs text-slate-500">
              Interactive timeline and day schedule across all trip stops
            </p>
          </div>
        </div>

        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => navigate(`/trips/${tripId}/itinerary`)}
        >
          Edit Day Schedule
        </Button>
      </div>

      <div className="space-y-4">
        {daysTimeline.map((item) => (
          <Card key={item.dayNumber} className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="bg-slate-50/70 dark:bg-slate-900/70 py-3 px-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-emerald-600 text-white">
                  Day {item.dayNumber}
                </Badge>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {item.date}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>{item.stopName}</span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {item.events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {event.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {event.category.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
