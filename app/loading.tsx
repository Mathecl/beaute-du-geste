import React from 'react';
import { SkeletonCard } from '@/ui/SkeletonCard';
export default function Loading() {
  return (
    <div style={{ padding: '1.75rem' }}>
      <div className="grid grid-cols-3 gap-6">
        <SkeletonCard />
      </div>
    </div>
  );
}
