'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, BookOpen, Check, CheckCircle2, Clock, HardDrive, ImageOff, MoreHorizontal, Pencil, Plus, Trash, XCircle } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { DataTable } from '@/components/DataTable'
import { getBooksByPage, deleteBook, updateBook, getBookStatistics, updateBookStatus } from '@/services/book-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Action } from '@/types/actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Category } from '@/types/category'
import { mergeImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { Book } from '@/types/book'
import { useTranslations } from 'next-intl'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
import { useAuth } from '@/contexts/AuthContext'

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const EbooksPage = () => {
  const { navigateTo } = useLoading()
  const t = useTranslations('Ebooks')
  const tUtils = useTranslations('Utils')

  const columns: ColumnDef<Book>[] = [
    {
      id: "select",
      accessorKey: "id",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('selectRow')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "coverImageUrl",
      header: t('coverImage'),
      cell: ({ row }) => {
        const coverUrl = mergeImageUrl(row.getValue("coverImageUrl") as string)
        if (!coverUrl) {
          return (
            <div className="w-12 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <ImageOff className="w-6 h-6 text-gray-400" />
            </div>
          )
        }
        return (
          <Image
            width={48}
            height={64}
            src={coverUrl}
            alt="book-cover"
            className="w-12 h-16 object-cover rounded-md"
          />
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('title')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-bold max-w-[200px] truncate" title={row.getValue('title') as string}>
          {row.getValue('title') as string}
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: t('author'),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-[100px] truncate">
          {(row.getValue("author") as string) || t('noData')}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: t('category'),
      cell: ({ row }) => {
        const category = row.getValue("category") as Category
        return (
          <div className="text-sm text-gray-500">
            {category?.name || t('noData')}
          </div>
        )
      },
    },
    {
      accessorKey: "fileSize",
      header: () => (
        <div className="flex items-center gap-1">
          <HardDrive className="w-4 h-4" />
          <span>{'Dung lượng'}</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 text-center">
          {formatFileSize(row.getValue("fileSize") as number)}
        </div>
      ),
    },
    {
      accessorKey: "createBy",
      header: t('uploadedBy'),
      cell: ({ row }) => {
        const createBy = row.getValue("createBy") as Book['createBy']
        const avatarUrl = createBy?.picture ? mergeImageUrl(createBy.picture) : null
        return (
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-1 ring-gray-200">
                {(createBy?.fullName || createBy?.email || '?')[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
                {createBy?.fullName || t('noData')}
              </span>
              {createBy?.email && (
                <span className="text-xs text-gray-400 leading-tight">{createBy.email}</span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t('uploadedAt') || 'Ngày đăng',
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {formatDate(row.getValue("createdAt") as string)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.original.status
        const statusCode = status?.code
        let color: 'primary' | 'success' | 'error' | 'warning' = 'primary'
        let text = t('noData')

        if (statusCode === 'BOOK_STATUS_PENDING') {
          color = 'warning'
          text = t('pending')
        } else if (statusCode === 'BOOK_STATUS_APPROVED') {
          color = 'success'
          text = t('approved')
        } else if (statusCode === 'BOOK_STATUS_REJECTED') {
          color = 'error'
          text = t('rejected')
        }

        return (
          <Badge variant="light" color={color}>
            {text}
          </Badge>
        )
      },
    },
    {
      accessorKey: "isPublic",
      header: t('isPublic'),
      cell: ({ row }) => {
        const isPublic = row.getValue("isPublic") as boolean
        return (
          <Badge
            className={isPublic ? 'ring-green-400' : 'ring-red-400'}
            variant="light"
            color={isPublic ? 'success' : 'error'}
          >
            {isPublic ? t('public') : t('private')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const book = row.original
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs">
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/manager/ebooks/${book.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500 dark:text-white"
                  onClick={() => handleTogglePublic(book)}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {book.isPublic ? t('setPrivate') : t('setPublic')}
                </DropdownMenuItem>
                {book.status?.code !== 'BOOK_STATUS_APPROVED' && (
                  <DropdownMenuItem
                    className="flex flex-start px-4 py-2 cursor-pointer hover:bg-green-300/20 text-green-500"
                    onClick={() => handleUpdateStatus(book, 'BOOK_STATUS_APPROVED')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {t('approve')}
                  </DropdownMenuItem>
                )}
                {book.status?.code !== 'BOOK_STATUS_REJECTED' && (
                  <DropdownMenuItem
                    className="flex flex-start px-4 py-2 cursor-pointer hover:bg-orange-300/20 text-orange-500"
                    onClick={() => handleUpdateStatus(book, 'BOOK_STATUS_REJECTED')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('reject')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500"
                  onClick={() => navigateTo(`/manager/ebooks/update/${book.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => handleDelete(book)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const [books, setBooks] = useState<Book[]>([])
  const [pageCount, setPageCount] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [dialogContent, setDialogContent] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const { user } = useAuth()
  
  const isOwner = (userId: string) => {
    return user?.id === userId
  }

  const fetchStats = async () => {
    try {
      const data = await getBookStatistics()
      if (data) setStats(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await getBooksByPage({
        page: pageIndex + 1,
        size: pageSize,
        search,
        statusCode: statusFilter === 'ALL' ? undefined : statusFilter
      })
      if (response && response.data) {
        setBooks(response.data)
        setPageCount(response.totalPages)
      }
    } catch (error) {
      console.error('Error loading books:', error)
      toast.error(t('errorLoadingBooks'))
    }
  }

  useEffect(() => {
    fetchBooks()
    fetchStats()
  }, [pageIndex, pageSize, search, statusFilter])

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue)
  }

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo('/manager/ebooks/create'),
      title: t('addBook'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  const handleDelete = (book: Book) => {
    setOpenDialog(true)
    setDialogContent(t('confirmDeleteBook'))
    setSelectedBook(book)
  }

  const confirmDelete = async () => {
    try {
      if (!selectedBook?.id) {
        toast.error(t('errorDeletingBook'))
        return
      }
      await deleteBook(String(selectedBook.id))
      toast.success(t('bookDeletedSuccess'))
    } catch (error) {
      toast.error(t('errorDeletingBook'))
    }
    fetchBooks()
    setOpenDialog(false)
  }

  const handleTogglePublic = async (book: Book) => {
    try {
      await updateBook(String(book.id), { isPublic: !book.isPublic })
      fetchBooks()
      fetchStats()
      toast.success(t('success'))
    } catch (error) {
      toast.error(t('errorUpdatingBook'))
    }
  }

  const handleUpdateStatus = async (book: Book, statusCode: string) => {
    try {
      await updateBookStatus(String(book.id), statusCode)
      fetchBooks()
      fetchStats()
      toast.success(t('success'))
    } catch (error) {
      toast.error(t('errorUpdatingBook'))
    }
  }

  const statCards = [
    {
      filter: 'ALL',
      icon: <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      ringColor: 'ring-blue-400',
      label: t('totalBooks'),
      value: stats.total,
    },
    {
      filter: 'BOOK_STATUS_PENDING',
      icon: <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      ringColor: 'ring-yellow-400',
      label: t('pendingBooks'),
      value: stats.pending,
    },
    {
      filter: 'BOOK_STATUS_APPROVED',
      icon: <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      ringColor: 'ring-green-400',
      label: t('approvedBooks'),
      value: stats.approved,
    },
    {
      filter: 'BOOK_STATUS_REJECTED',
      icon: <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      ringColor: 'ring-red-400',
      label: t('rejectedBooks'),
      value: stats.rejected,
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle={t('ebooks')} items={[]} />
      <div className="space-y-6">
        {/* Statistics Header - clickable to filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const isActive = statusFilter === card.filter
            return (
              <button
                key={card.filter}
                onClick={() => { setStatusFilter(card.filter); setPageIndex(0) }}
                className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border transition-all duration-200 flex items-center space-x-4 text-left w-full
                  ${isActive
                    ? `border-transparent ring-2 ${card.ringColor} scale-[1.02]`
                    : 'border-gray-100 dark:border-gray-700 hover:ring-1 hover:ring-gray-300 hover:scale-[1.01]'
                  }`}
              >
                <div className={`p-3 ${card.iconBg} rounded-lg flex-shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { filter: 'ALL', label: 'Tất cả', active: 'bg-blue-500 text-white', inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
            { filter: 'BOOK_STATUS_PENDING', label: t('pending'), active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700' },
            { filter: 'BOOK_STATUS_APPROVED', label: t('approved'), active: 'bg-green-500 text-white', inactive: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700' },
            { filter: 'BOOK_STATUS_REJECTED', label: t('rejected'), active: 'bg-red-500 text-white', inactive: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700' },
          ].map((tab) => (
            <button
              key={tab.filter}
              onClick={() => { setStatusFilter(tab.filter); setPageIndex(0) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${statusFilter === tab.filter ? tab.active : tab.inactive
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ComponentCard title={t('ebooks')} listAction={lstActions}>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={books}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          </div>
        </ComponentCard>
        <AlertDialogUtils
          type="warning"
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={confirmDelete}
          title={t('deleteBook')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setOpenDialog(false)}
        />
      </div>
    </div>
  )
}

export default EbooksPage
