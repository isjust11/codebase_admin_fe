'use client';

import { Suspense } from 'react';
import TemplateList from '../components/TemplateList';

export default function MyTemplatesPage() {
  return (
    <Suspense>
      <TemplateList mine />
    </Suspense>
  );
}
