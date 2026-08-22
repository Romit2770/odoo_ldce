import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, Bell, DollarSign, Sparkles, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export const SettingsPage: React.FC = () => {
  const [currency, setCurrency] = useState('USD');
  const [travelStyle, setTravelStyle] = useState('moderate');
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Preferences & Settings
        </h1>
        <p className="text-xs text-slate-500">
          Customize your travel planning currency, style, and alert notifications
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Travel Personalization</CardTitle>
            <CardDescription className="text-xs">
              Tailor trip generation recommendations to your style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Preferred Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'INR (₹)', value: 'INR' },
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'JPY (¥)', value: 'JPY' },
              ]}
            />

            <Select
              label="Default Travel Style"
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              options={[
                { label: 'Budget & Backpacking', value: 'budget' },
                { label: 'Moderate & Balanced', value: 'moderate' },
                { label: 'Luxury & Comfort', value: 'luxury' },
                { label: 'Adventure & Outdoors', value: 'adventure' },
                { label: 'Culture & Heritage', value: 'cultural' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications & Alerts</CardTitle>
            <CardDescription className="text-xs">
              Receive itinerary updates and budget alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Email Notifications
                </h4>
                <p className="text-xs text-slate-500">
                  Receive email digests when your itinerary changes or expenses approach limits
                </p>
              </div>
              <Button
                type="button"
                variant={notifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saved ? <Check className="h-4 w-4 mr-1" /> : null}
            {saved ? 'Preferences Saved' : 'Save Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
};
