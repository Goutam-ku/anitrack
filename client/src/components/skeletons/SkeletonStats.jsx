import React from 'react';

export default function SkeletonStats() {
  return (
    <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-slate-800/60 border border-white/10 rounded px-3 py-2 space-y-1">
          <div className="w-1/2 h-3 skeleton-box" />
          <div className="w-1/3 h-5 skeleton-box" />
        </div>
      ))}
    </div>
  );
}
