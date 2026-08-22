import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Eye, Copy, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const publicTrips = [
    {
      shareCode: 'GOA-EXPLORE-2026',
      title: 'Coastal Gateway & Heritage Tour',
      author: 'Alex Johnson',
      cities: ['Mumbai', 'Goa'],
      durationDays: 8,
      viewsCount: 412,
      clonesCount: 35,
      budget: 1500,
      description: '8-day immersive journey across Mumbai monuments and North & South Goa beaches.',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    },
    {
      shareCode: 'KYOTO-ZEN-2026',
      title: 'Classic Japan Heritage Circuit',
      author: 'Elena Rostova',
      cities: ['Tokyo', 'Kyoto', 'Osaka'],
      durationDays: 10,
      viewsCount: 780,
      clonesCount: 92,
      budget: 2400,
      description: 'Historical shrines, bamboo groves, and culinary markets across 3 cities.',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Community Discover
        </h1>
        <p className="text-xs text-slate-500">
          Browse publicly shared travel itineraries, draw inspiration, or clone them directly to your account
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by itinerary title or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {publicTrips.map((trip) => (
          <Card key={trip.shareCode} className="overflow-hidden flex flex-col justify-between group">
            <div className="relative h-44 bg-slate-100 overflow-hidden">
              <img
                src={trip.imageUrl}
                alt={trip.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 text-xs font-semibold">
                  By {trip.author}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    {trip.durationDays} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {trip.viewsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" />
                    {trip.clonesCount} copies
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {trip.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{trip.description}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {trip.cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300"
                    >
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Est. ${trip.budget}
                </span>

                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                  onClick={() => navigate(`/shared/${trip.shareCode}`)}
                >
                  View Itinerary
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
