'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getBookById, updateBook } from '@/services/book-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { Save, X } from 'lucide-react'
import { Action } from '@/types/actions'
import { Book } from '@/types/book'
import BookForm from '../../components/BookForm'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

const UpdateBookPage = () => {
  const { navigateTo, back } = useLoading()
  const params = useParams()
  const bookId = params.id as string
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const t = useTranslations('Ebooks')
  const tUtils = useTranslations('Utils')

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setInitialLoading(true)
        const data = await getBookById(bookId)
        setBook(data)
      } catch (error) {
        console.error('Error loading book:', error)
        toast.error(t('errorLoadingBook'))
        navigateTo('/manager/ebooks')
      } finally {
        setInitialLoading(false)
      }
    }
    if (bookId) fetchBook()
  }, [bookId])

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    try {
      await updateBook(bookId, formData)
      toast.success(t('bookUpdatedSuccess'))
      navigateTo('/manager/ebooks')
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error(t('errorUpdatingBook'))
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
      icon: <Save className="h-4 w-4" />,
      onClick: () => handleFormSubmit(),
      title: t('updateBook'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{t('bookNotFound')}</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <PageBreadcrumb
        pageTitle={t('updateBook')}
        items={[
          { title: t('ebooks'), href: '/manager/ebooks' },
          { title: book.title, href: `/manager/ebooks/update/${bookId}` }
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('bookInfo')} listAction={listAction}>
          <BookForm
            initialData={book}
            isEditing={true}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default UpdateBookPage
