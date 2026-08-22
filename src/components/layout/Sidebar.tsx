import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  Sparkles,
  Globe,
  PlusCircle,
  FolderHeart,
  BarChart3,
  Users,
  Map,
  Building2,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false }) => {
  const userLinks = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'My Trips', href: '/trips', icon: Compass },
    { title: 'New Trip', href: '/trips/new', icon: PlusCircle },
    { title: 'Destinations', href: '/destinations', icon: MapPin },
    { title: 'Activities', href: '/activities', icon: Sparkles },
    { title: 'Discover Shared', href: '/discover', icon: Globe },
  ];

  const adminLinks = [
    { title: 'Overview', href: '/admin', icon: BarChart3 },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Trips', href: '/admin/trips', icon: Map },
    { title: 'Cities', href: '/admin/cities', icon: Building2 },
    { title: 'Activities', href: '/admin/activities', icon: Flame },
    { title: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
      <div className="mb-4 px-3 py-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isAdmin ? 'Administration' : 'Planning'}
        </h3>
      </div>
      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/dashboard' || item.href === '/admin' || item.href === '/trips'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {!isAdmin && (
        <div className="mt-auto pt-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 p-4 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <FolderHeart className="h-5 w-5 text-emerald-200" />
              <span className="text-sm font-bold">Trip Organizer</span>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Organize multi-city stops, schedule days, and balance your budget seamlessly.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
