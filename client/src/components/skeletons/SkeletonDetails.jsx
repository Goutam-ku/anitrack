import React from 'react';

export default function SkeletonDetails() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div>
        <div className="w-full aspect-[3/4] rounded border border-white/10 skeleton-box" />
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className="w-3/4 h-8 skeleton-box" />
        <div className="space-y-2">
          <div className="w-full h-4 skeleton-box" />
          <div className="w-full h-4 skeleton-box" />
          <div className="w-2/3 h-4 skeleton-box" />
        </div>
        <div className="flex gap-2">
          <div className="w-32 h-9 rounded skeleton-box" />
          <div className="w-24 h-9 rounded skeleton-box" />
        </div>
        <div className="w-full aspect-video rounded skeleton-box mt-4" />
        <div className="w-1/3 h-6 skeleton-box mt-4" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded skeleton-box" />
          ))}
        </div>
      </div>
    </div>
  );
}
