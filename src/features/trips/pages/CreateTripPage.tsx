import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, DollarSign, MapPin, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-10');
  const [budget, setBudget] = useState('2000');

  // Multi-stop destination sequence
  const [stops, setStops] = useState([
    { id: 'stop_1', cityName: 'Mumbai', country: 'India', stayDurationDays: 4 },
    { id: 'stop_2', cityName: 'Goa', country: 'India', stayDurationDays: 6 },
  ]);

  const addStop = () => {
    setStops([
      ...stops,
      {
        id: `stop_${Date.now()}`,
        cityName: '',
        country: '',
        stayDurationDays: 3,
      },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 1) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    // In full implementation, save via tripsApi & tripStopsApi
    navigate('/trips/trip_1/itinerary');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trips')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Multi-City Trip
          </h1>
          <p className="text-xs text-slate-500">
            Define your journey basics, multi-destination stops, and travel window
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Basic Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Trip Overview</CardTitle>
            <CardDescription className="text-xs">
              Give your adventure a descriptive name and duration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Trip Title
              </label>
              <Input
                placeholder="e.g. Scenic Coastal Drive & Heritage Exploration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Short Description
              </label>
              <Input
                placeholder="Key highlights and travel goals for this journey..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  icon={<Calendar className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  icon={<Calendar className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Budget ($ USD)
                </label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  icon={<DollarSign className="h-4 w-4" />}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Stop Itinerary Cities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">2. Multi-City Stops</CardTitle>
              <CardDescription className="text-xs">
                Add each city or destination in your journey order
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
              Add Stop
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="City (e.g. Mumbai)"
                    value={stop.cityName}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[index].cityName = e.target.value;
                      setStops(updated);
                    }}
                    required
                  />
                  <Input
                    placeholder="Country (e.g. India)"
                    value={stop.country}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[index].country = e.target.value;
                      setStops(updated);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Days stay"
                    value={stop.stayDurationDays}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[index].stayDurationDays = Number(e.target.value);
                      setStops(updated);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 1}
                  className="text-slate-400 hover:text-rose-500 disabled:opacity-30 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/trips')}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Create Trip & Build Itinerary
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
