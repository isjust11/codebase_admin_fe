'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getUserSubscriptionById, updateSubscriptionStatus } from '@/services/user-subscription-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Badge from '@/components/ui/badge/Badge'
import { UserSubscription, SubscriptionStatus } from '@/types/user-subscription'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'
import Select from '@/components/form/Select'

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (b === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function formatDate(val?: string): string {
  if (!val) return '-';
  return new Date(val).toLocaleString('vi-VN');
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
  { value: 'active', label: 'Kích hoạt' },
  { value: 'trial', label: 'Dùng thử' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'payment_failed', label: 'Thanh toán thất bại' },
];

const SubscriptionDetailPage = () => {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('UserSubscriptions')
  const { navigateTo } = useLoading()
  const params = useParams()
  const subId = params.id as string
  const [sub, setSub] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<string>('')

  const fetchSub = async () => {
    try {
      const data = await getUserSubscriptionById(subId)
      setSub(data)
      setNewStatus(data.status)
    } catch (error) {
      console.error('Error loading subscription:', error)
      toast.error(t('errorLoading'))
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => { if (subId) fetchSub() }, [subId])

  const handleStatusUpdate = async () => {
    if (!sub || !newStatus || newStatus === sub.status) return;
    try {
      await updateSubscriptionStatus(String(sub.id), newStatus as SubscriptionStatus);
      toast.success(t('statusUpdated'));
      fetchSub();
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

  if (!sub) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('notFound')}</p>
          <Button onClick={() => navigateTo('/manager/user-subscriptions')} className="mt-4">
            {t('backToList')}
          </Button>
        </div>
      </div>
    )
  }

  const lstAction: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo('/manager/user-subscriptions')),
      title: t('back'),
      className: isPending ? 'opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300',
      variant: 'outline'
    },
  ]

  const plan = sub.plan;
  const user = sub.user;
  const codeColor: Record<string, string> = { basic: 'info', advanced: 'warning', ultra: 'error' };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('detail')}
        items={[
          { title: t('title'), href: '/manager/user-subscriptions' },
          { title: `#${sub.id}`, href: '#' }
        ]}
      />

      <div className="space-y-6">
        {/* User info */}
        <ComponentCard title={t('userInfo')} listAction={lstAction}>
          {user && (
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img src={user.picture} alt="" className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl text-gray-500">
                  {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div className="text-lg font-bold">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                <div className="text-sm text-gray-400">@{user.username}</div>
              </div>
            </div>
          )}
        </ComponentCard>

        {/* Subscription info */}
        <ComponentCard title={t('subscriptionInfo')}>
          <div className="grid grid-cols-2 gap-6 text-sm max-w-2xl">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">{t('plan')}:</span>
                <span className="ml-2">
                  {plan && (
                    <Badge variant="light" color={(codeColor[plan.code] || 'primary') as any}>
                      {plan.code?.toUpperCase()} - {plan.name}
                    </Badge>
                  )}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('status')}:</span>
                <span className="ml-2">
                  <Badge variant="light" color={(statusColorMap[sub.status] || 'primary') as any}>
                    {t(`statuses.${sub.status}`)}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('startedAt')}:</span>
                <span className="ml-2 text-gray-600">{formatDate(sub.startedAt)}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('expiresAt')}:</span>
                <span className={`ml-2 ${sub.expiresAt && new Date(sub.expiresAt) < new Date() ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                  {formatDate(sub.expiresAt)}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-900">{t('currentPeriod')}:</span>
                <span className="ml-2 text-gray-600">{sub.currentPeriodKey || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">ID:</span>
                <span className="ml-2 text-gray-600">{sub.id}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('createdAt')}:</span>
                <span className="ml-2 text-gray-600">{formatDate(sub.createdAt)}</span>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Usage */}
        <ComponentCard title={t('usageInfo')}>
          <div className="grid grid-cols-3 gap-6 max-w-2xl">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{sub.ttsUsedInPeriod}</div>
              <div className="text-xs text-gray-500 mt-1">
                / {plan?.ttsLimitPerPeriod === 0 ? '∞' : plan?.ttsLimitPerPeriod} TTS
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{sub.convertUsedInPeriod}</div>
              <div className="text-xs text-gray-500 mt-1">
                / {plan?.convertLimitPerPeriod === 0 ? '∞' : plan?.convertLimitPerPeriod} Convert
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{formatBytes(sub.storageUsedBytes)}</div>
              <div className="text-xs text-gray-500 mt-1">
                / {plan ? formatBytes(plan.storageLimitBytes) : '-'} Storage
              </div>
            </div>
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
              disabled={!newStatus || newStatus === sub.status}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('updateStatus')}
            </Button>
          </div>
        </ComponentCard>

        {/* Payment info */}
        {sub.payment && (
          <ComponentCard title={t('paymentInfo')}>
            <div className="grid grid-cols-2 gap-4 text-sm max-w-2xl">
              <div>
                <span className="font-semibold text-gray-900">Payment ID:</span>
                <span className="ml-2 text-gray-600">{sub.payment.id}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('amount')}:</span>
                <span className="ml-2 text-green-600 font-bold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sub.payment.amount)}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('paymentStatus')}:</span>
                <span className="ml-2 text-gray-600">{sub.payment.status}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{t('paymentDate')}:</span>
                <span className="ml-2 text-gray-600">{formatDate(sub.payment.createdAt)}</span>
              </div>
            </div>
          </ComponentCard>
        )}
      </div>
    </div>
  )
}

export default SubscriptionDetailPage
