'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getSubscriptionPlanById } from '@/services/subscription-plan-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit } from 'lucide-react'
import Badge from '@/components/ui/badge/Badge'
import { SubscriptionPlan } from '@/types/subscription-plan'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === 'string' ? Number(bytes) : bytes;
  if (b === 0) return 'Không giới hạn';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function formatPrice(price?: number): string {
  if (price == null || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

const PlanDetailPage = () => {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('SubscriptionPlans')
  const { navigateTo } = useLoading()
  const params = useParams()
  const planId = params.id as string
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await getSubscriptionPlanById(planId)
        setPlan(data)
      } catch (error) {
        console.error('Error loading plan:', error)
        toast.error(t('errorLoading'))
      } finally {
        setLoading(false)
      }
    }
    if (planId) fetchPlan()
  }, [planId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('notFound')}</p>
          <Button onClick={() => navigateTo('/manager/subscription-plans')} className="mt-4">
            {t('backToList')}
          </Button>
        </div>
      </div>
    )
  }

  const lstAction: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo('/manager/subscription-plans')),
      title: t('back'),
      className: isPending ? 'opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300',
      variant: 'outline'
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo(`/manager/subscription-plans/update/${planId}`)),
      title: t('edit'),
      className: isPending ? 'opacity-50' : 'bg-blue-500 hover:bg-blue-600 rounded-md transition-colors text-white',
      variant: 'primary'
    }
  ]

  const colorMap: Record<string, string> = { basic: 'info', advanced: 'warning', ultra: 'error' };

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('detail')}
        items={[
          { title: t('title'), href: '/manager/subscription-plans' },
          { title: plan.name, href: `/manager/subscription-plans/${planId}` }
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('planInfo')} listAction={lstAction}>
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <Badge variant="light" color={(colorMap[plan.code] || 'primary') as any} className="text-lg px-4 py-1">
                {plan.code.toUpperCase()}
              </Badge>
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <Badge className={plan.isActive ? 'ring-green-400' : 'ring-red-400'} variant="light" color={plan.isActive ? 'success' : 'error'}>
                {plan.isActive ? t('active') : t('inactive')}
              </Badge>
            </div>

            {plan.description && (
              <p className="text-gray-600">{plan.description}</p>
            )}

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-900">{t('price')}:</span>
                  <span className="ml-2 text-green-600 font-bold text-lg">{formatPrice(plan.price)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{t('period')}:</span>
                  <span className="ml-2 text-gray-600">{plan.periodType === 'month' ? t('monthly') : t('yearly')}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{t('sortOrder')}:</span>
                  <span className="ml-2 text-gray-600">{plan.sortOrder}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-900">{t('storage')}:</span>
                  <span className="ml-2 text-gray-600">{formatBytes(plan.storageLimitBytes)}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{t('ttsLimit')}:</span>
                  <span className="ml-2 text-gray-600">{plan.ttsLimitPerPeriod === 0 ? 'Không giới hạn' : `${plan.ttsLimitPerPeriod} lần/${plan.periodType === 'month' ? 'tháng' : 'năm'}`}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">{t('convertLimit')}:</span>
                  <span className="ml-2 text-gray-600">{plan.convertLimitPerPeriod === 0 ? 'Không giới hạn' : `${plan.convertLimitPerPeriod} lần/${plan.periodType === 'month' ? 'tháng' : 'năm'}`}</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={t('systemInfo')}>
          <div className="grid grid-cols-2 gap-4 text-sm max-w-2xl">
            <div>
              <span className="font-semibold text-gray-900">ID:</span>
              <span className="ml-2 text-gray-600">{plan.id}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('createdAt')}:</span>
              <span className="ml-2 text-gray-600">{new Date(plan.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('updatedAt')}:</span>
              <span className="ml-2 text-gray-600">{new Date(plan.updatedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default PlanDetailPage
