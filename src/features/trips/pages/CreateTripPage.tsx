import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTripStore } from '@/app/store/useTripStore';
import { TripStop, ItineraryDay } from '@/types/domain';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { cities, createTrip } = useTripStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-10');
  const [budget, setBudget] = useState('2000');
  const [coverImageUrl, setCoverImageUrl] = useState(
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80'
  );

  // Step 2: Multi-Stop City Sequence
  const [stops, setStops] = useState<
    {
      cityId: string;
      cityName: string;
      country: string;
      stayDurationDays: number;
      latitude?: number;
      longitude?: number;
    }[]
  >([
    {
      cityId: 'city_mumbai',
      cityName: 'Mumbai',
      country: 'India',
      stayDurationDays: 4,
      latitude: 18.922,
      longitude: 72.8347,
    },
    {
      cityId: 'city_goa',
      cityName: 'Goa',
      country: 'India',
      stayDurationDays: 6,
      latitude: 15.2993,
      longitude: 74.124,
    },
  ]);

  const totalStopDays = stops.reduce((sum, s) => sum + Number(s.stayDurationDays || 0), 0);

  const addStop = () => {
    const defaultCity = cities[0] || {
      id: `city_${Date.now()}`,
      name: 'New City',
      country: 'Destination',
      latitude: 0,
      longitude: 0,
    };

    setStops([
      ...stops,
      {
        cityId: defaultCity.id,
        cityName: defaultCity.name,
        country: defaultCity.country,
        stayDurationDays: 3,
        latitude: defaultCity.latitude,
        longitude: defaultCity.longitude,
      },
    ]);
  };

  const updateStopCity = (index: number, cityId: string) => {
    const matchedCity = cities.find((c) => c.id === cityId);
    if (!matchedCity) return;

    const updated = [...stops];
    updated[index] = {
      ...updated[index],
      cityId: matchedCity.id,
      cityName: matchedCity.name,
      country: matchedCity.country,
      latitude: matchedCity.latitude,
      longitude: matchedCity.longitude,
    };
    setStops(updated);
  };

  const removeStop = (index: number) => {
    if (stops.length <= 1) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate Itinerary Days according to the domain hierarchy
    let currentDayNumber = 1;
    let runningDate = new Date(startDate);

    const generatedStops: TripStop[] = stops.map((stop, sIndex) => {
      const stopArrival = new Date(runningDate).toISOString().split('T')[0];
      const stopDays: ItineraryDay[] = [];

      for (let d = 0; d < stop.stayDurationDays; d++) {
        const dayDate = new Date(runningDate).toISOString().split('T')[0];
        stopDays.push({
          id: `day_gen_${sIndex}_${d}_${Date.now()}`,
          tripStopId: `stop_gen_${sIndex}`,
          tripId: '',
          dayNumber: currentDayNumber,
          date: dayDate,
          themeOrTitle: `Day ${currentDayNumber} in ${stop.cityName}`,
          activities: [],
        });
        currentDayNumber++;
        runningDate.setDate(runningDate.getDate() + 1);
      }

      const stopDeparture = new Date(runningDate).toISOString().split('T')[0];

      return {
        id: `stop_gen_${sIndex}_${Date.now()}`,
        tripId: '',
        cityId: stop.cityId,
        cityName: stop.cityName,
        country: stop.country,
        order: sIndex + 1,
        arrivalDate: stopArrival,
        departureDate: stopDeparture,
        stayDurationDays: stop.stayDurationDays,
        latitude: stop.latitude,
        longitude: stop.longitude,
        itineraryDays: stopDays,
      };
    });

    const newTrip = createTrip({
      userId: 'usr_demo_1',
      title: title || 'My Multi-City Journey',
      description: description || 'Exciting multi-destination trip with personalized stops.',
      coverImageUrl,
      startDate,
      endDate,
      status: 'upcoming',
      visibility: 'private',
      totalEstimatedBudget: Number(budget) || 1500,
      currency: 'USD',
      stopsCount: generatedStops.length,
      totalDays: totalStopDays,
      stops: generatedStops,
    });

    navigate(`/trips/${newTrip.id}/itinerary`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in-50">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Multi-City Trip
          </h1>
          <p className="text-xs text-slate-500">
            Step-by-step personalized travel planning wizard
          </p>
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between border-y border-slate-200 dark:border-slate-800 py-3 text-xs font-semibold">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            1
          </span>
          <span>Trip Overview</span>
        </button>

        <span className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />

        <button
          onClick={() => title && setStep(2)}
          disabled={!title}
          className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-emerald-600 text-white' : step > 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
            2
          </span>
          <span>Multi-City Stops</span>
        </button>

        <span className="h-0.5 w-12 bg-slate-200 dark:bg-slate-800" />

        <button
          onClick={() => title && setStep(3)}
          disabled={!title || stops.length === 0}
          className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
        >
          <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3
          </span>
          <span>Review & Build</span>
        </button>
      </div>

      {/* STEP 1: Overview */}
      {step === 1 && (
        <Card className="space-y-4 p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">1. Trip Overview & Window</CardTitle>
            <CardDescription className="text-xs">
              Provide the essential journey details, dates, and budget target
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trip Name *
              </label>
              <Input
                placeholder="e.g. West Coast Coastal Drive & Island Expedition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Summary / Travel Goals
              </label>
              <Input
                placeholder="Key highlights, themes, and goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  icon={<Calendar className="h-4 w-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Budget ($ USD)
                </label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  icon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cover Image URL
              </label>
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continue to Stops
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Multi-Stop Sequencing */}
      {step === 2 && (
        <Card className="space-y-4 p-6">
          <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">2. Multi-City Destination Stops</CardTitle>
              <CardDescription className="text-xs">
                Select cities in order of arrival and assign stay durations
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addStop}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Destination Stop
            </Button>
          </CardHeader>

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Destination City
                    </label>
                    <select
                      value={stop.cityId}
                      onChange={(e) => updateStopCity(index, e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}, {city.country} (${city.averageDailyCost}/day)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Stay Duration (Days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={stop.stayDurationDays}
                      onChange={(e) => {
                        const updated = [...stops];
                        updated[index].stayDurationDays = Math.max(1, Number(e.target.value));
                        setStops(updated);
                      }}
                      icon={<Clock className="h-3.5 w-3.5" />}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeStop(index)}
                  disabled={stops.length <= 1}
                  className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
            <span>Total Stops: {stops.length} cities</span>
            <span>Total Calculated Days: {totalStopDays} days</span>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setStep(3)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Review Plan
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Review & Generate */}
      {step === 3 && (
        <Card className="space-y-6 p-6">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base">3. Review & Initialize Itinerary</CardTitle>
            <CardDescription className="text-xs">
              Confirm your itinerary configuration to generate day schedules
            </CardDescription>
          </CardHeader>

          <div className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block mb-0.5">Trip Title:</span>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {title}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Duration & Budget:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {totalStopDays} Days • ${budget} USD
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                Stop Sequence & Itinerary Hierarchy
              </h4>
              <div className="space-y-2">
                {stops.map((stop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-6 w-6 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {stop.cityName}, {stop.country}
                      </span>
                    </div>
                    <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {stop.stayDurationDays} Days of Activities
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Generate Itinerary & Open Builder
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
