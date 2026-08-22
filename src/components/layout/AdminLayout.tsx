import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">GlobeTrotter Admin</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                System Console
              </span>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
