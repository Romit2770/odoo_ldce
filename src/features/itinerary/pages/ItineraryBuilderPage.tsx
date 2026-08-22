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
  CheckCircle2,
  Tag,
  Star,
  Layers,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTripStore } from '@/app/store/useTripStore';
import { ActivityCategory, TripActivity } from '@/types/domain';

export const ItineraryBuilderPage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getTrip, activities: catalogActivities, addActivityToDay, removeActivity } = useTripStore();

  const trip = getTrip(tripId);

  // Selected stop & day
  const firstStop = trip?.stops?.[0];
  const [selectedStopId, setSelectedStopId] = useState<string>(firstStop?.id || '');
  const currentStop = trip?.stops?.find((s) => s.id === (selectedStopId || firstStop?.id)) || firstStop;

  const firstDay = currentStop?.itineraryDays?.[0];
  const [selectedDayId, setSelectedDayId] = useState<string>(firstDay?.id || '');
  const currentDay = currentStop?.itineraryDays?.find((d) => d.id === (selectedDayId || firstDay?.id)) || firstDay;

  // New Custom Activity Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('sightseeing');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [estimatedCost, setEstimatedCost] = useState('15');
  const [locationName, setLocationName] = useState('');
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentStop || !currentDay) return;

    addActivityToDay(tripId, currentStop.id, currentDay.id, {
      customTitle: title,
      category,
      startTime,
      endTime,
      durationMinutes: 120,
      estimatedCost: Number(estimatedCost) || 0,
      currency: 'USD',
      order: (currentDay.activities?.length || 0) + 1,
      status: 'planned',
      locationName: locationName || currentStop.cityName,
    });

    setTitle('');
    setLocationName('');
  };

  const handleInsertFromCatalog = (catalogAct: typeof catalogActivities[0]) => {
    if (!currentStop || !currentDay) return;

    addActivityToDay(tripId, currentStop.id, currentDay.id, {
      activityId: catalogAct.id,
      customTitle: catalogAct.title,
      category: catalogAct.category,
      startTime: '14:00',
      endTime: '16:00',
      durationMinutes: catalogAct.durationMinutes,
      estimatedCost: catalogAct.estimatedCost,
      currency: catalogAct.currency,
      order: (currentDay.activities?.length || 0) + 1,
      status: 'planned',
      locationName: currentStop.cityName,
    });

    setIsCatalogModalOpen(false);
  };

  if (!trip) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Trip not found</h2>
        <Button onClick={() => navigate('/trips')} className="mt-4">
          Return to Trips
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/trips/${tripId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Day-by-Day Itinerary Builder
              </h1>
              <Badge variant="default" className="bg-emerald-600 text-white">
                {trip.title}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Schedule activities inside individual Itinerary Days for each Trip Stop
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
            Calendar View
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

      {/* 1. Trip Stops Navigation Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" />
          Stops:
        </span>
        {trip.stops?.map((stop, index) => {
          const isSelected = stop.id === currentStop?.id;
          return (
            <button
              key={stop.id}
              onClick={() => {
                setSelectedStopId(stop.id);
                if (stop.itineraryDays?.[0]) {
                  setSelectedDayId(stop.itineraryDays[0].id);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                {index + 1}
              </span>
              <span>{stop.cityName}</span>
              <span className="opacity-75">({stop.stayDurationDays}d)</span>
            </button>
          );
        })}
      </div>

      {/* 2. Builder Core (Left: Itinerary Days Selector, Right: Day Activities & Add Forms) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Itinerary Days for the Active Stop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Days in {currentStop?.cityName}
            </h3>
            <span className="text-xs text-emerald-600 font-medium">
              {currentStop?.stayDurationDays} planned days
            </span>
          </div>

          <div className="space-y-2">
            {currentStop?.itineraryDays?.map((day) => {
              const isSelected = day.id === currentDay?.id;
              const count = day.activities?.length || 0;
              return (
                <div
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
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
                    {day.themeOrTitle || `Day ${day.dayNumber} Schedule`}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-600 font-medium">{count} experiences</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2-cols): Current Day Schedule and Activity Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 space-y-6">
            {/* Day Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-emerald-600 text-white">
                    Day {currentDay?.dayNumber}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentDay?.themeOrTitle || 'Scheduled Activities'}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stop: {currentStop?.cityName} • Date: {currentDay?.date}
                </p>
              </div>

              {/* Browse Catalog Dialog Trigger */}
              <Dialog open={isCatalogModalOpen} onOpenChange={setIsCatalogModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    Browse Curated Activities
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Curated Activities for {currentStop?.cityName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto pt-2">
                    {catalogActivities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                            {act.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="capitalize">{act.category}</span>
                            <span>•</span>
                            <span>{act.durationMinutes} mins</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-600">
                              {act.estimatedCost === 0 ? 'Free' : `$${act.estimatedCost}`}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInsertFromCatalog(act)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add to Day
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Scheduled Activities Timeline List */}
            <div className="space-y-3">
              {currentDay?.activities && currentDay.activities.length > 0 ? (
                currentDay.activities.map((act, idx) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {act.customTitle || 'Scheduled Activity'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          {act.startTime && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Clock className="h-3 w-3" /> {act.startTime} - {act.endTime}
                            </span>
                          )}
                          <span className="capitalize">{act.category.replace('_', ' ')}</span>
                          {act.locationName && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {act.locationName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {act.estimatedCost === 0 ? 'Free' : `$${act.estimatedCost}`}
                      </span>
                      <button
                        onClick={() =>
                          currentStop &&
                          currentDay &&
                          removeActivity(tripId, currentStop.id, currentDay.id, act.id)
                        }
                        title="Remove activity"
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">
                    No activities scheduled yet for Day {currentDay?.dayNumber}. Add one below or browse the curated catalog.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Activity Inline Form */}
            <form
              onSubmit={handleAddCustomActivity}
              className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add Custom Activity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Activity Title (e.g. Scuba Diving Tour)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="sm:col-span-2 text-xs"
                  required
                />
                <Input
                  placeholder="Location (e.g. Baga Beach)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                  options={[
                    { label: 'Sightseeing', value: 'sightseeing' },
                    { label: 'Adventure', value: 'adventure' },
                    { label: 'Culture & History', value: 'culture_history' },
                    { label: 'Food & Dining', value: 'food_and_dining' },
                    { label: 'Relaxation', value: 'relaxation' },
                    { label: 'Shopping', value: 'shopping' },
                  ]}
                />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Cost ($)"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs w-full sm:w-auto"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Experience to Day {currentDay?.dayNumber}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
