import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
};
