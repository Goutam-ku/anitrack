import React from 'react';

export default function SkeletonWatchlist() {
  return (
    <div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="w-16 h-8 rounded skeleton-box" />
        ))}
        <div className="ml-auto w-28 h-8 rounded skeleton-box" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-slate-800/60 border border-white/10 rounded overflow-hidden flex flex-col">
            <div className="aspect-[3/4] w-full skeleton-box" />
            <div className="p-2 space-y-2">
              <div className="w-4/5 h-4 skeleton-box" />
              <div className="w-1/2 h-3 skeleton-box" />
              <div className="w-3/5 h-3 skeleton-box" />
              <div className="flex gap-2 pt-1">
                <div className="w-7 h-7 rounded skeleton-box" />
                <div className="w-7 h-7 rounded skeleton-box" />
                <div className="w-10 h-7 rounded skeleton-box" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
