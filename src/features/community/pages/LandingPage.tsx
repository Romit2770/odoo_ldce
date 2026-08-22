import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              GlobeTrotter
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-sm">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Empowering Personalized Travel Planning
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Plan Multi-City Trips with{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Precision & Ease
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Organize multi-city stops, structure day-by-day activities, balance real-time category budgets, and share interactive travel itineraries.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-600/25"
              onClick={() => navigate('/register')}
            >
              Start Planning Free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/discover')}
              className="px-6"
            >
              <Globe2 className="h-4 w-4 mr-2 text-emerald-600" />
              Discover Itineraries
            </Button>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-12 px-6 max-w-6xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Multi-City Hierarchy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Clean structure connecting Trip stops, daily schedule blocks, and curated activities.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Day-by-Day Timeline</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assign calendar dates, optimize times, and visualize itinerary timelines effortlessly.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Budget Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track transport, stays, food, and activities with automatic daily cost calculations.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                <Globe2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Community Sharing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Publish trips publicly with read-only share links or let others clone itineraries.
              </p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              GlobeTrotter Travel Platform
            </span>
          </div>
          <p>© 2026 GlobeTrotter. Built for the Odoo Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};
