'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getPaymentById, updatePaymentStatus } from '@/services/payment-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/badge/Badge'
import { Payment, PaymentStatus } from '@/types/payment'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'
import Select from '@/components/form/Select'

function formatPrice(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

function formatDate(val?: string): string {
  if (!val) return '-';
  return new Date(val).toLocaleString('vi-VN');
}

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

const PaymentDetailPage = () => {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Payments')
  const { navigateTo } = useLoading()
  const params = useParams()
  const paymentId = params.id as string
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<string>('')

  const statusOptions = [
    { value: 'pending', label: t('statuses.pending') },
    { value: 'completed', label: t('statuses.completed') },
    { value: 'failed', label: t('statuses.failed') },
    { value: 'refunded', label: t('statuses.refunded') },
    { value: 'cancelled', label: t('statuses.cancelled') },
  ];

  const fetchPayment = async () => {
    try {
      const data = await getPaymentById(paymentId);
      setPayment(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error loading payment:', error);
      toast.error(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (paymentId) fetchPayment() }, [paymentId]);

  const handleStatusUpdate = async () => {
    if (!payment || !newStatus || newStatus === payment.status) return;
    try {
      await updatePaymentStatus(String(payment.id), newStatus as PaymentStatus);
      toast.success(t('statusUpdated'));
      fetchPayment();
    } catch (error) {
      toast.error(t('errorUpdating'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('notFound')}</p>
          <Button onClick={() => navigateTo('/manager/payments')} className="mt-4">
            {t('backToList')}
          </Button>
        </div>
      </div>
    )
  }

  const lstAction: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo('/manager/payments')),
      title: t('back'),
      className: isPending ? 'opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300',
      variant: 'outline'
    },
  ];

  const user = payment.user;
  const plan = payment.plan;

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('detail')}
        items={[
          { title: t('title'), href: '/manager/payments' },
          { title: payment.transactionId || `#${payment.id}`, href: '#' }
        ]}
      />

      <div className="space-y-6">
        {/* Payment overview */}
        <ComponentCard title={t('paymentInfo')} listAction={lstAction}>
          <div className="grid grid-cols-2 gap-6 text-sm max-w-3xl">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">{t('transactionId')}:</span>
                <span className="ml-2 font-mono text-gray-700">{payment.transactionId || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('amount')}:</span>
                <span className="ml-2 text-green-600 font-bold text-lg">{formatPrice(payment.amount, payment.currency)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('method')}:</span>
                <span className="ml-2">
                  <Badge variant="light" color={(methodColorMap[payment.paymentMethod] || 'primary') as any}>
                    {payment.paymentMethod?.toUpperCase()}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('status')}:</span>
                <span className="ml-2">
                  <Badge variant="light" color={(statusColorMap[payment.status] || 'primary') as any}>
                    {t(`statuses.${payment.status}`)}
                  </Badge>
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">{t('createdAt')}:</span>
                <span className="ml-2 text-gray-600">{formatDate(payment.createdAt)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('paidAt')}:</span>
                <span className={`ml-2 ${payment.paidAt ? 'text-green-600' : 'text-gray-400'}`}>
                  {formatDate(payment.paidAt)}
                </span>
              </div>
              {payment.completedAt && (
                <div>
                  <span className="font-semibold text-gray-900">{t('completedAt')}:</span>
                  <span className="ml-2 text-gray-600">{formatDate(payment.completedAt)}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-900">ID:</span>
                <span className="ml-2 text-gray-600">{payment.id}</span>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* User info */}
        {user && (
          <ComponentCard title={t('userInfo')}>
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-14 h-14 rounded-full" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-500">
                  {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="text-lg font-bold">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-400">@{user.username}</div>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* Plan info */}
        {plan && (
          <ComponentCard title={t('planInfo')}>
            <div className="grid grid-cols-2 gap-4 text-sm max-w-2xl">
              <div>
                <span className="font-semibold text-gray-900">{t('plan')}:</span>
                <span className="ml-2">
                  <Badge variant="light" color="primary">{plan.code?.toUpperCase()}</Badge>
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('planName')}:</span>
                <span className="ml-2 text-gray-600">{plan.name}</span>
              </div>
              {plan.price != null && (
                <div>
                  <span className="font-semibold text-gray-900">{t('planPrice')}:</span>
                  <span className="ml-2 text-green-600">{formatPrice(plan.price)}</span>
                </div>
              )}
            </div>
          </ComponentCard>
        )}

        {/* Gateway details */}
        <ComponentCard title={t('gatewayDetails')}>
          <div className="grid grid-cols-2 gap-4 text-sm max-w-3xl">
            {payment.gatewayTransactionId && (
              <div>
                <span className="font-semibold text-gray-900">{t('gatewayTransactionId')}:</span>
                <span className="ml-2 font-mono text-gray-700">{payment.gatewayTransactionId}</span>
              </div>
            )}
            {payment.paymentIntentId && (
              <div>
                <span className="font-semibold text-gray-900">Payment Intent ID:</span>
                <span className="ml-2 font-mono text-gray-700">{payment.paymentIntentId}</span>
              </div>
            )}
            {payment.ipAddress && (
              <div>
                <span className="font-semibold text-gray-900">IP Address:</span>
                <span className="ml-2 font-mono text-gray-600">{payment.ipAddress}</span>
              </div>
            )}
            {payment.description && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-900">{t('description')}:</span>
                <span className="ml-2 text-gray-600">{payment.description}</span>
              </div>
            )}
            {payment.failureReason && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-900">{t('failureReason')}:</span>
                <span className="ml-2 text-red-600">{payment.failureReason}</span>
              </div>
            )}
            {payment.paymentUrl && (
              <div className="col-span-2">
                <span className="font-semibold text-gray-900">Payment URL:</span>
                <span className="ml-2 text-blue-500 text-xs break-all">{payment.paymentUrl}</span>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Change Status */}
        <ComponentCard title={t('changeStatus')}>
          <div className="flex items-end gap-4 max-w-md">
            <div className="flex-1">
              <Select
                options={statusOptions}
                value={newStatus}
                onChange={(v) => setNewStatus(v as string)}
              />
            </div>
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus || newStatus === payment.status}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('updateStatus')}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default PaymentDetailPage
