import React from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const AdminCitiesPage: React.FC = () => {
  const cities = [
    { id: '1', name: 'Mumbai', country: 'India', avgDailyCost: 65, activities: 42 },
    { id: '2', name: 'Goa', country: 'India', avgDailyCost: 55, activities: 38 },
    { id: '3', name: 'Kyoto', country: 'Japan', avgDailyCost: 110, activities: 64 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Cities & Destinations Database</h1>
          <p className="text-xs text-slate-400">Curate master destinations available for multi-stop journeys</p>
        </div>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-1" />
          Add New City
        </Button>
      </div>

      <Card className="bg-slate-850 border-slate-800 text-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">City</th>
                <th className="p-4">Country</th>
                <th className="p-4">Avg Daily Cost</th>
                <th className="p-4">Active Activities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {cities.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-semibold text-white">{c.name}</td>
                  <td className="p-4 text-slate-300">{c.country}</td>
                  <td className="p-4 text-emerald-400 font-bold">${c.avgDailyCost}/day</td>
                  <td className="p-4 text-slate-300">{c.activities} registered</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
