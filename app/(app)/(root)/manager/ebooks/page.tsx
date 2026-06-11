'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, BookOpen, Check, CheckCircle2, Clock, HardDrive, ImageOff, MoreHorizontal, Pencil, Plus, Trash, XCircle } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { DataTable } from '@/components/DataTable'
import {
  getBooksByPage,
  deleteBook,
  updateBook,
  getBookStatistics,
  updateBookStatus,
  bulkDeleteBooks,
  bulkUpdateBookStatus,
} from '@/services/book-api'
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
  const { user } = useAuth()
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('author')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-[100px] truncate">
          {(row.getValue("author") as string) || t('noData')}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('category')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('fileSize')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-500 text-center">
          {formatFileSize(row.getValue("fileSize") as number)}
        </div>
      ),
    },
    {
      accessorKey: "createBy",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('uploadedBy')}
          {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
        </Button>
      ),
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
          <Badge variant="light" color={color}
            onClick={() => (row.original.isPublic == true && row.original.status?.code !== 'BOOK_STATUS_APPROVED') ? handleUpdateStatus(row.original, 'BOOK_STATUS_APPROVED') : undefined}
            disabled={(row.original.isPublic == true && row.original.status?.code === 'BOOK_STATUS_APPROVED')}
          >
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
            onClick={() => user?.id === row.original.createById ? handleTogglePublic(row.original) : undefined}
            className={isPublic ? 'ring-green-400' : 'ring-red-400'}
            variant="light"
            color={isPublic ? 'success' : 'error'}
            disabled={user?.id !== row.original.createById}
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
                  disabled={user?.id !== book.createById}
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500 dark:text-white"
                  onClick={() => user?.id === book.createById ? handleTogglePublic(book) : undefined}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {book.isPublic ? t('setPrivate') : t('setPublic')}
                </DropdownMenuItem>
                {book.status?.code !== 'BOOK_STATUS_APPROVED' && (
                  <DropdownMenuItem
                    className="flex flex-start px-4 py-2 cursor-pointer hover:bg-green-300/20 text-green-500"
                    disabled={(book.isPublic == true && book.status?.code === 'BOOK_STATUS_APPROVED')}
                    onClick={() => (book.isPublic == true && book.status?.code === 'BOOK_STATUS_APPROVED') ? handleUpdateStatus(book, 'BOOK_STATUS_APPROVED') : undefined}
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
  const [total, setTotal] = useState(0)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [dialogContent, setDialogContent] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [bulkDialogType, setBulkDialogType] = useState<'delete' | 'approve' | 'reject' | null>(null)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const selectedBookIds = useMemo(
    () => Object.keys(rowSelection).filter((id) => rowSelection[id]),
    [rowSelection],
  )
  const selectedCount = selectedBookIds.length

  const clearSelection = () => setRowSelection({})

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
        setTotal(response.total)
      }
    } catch (error) {
      console.error('Error loading books:', error)
      toast.error(t('errorLoadingBooks'))
    }
  }

  useEffect(() => {
    fetchBooks()
    fetchStats()
    clearSelection()
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

  const handleSizeChange = (size: number) => {
    setPageSize(size)
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

  const openBulkDialog = (type: 'delete' | 'approve' | 'reject') => {
    if (selectedCount === 0) {
      toast.error(t('bulkNoSelection'))
      return
    }
    setBulkDialogType(type)
  }

  const getBulkDialogContent = () => {
    if (bulkDialogType === 'delete') {
      return t('confirmBulkDelete', { count: selectedCount })
    }
    if (bulkDialogType === 'approve') {
      return t('confirmBulkApprove', { count: selectedCount })
    }
    if (bulkDialogType === 'reject') {
      return t('confirmBulkReject', { count: selectedCount })
    }
    return ''
  }

  const confirmBulkAction = async () => {
    if (!bulkDialogType || selectedCount === 0) return
    setIsBulkProcessing(true)
    try {
      let result
      if (bulkDialogType === 'delete') {
        result = await bulkDeleteBooks(selectedBookIds)
      } else if (bulkDialogType === 'approve') {
        result = await bulkUpdateBookStatus(selectedBookIds, 'BOOK_STATUS_APPROVED')
      } else {
        result = await bulkUpdateBookStatus(selectedBookIds, 'BOOK_STATUS_REJECTED')
      }
      if (result.failed > 0) {
        toast.warning(t('bulkPartialSuccess', { success: result.success, failed: result.failed }))
      } else {
        toast.success(t('bulkSuccess', { count: result.success }))
      }
      clearSelection()
      await fetchBooks()
      await fetchStats()
    } catch {
      if (bulkDialogType === 'delete') {
        toast.error(t('errorDeletingBook'))
      } else {
        toast.error(t('errorUpdatingBook'))
      }
    } finally {
      setIsBulkProcessing(false)
      setBulkDialogType(null)
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
          <div className="container mx-auto space-y-3">
            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {t('bulkSelected', { count: selectedCount })}
                </span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    onClick={() => openBulkDialog('approve')}
                    disabled={isBulkProcessing}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    {t('bulkApprove')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    onClick={() => openBulkDialog('reject')}
                    disabled={isBulkProcessing}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    {t('bulkReject')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => openBulkDialog('delete')}
                    disabled={isBulkProcessing}
                  >
                    <Trash className="mr-1 h-4 w-4" />
                    {t('bulkDelete')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    disabled={isBulkProcessing}
                  >
                    {t('bulkClearSelection')}
                  </Button>
                </div>
              </div>
            )}
            <DataTable
              columns={columns}
              data={books}
              total={total}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              onSizeChange={handleSizeChange}
              manualPagination={true}
              getRowId={(row) => String(row.id)}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              stickyHeader
              maxHeight="65vh"
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
        <AlertDialogUtils
          type={bulkDialogType === 'delete' ? 'warning' : 'info'}
          isOpen={bulkDialogType !== null}
          onOpenChange={(open) => !open && setBulkDialogType(null)}
          onConfirm={confirmBulkAction}
          title={
            bulkDialogType === 'delete'
              ? t('bulkDeleteTitle')
              : bulkDialogType === 'approve'
                ? t('bulkApproveTitle')
                : t('bulkRejectTitle')
          }
          content={getBulkDialogContent()}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setBulkDialogType(null)}
        />
      </div>
    </div>
  )
}

export default EbooksPage
