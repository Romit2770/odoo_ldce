import React, { useState } from 'react';
import { Search, Clock, DollarSign, Star, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const ActivitiesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const activities = [
    {
      id: 'act_1',
      title: 'Gateway of India & Harbor Walk',
      city: 'Mumbai',
      category: 'sightseeing',
      cost: 10,
      duration: '1.5 hrs',
      rating: 4.8,
      description: 'Historical tour of Mumbai landmark with views of the Arabian Sea.',
    },
    {
      id: 'act_2',
      title: 'Marine Drive Sunset Promenade',
      city: 'Mumbai',
      category: 'relaxation',
      cost: 0,
      duration: '2 hrs',
      rating: 4.9,
      description: 'Iconic Queen’s Necklace waterfront walk during sunset.',
    },
    {
      id: 'act_3',
      title: 'Baga Beach Watersports Pass',
      city: 'Goa',
      category: 'adventure',
      cost: 45,
      duration: '3 hrs',
      rating: 4.7,
      description: 'Parasailing, jet ski rides, and banana boat group adventures.',
    },
    {
      id: 'act_4',
      title: 'Old Goa Heritage Churches',
      city: 'Goa',
      category: 'culture_history',
      cost: 15,
      duration: '2.5 hrs',
      rating: 4.8,
      description: 'UNESCO World Heritage Basilica of Bom Jesus and Se Cathedral.',
    },
  ];

  const filtered = activities.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || a.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Activities & Experiences Catalog
        </h1>
        <p className="text-xs text-slate-500">
          Discover vetted sights, adventures, food tours, and relaxation spots to add to any itinerary day
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search activities or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'sightseeing', 'adventure', 'culture_history', 'relaxation'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((act) => (
          <Card key={act.id} className="p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="secondary" className="capitalize text-[10px]">
                  {act.category.replace('_', ' ')}
                </Badge>
                <span className="text-xs text-slate-400 font-medium">{act.city}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{act.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{act.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {act.duration}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {act.rating}
                </span>
              </div>

              <span className="font-bold text-slate-900 dark:text-white">
                {act.cost === 0 ? 'Free' : `$${act.cost}`}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
