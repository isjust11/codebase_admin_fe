'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getBookById } from '@/services/book-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit, BookOpen, Globe, Lock } from 'lucide-react'
import { mergeImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Badge from '@/components/ui/badge/Badge'
import { Book } from '@/types/book'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'

const BookDetailPage = () => {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Ebooks')
  const tUtils = useTranslations('Utils')
  const { navigateTo } = useLoading()
  const params = useParams()
  const bookId = params.id as string
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBookById(bookId)
        setBook(response)
      } catch (error) {
        console.error('Error loading book:', error)
        toast.error(t('errorLoadingBook'))
      } finally {
        setLoading(false)
      }
    }
    if (bookId) fetchBook()
  }, [bookId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('bookNotFound')}</p>
          <Button onClick={() => navigateTo('/manager/ebooks')} className="mt-4">
            {t('backToList')}
          </Button>
        </div>
      </div>
    )
  }

  const lstAction: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo('/manager/ebooks')),
      title: t('back'),
      className: isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300',
      variant: 'outline'
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: () => startTransition(() => navigateTo(`/manager/ebooks/update/${bookId}`)),
      title: t('edit'),
      className: isPending ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-800 rounded-md transition-colors text-white',
      variant: 'primary'
    }
  ]

  const coverUrl = book.coverImageUrl ? mergeImageUrl(book.coverImageUrl) : null

  return (
    <div>
      <PageBreadcrumb
        pageTitle={t('detail')}
        items={[
          { title: t('ebooks'), href: '/manager/ebooks' },
          { title: book.title, href: `/manager/ebooks/${bookId}` }
        ]}
      />

      <div className="space-y-6">
        <ComponentCard title={t('bookInfo')} listAction={lstAction}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={book.title}
                  width={300}
                  height={400}
                  className="w-full h-auto max-h-80 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h5 className="text-xl font-bold text-gray-900">{book.title}</h5>
              <p className="text-sm text-gray-600">{t('author')}: <span className="font-medium">{book.author}</span></p>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  className={book.isPublic ? 'ring-green-400' : 'ring-red-400'}
                  variant="light"
                  color={book.isPublic ? 'success' : 'error'}
                >
                  {book.isPublic ? (
                    <><Globe className="w-3 h-3 mr-1" /> {t('public')}</>
                  ) : (
                    <><Lock className="w-3 h-3 mr-1" /> {t('private')}</>
                  )}
                </Badge>
                <Badge variant="light" color="primary">
                  {book.language?.toUpperCase() || 'VI'}
                </Badge>
                {book.category && (
                  <Badge variant="light" color="info">
                    {book.category.name}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {book.isbn && (
                  <div>
                    <span className="font-semibold text-gray-900">ISBN:</span>
                    <span className="ml-2 text-gray-600">{book.isbn}</span>
                  </div>
                )}
                {book.publisher && (
                  <div>
                    <span className="font-semibold text-gray-900">{t('publisher')}:</span>
                    <span className="ml-2 text-gray-600">{book.publisher}</span>
                  </div>
                )}
                {book.totalPages && (
                  <div>
                    <span className="font-semibold text-gray-900">{t('totalPages')}:</span>
                    <span className="ml-2 text-gray-600">{book.totalPages}</span>
                  </div>
                )}
                {book.publishedDate && (
                  <div>
                    <span className="font-semibold text-gray-900">{t('publishedDate')}:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(book.publishedDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {book.createBy && (
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{t('uploadedBy')}:</span>
                  <span className="ml-2 text-gray-600">{book.createBy.fullName}</span>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        {book.description && (
          <ComponentCard title={t('description')}>
            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </div>
          </ComponentCard>
        )}

        <ComponentCard title={t('systemInfo')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-900">{t('createdAt')}:</span>
              <span className="ml-2 text-gray-600">
                {new Date(book.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('updatedAt')}:</span>
              <span className="ml-2 text-gray-600">
                {new Date(book.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">ID:</span>
              <span className="ml-2 text-gray-600">{book.id}</span>
            </div>
            {book.fileUrl && (
              <div>
                <span className="font-semibold text-gray-900">{t('pdfFile')}:</span>
                <a
                  href={mergeImageUrl(book.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  {t('viewFile')}
                </a>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default BookDetailPage
