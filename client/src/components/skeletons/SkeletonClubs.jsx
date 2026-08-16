import React from 'react';

export default function SkeletonClubs() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="w-full h-10 rounded skeleton-box" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800/60 border border-white/10 rounded p-3 space-y-2">
              <div className="w-1/2 h-5 skeleton-box" />
              <div className="w-5/6 h-4 skeleton-box" />
              <div className="w-1/3 h-3 skeleton-box" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="bg-slate-800/60 border border-white/10 rounded p-3 space-y-3">
          <div className="w-1/3 h-5 skeleton-box" />
          <div className="w-full h-10 rounded skeleton-box" />
          <div className="w-full h-24 rounded skeleton-box" />
          <div className="w-full h-10 rounded skeleton-box" />
        </div>
      </div>
    </div>
  );
}
