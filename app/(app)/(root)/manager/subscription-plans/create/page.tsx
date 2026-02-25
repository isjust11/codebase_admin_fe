'use client'
import React, { useState } from 'react'
import { createSubscriptionPlan } from '@/services/subscription-plan-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { X, Plus } from 'lucide-react'
import { Action } from '@/types/actions'
import PlanForm from '../components/PlanForm'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

const CreatePlanPage = () => {
  const { navigateTo, back } = useLoading()
  const t = useTranslations('SubscriptionPlans')
  const tUtils = useTranslations('Utils')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      await createSubscriptionPlan(formData)
      toast.success(t('createSuccess'))
      navigateTo('/manager/subscription-plans')
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error(t('createError'))
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
      icon: <Plus className="h-4 w-4" />,
      onClick: () => handleFormSubmit(),
      title: t('addPlan'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ]

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('addPlan')}
        items={[
          { title: t('title'), href: '/manager/subscription-plans' },
          { title: tUtils('create'), href: '/manager/subscription-plans/create' }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={t('planInfo')} listAction={listAction}>
          <PlanForm isEditing={false} onSubmit={handleSubmit} loading={loading} />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreatePlanPage
