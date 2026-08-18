'use client';

import { Suspense } from 'react';
import TemplateList from './components/TemplateList';

export default function TemplatesManagement() {
  return (
    <Suspense>
      <TemplateList />
    </Suspense>
  );
}
