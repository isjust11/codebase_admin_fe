'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, RefreshCw } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { getPayments, updatePaymentStatus } from '@/services/payment-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Payment, PaymentStatus } from '@/types/payment'
import { useTranslations } from 'next-intl'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
import { DataTable } from '@/components/DataTable'
import Select from '@/components/form/Select'

const statusColorMap: Record<string, string> = {
  pending: 'warning',
  completed: 'success',
  failed: 'error',
  refunded: 'info',
  cancelled: 'error',
};

const methodColorMap: Record<string, string> = {
  stripe: 'primary',
  vnpay: 'info',
  momo: 'error',
  zalopay: 'success',
  cash: 'warning',
};

function formatPrice(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatDate(val?: string): string {
  if (!val) return '-';
  return new Date(val).toLocaleString('vi-VN');
}

const PaymentsPage = () => {
  const { navigateTo } = useLoading()
  const t = useTranslations('Payments')
  const tUtils = useTranslations('Utils')

  const [payments, setPayments] = useState<Payment[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [methodFilter, setMethodFilter] = useState<string>('')

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState('')
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'pending', label: t('statuses.pending') },
    { value: 'completed', label: t('statuses.completed') },
    { value: 'failed', label: t('statuses.failed') },
    { value: 'refunded', label: t('statuses.refunded') },
    { value: 'cancelled', label: t('statuses.cancelled') },
  ];

  const methodOptions = [
    { value: '', label: t('allMethods') },
    { value: 'stripe', label: 'Stripe' },
    { value: 'vnpay', label: 'VNPay' },
    { value: 'momo', label: 'MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
    { value: 'cash', label: t('methods.cash') },
  ];

  const fetchData = async () => {
    try {
      const params: any = { page: pageIndex + 1, size: pageSize };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.paymentMethod = methodFilter;
      const result = await getPayments(params);
      setPayments(result.data);
      setPageCount(result.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error(t('errorLoading'));
    }
  };

  useEffect(() => { fetchData() }, [pageIndex, pageSize, search, statusFilter, methodFilter]);

  const handleStatusChange = (payment: Payment, newStatus: PaymentStatus) => {
    setDialogContent(t('confirmStatusChange', { status: t(`statuses.${newStatus}`) }));
    setPendingAction(() => async () => {
      try {
        await updatePaymentStatus(String(payment.id), newStatus);
        toast.success(t('statusUpdated'));
        fetchData();
      } catch (error) {
        toast.error(t('errorUpdating'));
      }
    });
    setOpenDialog(true);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "transactionId",
      header: t('transactionId'),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-gray-700 max-w-[140px] truncate" title={row.getValue("transactionId") as string}>
          {row.getValue("transactionId") as string}
        </div>
      ),
    },
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
              <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
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
        return (
          <Badge variant="light" color="primary">
            {plan.code?.toUpperCase()} - {plan.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: "amount",
      header: t('amount'),
      cell: ({ row }) => (
        <div className="text-sm font-semibold text-green-600">
          {formatPrice(row.getValue("amount") as number, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: t('method'),
      cell: ({ row }) => {
        const method = row.getValue("paymentMethod") as string;
        return (
          <Badge variant="light" color={(methodColorMap[method] || 'primary') as any}>
            {method?.toUpperCase()}
          </Badge>
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
      accessorKey: "createdAt",
      header: t('createdAt'),
      cell: ({ row }) => (
        <div className="text-xs text-gray-600">
          {formatDate(row.getValue("createdAt") as string)}
        </div>
      ),
    },
    {
      accessorKey: "paidAt",
      header: t('paidAt'),
      cell: ({ row }) => {
        const val = row.getValue("paidAt") as string;
        return val
          ? <div className="text-xs text-green-600">{formatDate(val)}</div>
          : <span className="text-gray-400 text-xs">-</span>;
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const payment = row.original;
        const canRefund = payment.status === 'completed';
        const canCancel = payment.status === 'pending';
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
                  onClick={() => navigateTo(`/manager/payments/${payment.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                {canRefund && (
                  <DropdownMenuItem
                    className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500"
                    onClick={() => handleStatusChange(payment, 'refunded')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                    {t('refund')}
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem
                    className="flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300/20 text-red-500"
                    onClick={() => handleStatusChange(payment, 'cancelled')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4 text-red-500" />
                    {t('cancel')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('title')}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v as string); setPageIndex(0); }}
                placeholder={t('filterByStatus')}
              />
            </div>
            <div className="w-48">
              <Select
                options={methodOptions}
                value={methodFilter}
                onChange={(v) => { setMethodFilter(v as string); setPageIndex(0); }}
                placeholder={t('filterByMethod')}
              />
            </div>
          </div>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={payments}
              pageCount={pageCount}
              onPaginationChange={(page, size) => { setPageIndex(page); setPageSize(size); }}
              onSearchChange={(s) => { setSearch(s); setPageIndex(0); }}
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

export default PaymentsPage
