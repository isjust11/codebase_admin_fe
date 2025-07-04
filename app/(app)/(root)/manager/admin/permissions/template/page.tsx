'use client';

import PermissionManager from '../components/permission-manager';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { useTranslations } from 'next-intl';

export default function PermissionTemplatePage() {
  const t = useTranslations('PermissionsPage');

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Quản lý Phân quyền theo Template" />
      <ComponentCard title="Quản lý Phân quyền theo Template">
        <PermissionManager />
      </ComponentCard>
    </div>
  );
} 