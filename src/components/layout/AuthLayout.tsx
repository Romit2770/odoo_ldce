import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md">
            <Compass className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-800 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </Link>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Empowering Personalized Travel Planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 rounded-3xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
