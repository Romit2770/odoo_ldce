import React from 'react';
import { User as UserIcon, Mail, Shield, Calendar, MapPin, Compass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/providers/AuthProvider';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Traveler Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your account information and travel identity
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-20 w-20 ring-2 ring-emerald-500/20">
              <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || 'GT'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user?.name || 'Alex Johnson'}
                </h2>
                <Badge variant="default" className="capitalize text-xs">
                  {user?.role || 'user'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                <Mail className="h-3.5 w-3.5" />
                {user?.email || 'alex.traveler@example.com'}
              </p>
              <p className="text-xs text-slate-400">Member since August 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
