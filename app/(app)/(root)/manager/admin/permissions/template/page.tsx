'use client';

import PermissionManager from '../components/permission-manager';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Action } from '@/types/actions';

export default function PermissionTemplatePage() {
  const t = useTranslations('PermissionsPage');
  const actionRef = useRef<{ refresh: () => void }>({ refresh: () => {} });

  const refreshActions: Action[] = [
    {
      icon: <RefreshCcw className="w-4 h-4 mr-2" />,
      onClick: () => {
        actionRef.current?.refresh();
      },
      title: t('refresh'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ];
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Quản lý Phân quyền theo Template" />
      <ComponentCard title="Quản lý Phân quyền theo Template" listAction={refreshActions}>
        <PermissionManager ref={actionRef} />
      </ComponentCard>
    </div>
  );
} 