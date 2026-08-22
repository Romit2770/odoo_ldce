import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  className,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <Loader2 className={cn('animate-spin text-emerald-600 dark:text-emerald-400', sizeClasses[size])} />
      {message && (
        <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          {message}
        </p>
      )}
    </div>
  );
};
