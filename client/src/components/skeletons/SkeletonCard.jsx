import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 dark:bg-slate-800/60 border border-white/10 dark:border-white/10 rounded overflow-hidden flex flex-col">
      <div className="aspect-[3/4] w-full skeleton-box" />
      <div className="p-2 space-y-2">
        <div className="w-5/6 h-4 skeleton-box" />
        <div className="w-1/2 h-3 skeleton-box" />
      </div>
    </div>
  );
}
