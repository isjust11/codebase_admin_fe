'use client';

import React from 'react';
import { MediaManager } from '@/components/MediaManager';

export default function MediaPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý Media</h1>
      <MediaManager />
    </div>
  );
} 