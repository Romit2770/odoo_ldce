import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, PlusCircle, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNavigation: React.FC = () => {
  const items = [
    { title: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Trips', href: '/trips', icon: Compass },
    { title: 'New', href: '/trips/new', icon: PlusCircle, isPrimary: true },
    { title: 'Discover', href: '/discover', icon: Globe },
    { title: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.isPrimary) {
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                {item.title}
              </span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
