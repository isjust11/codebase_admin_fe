'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, Plus, RefreshCw } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { getUserSubscriptions, updateSubscriptionStatus } from '@/services/user-subscription-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Action } from '@/types/actions'
import { UserSubscription, SubscriptionStatus } from '@/types/user-subscription'
import { useTranslations } from 'next-intl'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
import { DataTable } from '@/components/DataTable'
import Select from '@/components/form/Select'

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (b === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

const statusColorMap: Record<string, string> = {
  active: 'success',
  trial: 'info',
  pending_payment: 'warning',
  expired: 'error',
  cancelled: 'error',
  payment_failed: 'error',
};

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'trial', label: 'Dùng thử' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'payment_failed', label: 'Thanh toán thất bại' },
];

const changeStatusOptions = [
  { value: 'active', label: 'Kích hoạt' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Hủy' },
];

const UserSubscriptionsPage = () => {
  const { navigateTo } = useLoading()
  const t = useTranslations('UserSubscriptions')
  const tUtils = useTranslations('Utils')

  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState('')
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)

  const fetchData = async () => {
    try {
      const params: any = { page: pageIndex + 1, size: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const result = await getUserSubscriptions(params);
      setSubscriptions(result.data);
      setPageCount(result.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error(t('errorLoading'));
    }
  };

  useEffect(() => { fetchData() }, [pageIndex, pageSize, search, statusFilter]);

  const handleStatusChange = (sub: UserSubscription, newStatus: SubscriptionStatus) => {
    setDialogContent(t('confirmStatusChange', { status: newStatus }));
    setPendingAction(() => async () => {
      try {
        await updateSubscriptionStatus(String(sub.id), newStatus);
        toast.success(t('statusUpdated'));
        fetchData();
      } catch (error) {
        toast.error(t('errorUpdating'));
      }
    });
    setOpenDialog(true);
  };

  const columns: ColumnDef<UserSubscription>[] = [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t('user')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-2">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                {user.fullName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <div className="font-medium text-sm">{user.fullName}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "plan",
      header: t('plan'),
      cell: ({ row }) => {
        const plan = row.original.plan;
        if (!plan) return <span className="text-gray-400">-</span>;
        const codeColor: Record<string, string> = { basic: 'info', advanced: 'warning', ultra: 'error' };
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="light" color={(codeColor[plan.code] || 'primary') as any}>
              {plan.code?.toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-600">{plan.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant="light" color={(statusColorMap[status] || 'primary') as any}>
            {t(`statuses.${status}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startedAt",
      header: t('startedAt'),
      cell: ({ row }) => {
        const val = row.getValue("startedAt") as string;
        return val ? (
          <div className="text-sm text-gray-600">
            {new Date(val).toLocaleDateString('vi-VN')}
          </div>
        ) : <span className="text-gray-400">-</span>;
      },
    },
    {
      accessorKey: "expiresAt",
      header: t('expiresAt'),
      cell: ({ row }) => {
        const val = row.getValue("expiresAt") as string;
        if (!val) return <span className="text-gray-400">-</span>;
        const isExpired = new Date(val) < new Date();
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            {new Date(val).toLocaleDateString('vi-VN')}
          </div>
        );
      },
    },
    {
      id: "usage",
      header: t('usage'),
      cell: ({ row }) => {
        const sub = row.original;
        const plan = sub.plan;
        return (
          <div className="text-xs space-y-0.5">
            <div>TTS: {sub.ttsUsedInPeriod}/{plan?.ttsLimitPerPeriod === 0 ? '∞' : plan?.ttsLimitPerPeriod}</div>
            <div>Convert: {sub.convertUsedInPeriod}/{plan?.convertLimitPerPeriod === 0 ? '∞' : plan?.convertLimitPerPeriod}</div>
            <div>Storage: {formatBytes(sub.storageUsedBytes)}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs">
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/manager/user-subscriptions/${sub.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                {changeStatusOptions.map(opt => (
                  opt.value !== sub.status && (
                    <DropdownMenuItem
                      key={opt.value}
                      className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                      onClick={() => handleStatusChange(sub, opt.value as SubscriptionStatus)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                      {opt.label}
                    </DropdownMenuItem>
                  )
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo('/manager/user-subscriptions/assign'),
      title: t('assignPlan'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-56">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as string)}
                placeholder={t('filterByStatus')}
              />
            </div>
          </div>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={subscriptions}
              pageCount={pageCount}
              onPaginationChange={(page, size) => { setPageIndex(page); setPageSize(size); }}
              onSearchChange={setSearch}
              onSizeChange={setPageSize}
              manualPagination={true}
            />
          </div>
        </ComponentCard>
        <AlertDialogUtils
          type="warning"
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={async () => {
            if (pendingAction) await pendingAction();
            setOpenDialog(false);
          }}
          title={t('changeStatus')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setOpenDialog(false)}
        />
      </div>
    </div>
  )
}

export default UserSubscriptionsPage
