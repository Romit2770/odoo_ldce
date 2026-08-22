import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const DestinationsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const cities = [
    {
      id: 'city_mumbai',
      name: 'Mumbai',
      country: 'India',
      description: 'The energetic coastal metropolis blending Victorian heritage, bustling markets, and iconic waterfronts.',
      avgDailyCost: 65,
      popularSeason: 'Oct - Mar',
      activitiesCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'city_goa',
      name: 'Goa',
      country: 'India',
      description: 'Tropical coastal haven famous for serene beaches, heritage Portuguese churches, and vibrant seaside nightlife.',
      avgDailyCost: 55,
      popularSeason: 'Nov - Feb',
      activitiesCount: 38,
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'city_kyoto',
      name: 'Kyoto',
      country: 'Japan',
      description: 'The cultural soul of Japan filled with thousands of classical Buddhist temples, gardens, and imperial palaces.',
      avgDailyCost: 110,
      popularSeason: 'Mar - May',
      activitiesCount: 64,
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Explore Destinations
        </h1>
        <p className="text-xs text-slate-500">
          Discover verified cities and destinations to add as stops in your custom multi-city trips
        </p>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Search by city or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((city) => (
          <Card key={city.id} className="overflow-hidden flex flex-col justify-between group">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={city.imageUrl}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-xs font-semibold">
                  <MapPin className="h-3 w-3 mr-1 text-emerald-600" />
                  {city.country}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {city.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{city.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Est. Daily:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ${city.avgDailyCost}/day
                  </span>
                </div>

                <span className="text-emerald-600 font-medium">
                  {city.activitiesCount} Activities
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
