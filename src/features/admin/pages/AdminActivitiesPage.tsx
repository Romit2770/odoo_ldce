import React from 'react';
import { Flame, Plus, Search, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const AdminActivitiesPage: React.FC = () => {
  const activities = [
    { id: '1', title: 'Gateway of India Walk', city: 'Mumbai', category: 'sightseeing', cost: 10, rating: 4.8 },
    { id: '2', title: 'Marine Drive Sunset', city: 'Mumbai', category: 'relaxation', cost: 0, rating: 4.9 },
    { id: '3', title: 'Baga Beach Watersports', city: 'Goa', category: 'adventure', cost: 45, rating: 4.7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Activities Catalog Management</h1>
          <p className="text-xs text-slate-400">Manage curated travel activities, categories, and estimates</p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add New Activity
        </Button>
      </div>

      <Card className="bg-slate-850 border-slate-800 text-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Activity Title</th>
                <th className="p-4">City</th>
                <th className="p-4">Category</th>
                <th className="p-4">Est. Cost</th>
                <th className="p-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-semibold text-white">{a.title}</td>
                  <td className="p-4 text-slate-300">{a.city}</td>
                  <td className="p-4">
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {a.category}
                    </Badge>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold">
                    {a.cost === 0 ? 'Free' : `$${a.cost}`}
                  </td>
                  <td className="p-4 text-amber-400 font-semibold">{a.rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
