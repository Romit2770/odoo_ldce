import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Plus, Bell, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MAIN_NAV_ITEMS } from '@/constants/navigation';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md transition-transform group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-teal-800 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
              <span className="text-[10px] -mt-1 font-medium text-slate-500 tracking-widest uppercase">
                Travel Planner
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {MAIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 rounded-lg transition-colors dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-slate-900"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigate('/trips/new')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Trip
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-emerald-500/20">
                  <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">
                    GT
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Traveler User</p>
                  <p className="text-xs leading-none text-slate-500">user@globetrotter.io</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <span>Preferences & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/admin')}>
                <Shield className="mr-2 h-4 w-4 text-amber-500" />
                <span>Admin Console</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/login')} className="text-rose-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
