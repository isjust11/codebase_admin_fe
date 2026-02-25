'use client'
import React, { useState } from 'react'
import { createBook } from '@/services/book-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, X, Plus } from 'lucide-react'
import { Action } from '@/types/actions'
import BookForm from '../components/BookForm'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

const CreateBookPage = () => {
  const { navigateTo, back } = useLoading()
  const t = useTranslations('Ebooks')
  const tUtils = useTranslations('Utils')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      await createBook(formData)
      toast.success(t('bookCreatedSuccess'))
      navigateTo('/manager/ebooks')
    } catch (error) {
      console.error('Error creating book:', error)
      toast.error(t('errorCreatingBook'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = () => {
    if (typeof window !== 'undefined' && (window as any).bookFormSubmit) {
      (window as any).bookFormSubmit()
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
      title: t('addBook'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ]

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('addBook')}
        items={[
          { title: t('ebooks'), href: '/manager/ebooks' },
          { title: tUtils('create'), href: '/manager/ebooks/create' }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title={t('bookInfo')} listAction={listAction}>
          <BookForm
            isEditing={false}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateBookPage
