import React from 'react';
import { Users, Map, Building2, Flame, TrendingUp, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const AdminDashboardPage: React.FC = () => {
  const stats = [
    { title: 'Total Registered Users', value: '1,420', change: '+12%', icon: Users, color: 'text-sky-400' },
    { title: 'Active Multi-City Trips', value: '3,890', change: '+24%', icon: Map, color: 'text-emerald-400' },
    { title: 'Curated Destinations', value: '180', change: '+4%', icon: Building2, color: 'text-amber-400' },
    { title: 'Vetted Activities', value: '940', change: '+18%', icon: Flame, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Administration Console</h1>
        <p className="text-xs text-slate-400">
          Global platform health, content catalogs, and usage analytics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="bg-slate-850 border-slate-800 text-slate-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-slate-400">
                  {item.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>{item.change} from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-850 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-white">Database Status (Odoo / PostgreSQL)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <span className="text-slate-300">Relational Database Engine:</span>
              <span className="font-semibold text-emerald-400">PostgreSQL (Relational Ready)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <span className="text-slate-300">Odoo ORM Integration:</span>
              <span className="font-semibold text-emerald-400">Connected Endpoint</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
              <span className="text-slate-300">Hierarchy Integrity:</span>
              <span className="font-semibold text-emerald-400">Trip &gt; TripStop &gt; ItineraryDay &gt; Activity</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-850 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base text-white">Popular Destinations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            {[
              { city: 'Mumbai', trips: 840, share: '24%' },
              { city: 'Goa', trips: 920, share: '28%' },
              { city: 'Kyoto', trips: 560, share: '16%' },
              { city: 'Paris', trips: 710, share: '20%' },
            ].map((d) => (
              <div key={d.city} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800">
                <span className="font-medium text-slate-200">{d.city}</span>
                <span className="text-slate-400">{d.trips} trips ({d.share})</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
