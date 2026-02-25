'use client'
import React, { useState, useEffect } from 'react'
import { assignSubscription } from '@/services/user-subscription-api'
import { getSubscriptionPlans } from '@/services/subscription-plan-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { X, Plus } from 'lucide-react'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Select, { SelectOption } from '@/components/form/Select'
import { SubscriptionPlan } from '@/types/subscription-plan'

const statusOptions: SelectOption[] = [
  { value: 'active', label: 'Kích hoạt ngay' },
  { value: 'trial', label: 'Dùng thử (7 ngày)' },
  { value: 'pending_payment', label: 'Chờ thanh toán' },
];

const AssignSubscriptionPage = () => {
  const { navigateTo, back } = useLoading()
  const t = useTranslations('UserSubscriptions')
  const tUtils = useTranslations('Utils')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [planOptions, setPlanOptions] = useState<SelectOption[]>([])

  const [userId, setUserId] = useState('')
  const [planId, setPlanId] = useState('')
  const [status, setStatus] = useState('active')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getSubscriptionPlans(true);
        setPlans(data);
        setPlanOptions(data.map(p => ({
          value: String(p.id),
          label: `${p.code.toUpperCase()} - ${p.name}`,
        })));
      } catch (error) {
        console.error('Error loading plans:', error);
      }
    };
    fetchPlans();
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!userId.trim()) errs.userId = t('validation.userIdRequired');
    if (!planId) errs.planId = t('validation.planRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await assignSubscription({
        userId: Number(userId),
        planId: Number(planId),
        status: status as any,
      });
      toast.success(t('assignSuccess'));
      navigateTo('/manager/user-subscriptions');
    } catch (error) {
      console.error('Error assigning plan:', error);
      toast.error(t('assignError'));
    } finally {
      setLoading(false);
    }
  };

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: <Plus className="h-4 w-4" />,
      onClick: handleSubmit,
      title: t('assignPlan'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading,
    },
  ];

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('assignPlan')}
        items={[
          { title: t('title'), href: '/manager/user-subscriptions' },
          { title: t('assignPlan'), href: '#' },
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={t('assignPlan')} listAction={listAction}>
          <div className="space-y-6 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID <span className="text-red-500">(*)</span></Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={e => { setUserId(e.target.value); setErrors(prev => ({ ...prev, userId: '' })); }}
                placeholder={t('userIdPlaceholder')}
              />
              {errors.userId && <div className="text-red-500 text-sm">{errors.userId}</div>}
            </div>

            <div className="space-y-2">
              <Label>{t('plan')} <span className="text-red-500">(*)</span></Label>
              <Select
                options={planOptions}
                value={planId}
                onChange={(v) => { setPlanId(v as string); setErrors(prev => ({ ...prev, planId: '' })); }}
                placeholder={t('selectPlan')}
              />
              {errors.planId && <div className="text-red-500 text-sm">{errors.planId}</div>}
              {planId && plans.find(p => String(p.id) === planId) && (
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                  {(() => {
                    const p = plans.find(p => String(p.id) === planId)!;
                    const price = p.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price) : 'Miễn phí';
                    return `${p.name} - ${price} / ${p.periodType === 'month' ? 'tháng' : 'năm'}`;
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('status')}</Label>
              <Select
                options={statusOptions}
                value={status}
                onChange={(v) => setStatus(v as string)}
              />
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default AssignSubscriptionPage
