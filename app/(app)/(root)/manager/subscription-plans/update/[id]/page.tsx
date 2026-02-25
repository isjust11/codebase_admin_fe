'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getSubscriptionPlanById, updateSubscriptionPlan } from '@/services/subscription-plan-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { Save, X } from 'lucide-react'
import { Action } from '@/types/actions'
import { SubscriptionPlan } from '@/types/subscription-plan'
import PlanForm from '../../components/PlanForm'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

const UpdatePlanPage = () => {
  const { navigateTo, back } = useLoading()
  const params = useParams()
  const planId = params.id as string
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const t = useTranslations('SubscriptionPlans')
  const tUtils = useTranslations('Utils')

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setInitialLoading(true)
        const data = await getSubscriptionPlanById(planId)
        setPlan(data)
      } catch (error) {
        console.error('Error loading plan:', error)
        toast.error(t('errorLoading'))
        navigateTo('/manager/subscription-plans')
      } finally {
        setInitialLoading(false)
      }
    }
    if (planId) fetchPlan()
  }, [planId])

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      await updateSubscriptionPlan(planId, formData)
      toast.success(t('updateSuccess'))
      navigateTo('/manager/subscription-plans')
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error(t('errorUpdating'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = () => {
    if (typeof window !== 'undefined' && (window as any).planFormSubmit) {
      (window as any).planFormSubmit()
    }
  }

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: <Save className="h-4 w-4" />,
      onClick: () => handleFormSubmit(),
      title: t('updatePlan'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{t('notFound')}</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <PageBreadcrumb
        pageTitle={t('updatePlan')}
        items={[
          { title: t('title'), href: '/manager/subscription-plans' },
          { title: plan.name, href: `/manager/subscription-plans/update/${planId}` }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={t('planInfo')} listAction={listAction}>
          <PlanForm
            initialData={plan}
            isEditing={true}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default UpdatePlanPage
