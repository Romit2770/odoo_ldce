import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  DollarSign,
  ArrowLeft,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const ItineraryBuilderPage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // Active selected stop & day
  const [selectedStopId, setSelectedStopId] = useState('stop_1');
  const [selectedDayId, setSelectedDayId] = useState('day_1');

  // Hierarchy Data Model Demonstration
  const [stops, setStops] = useState([
    {
      id: 'stop_1',
      cityName: 'Mumbai',
      stayDays: 3,
      days: [
        {
          id: 'day_1',
          dayNumber: 1,
          date: '2026-09-10',
          title: 'Arrival & Colonial Heritage',
          activities: [
            { id: 'a1', title: 'Gateway of India', category: 'sightseeing', time: '10:00 AM', cost: 10 },
            { id: 'a2', title: 'Marine Drive Sunset Stroll', category: 'relaxation', time: '05:30 PM', cost: 0 },
          ],
        },
        {
          id: 'day_2',
          dayNumber: 2,
          date: '2026-09-11',
          title: 'Art & Harbor Culture',
          activities: [
            { id: 'a3', title: 'Elephanta Island Ferry & Caves', category: 'culture_history', time: '09:00 AM', cost: 25 },
          ],
        },
      ],
    },
    {
      id: 'stop_2',
      cityName: 'Goa',
      stayDays: 5,
      days: [
        {
          id: 'day_3',
          dayNumber: 3,
          date: '2026-09-13',
          title: 'North Goa Beaches',
          activities: [
            { id: 'a4', title: 'Baga Beach Watersports', category: 'adventure', time: '11:00 AM', cost: 45 },
          ],
        },
      ],
    },
  ]);

  const currentStop = stops.find((s) => s.id === selectedStopId) || stops[0];
  const currentDay = currentStop.days.find((d) => d.id === selectedDayId) || currentStop.days[0];

  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCost, setNewActivityCost] = useState('15');

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    const newAct = {
      id: `act_${Date.now()}`,
      title: newActivityTitle,
      category: 'sightseeing',
      time: '02:00 PM',
      cost: Number(newActivityCost) || 0,
    };

    setStops(
      stops.map((stop) => {
        if (stop.id === selectedStopId) {
          return {
            ...stop,
            days: stop.days.map((day) => {
              if (day.id === (currentDay?.id || 'day_1')) {
                return {
                  ...day,
                  activities: [...day.activities, newAct],
                };
              }
              return day;
            }),
          };
        }
        return stop;
      })
    );

    setNewActivityTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Day-by-Day Itinerary Builder
            </h1>
            <p className="text-xs text-slate-500">
              Organize activities inside Trip Stops & Itinerary Days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/trips/${tripId}/calendar`)}
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/trips/${tripId}/budget`)}
          >
            <DollarSign className="h-3.5 w-3.5 mr-1" />
            Budget
          </Button>
        </div>
      </div>

      {/* 1. Stop Selector (Top Navigation Bar) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Trip Stops:
        </span>
        {stops.map((stop, index) => (
          <button
            key={stop.id}
            onClick={() => {
              setSelectedStopId(stop.id);
              if (stop.days[0]) setSelectedDayId(stop.days[0].id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              stop.id === selectedStopId
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
              {index + 1}
            </span>
            <span>{stop.cityName}</span>
            <span className="opacity-75">({stop.stayDays}d)</span>
          </button>
        ))}
      </div>

      {/* 2. Main Builder Grid (Days List + Activity Timeline) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Itinerary Days for the Selected Stop */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Scheduled Days in {currentStop.cityName}
          </h3>
          <div className="space-y-2">
            {currentStop.days.map((day) => (
              <div
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  day.id === (currentDay?.id || 'day_1')
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[11px] text-slate-400">{day.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                  {day.title}
                </p>
                <div className="mt-2 text-[11px] text-emerald-600 font-medium">
                  {day.activities.length} activities scheduled
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns (2-wide): Activities for the Selected Day */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Day {currentDay?.dayNumber}: {currentDay?.title}
                </CardTitle>
                <span className="text-xs text-slate-400">
                  Location: {currentStop.cityName} Stop • Date: {currentDay?.date}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activity Timeline List */}
              <div className="space-y-2.5">
                {currentDay?.activities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {activity.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {activity.time}
                          </span>
                          <span className="capitalize">{activity.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        ${activity.cost}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Activity Form */}
              <form
                onSubmit={handleAddActivity}
                className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
              >
                <Input
                  placeholder="Add activity (e.g. Fort Aguada & Sunset View)"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="flex-1 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Cost ($)"
                  value={newActivityCost}
                  onChange={(e) => setNewActivityCost(e.target.value)}
                  className="w-24 text-xs"
                />
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Activity
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
