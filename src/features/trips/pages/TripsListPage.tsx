import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, DollarSign, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const TripsListPage: React.FC = () => {
  const navigate = useNavigate();

  const mockTrips = [
    {
      id: 'trip_1',
      title: 'Coastal Gateway & Heritage Tour',
      description: 'Historical exploration and tropical coastline across Mumbai and Goa.',
      startDate: '2026-09-10',
      endDate: '2026-09-18',
      status: 'upcoming' as const,
      totalEstimatedBudget: 1500,
      currency: 'USD',
      totalDays: 8,
      stops: ['Mumbai', 'Goa'],
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Trips</h1>
          <p className="text-xs text-slate-500">Manage all your upcoming, ongoing, and completed trips</p>
        </div>
        <Button onClick={() => navigate('/trips/new')} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Trip
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockTrips.map((trip) => (
          <Card key={trip.id} className="overflow-hidden flex flex-col justify-between group">
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              <img
                src={trip.imageUrl}
                alt={trip.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="default" className="capitalize bg-emerald-600/90 text-white">
                  {trip.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    {trip.startDate} - {trip.endDate} ({trip.totalDays} days)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {trip.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{trip.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trip.stops.map((stop) => (
                    <span
                      key={stop}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {stop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span>${trip.totalEstimatedBudget}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/trips/${trip.id}/share`)}
                    className="p-2 h-8 w-8"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
