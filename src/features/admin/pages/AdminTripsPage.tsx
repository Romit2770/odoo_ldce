import React from 'react';
import { Map, Search, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export const AdminTripsPage: React.FC = () => {
  const trips = [
    { id: 'trip_1', title: 'Coastal Gateway & Heritage Tour', author: 'Alex Johnson', stops: 'Mumbai -> Goa', status: 'upcoming', budget: 1500 },
    { id: 'trip_2', title: 'Classic Japan Heritage Circuit', author: 'Elena Rostova', stops: 'Tokyo -> Kyoto -> Osaka', status: 'completed', budget: 2400 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Trips Registry</h1>
          <p className="text-xs text-slate-400">Review all itineraries across the platform</p>
        </div>
        <div className="w-72">
          <Input placeholder="Search trips..." icon={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <Card className="bg-slate-850 border-slate-800 text-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Trip Title</th>
                <th className="p-4">Creator</th>
                <th className="p-4">Stop Route</th>
                <th className="p-4">Status</th>
                <th className="p-4">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/50">
                  <td className="p-4 font-semibold text-white">{t.title}</td>
                  <td className="p-4 text-slate-300">{t.author}</td>
                  <td className="p-4 text-emerald-400 font-mono">{t.stops}</td>
                  <td className="p-4">
                    <Badge variant="default" className="capitalize text-[10px] bg-emerald-700">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="p-4 font-bold text-slate-200">${t.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
