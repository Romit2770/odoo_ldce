import React from 'react';
import { TrendingUp, Users, Map, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Analytics & Growth</h1>
        <p className="text-xs text-slate-400">
          Monitor multi-city trip creation, user engagement, and community sharing patterns
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-slate-850 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-400">Total Trips Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">3,890</div>
            <p className="text-xs text-slate-400 mt-1">Across 180 global destinations</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-850 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-400">Public Shared Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-400">310</div>
            <p className="text-xs text-slate-400 mt-1">Shared via unique permalinks</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-850 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-slate-400">Community Clones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">540 Copies</div>
            <p className="text-xs text-slate-400 mt-1">Cloned into personal itineraries</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
