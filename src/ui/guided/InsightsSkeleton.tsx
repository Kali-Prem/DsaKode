import React from 'react';
import { Skeleton } from '../components/Skeleton';

export const InsightsSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {/* Complexity Meter Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-44" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <Skeleton variant="rect" className="h-10 w-full" />
        <Skeleton variant="rect" className="h-20 w-full" />
      </div>

      {/* Constraints Table Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="h-4 w-36" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
        <Skeleton variant="rect" className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton variant="rect" className="h-12 w-full" />
          <Skeleton variant="rect" className="h-12 w-full" />
        </div>
      </div>

      {/* Keyword Chips Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-2.5">
        <Skeleton variant="text" className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton variant="rect" className="h-7 w-28 rounded-full" />
          <Skeleton variant="rect" className="h-7 w-32 rounded-full" />
          <Skeleton variant="rect" className="h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Matrix Skeleton */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] space-y-2.5">
        <Skeleton variant="text" className="h-4 w-40" />
        <Skeleton variant="rect" className="h-32 w-full" />
      </div>
    </div>
  );
};
