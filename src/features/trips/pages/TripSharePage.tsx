import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Copy, Check, ArrowLeft, Globe, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const TripSharePage: React.FC = () => {
  const { tripId = 'trip_1' } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const shareCode = 'COASTAL-2026-GOA';
  const shareUrl = `${window.location.origin}/shared/${shareCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/trips/${tripId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Share Itinerary
          </h1>
          <p className="text-xs text-slate-500">
            Publish or share your multi-city trip with friends and fellow travelers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibility Settings</CardTitle>
          <CardDescription className="text-xs">
            Control how other travelers can access and clone your trip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-emerald-600" />
              ) : (
                <Lock className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Public Discovery & Copying
                </h4>
                <p className="text-xs text-slate-500">
                  Allow other community members to view and copy this itinerary
                </p>
              </div>
            </div>
            <Button
              variant={isPublic ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? 'Enabled' : 'Private'}
            </Button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Direct Itinerary Link
            </label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={handleCopy} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
