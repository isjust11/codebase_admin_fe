'use client';

import React from 'react';
import { MediaManager } from '@/components/MediaManager';

export default function MediaPage() {
  return (
    <div className="container mx-auto">
      <MediaManager multiple={true} />
    </div>
  );
} 