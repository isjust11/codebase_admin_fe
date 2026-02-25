'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, ImageOff, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useLoading } from '@/contexts/LoadingContext'
import { DataTable } from '@/components/DataTable'
import { getBooksByPage, deleteBook, updateBook } from '@/services/book-api'
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
        <div className="text-sm text-gray-600">
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
      accessorKey: "language",
      header: t('language'),
      cell: ({ row }) => {
        const lang = row.getValue("language") as string
        return (
          <Badge variant="light" color="primary">
            {lang?.toUpperCase() || 'VI'}
          </Badge>
        )
      },
    },
    {
      accessorKey: "totalPages",
      header: t('totalPages'),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 text-center">
          {(row.getValue("totalPages") as number) || '-'}
        </div>
      ),
    },
    {
      accessorKey: "createBy",
      header: t('uploadedBy'),
      cell: ({ row }) => {
        const createBy = row.getValue("createBy") as Book['createBy']
        return (
          <div className="text-sm text-gray-600">
            {createBy?.fullName || t('noData')}
          </div>
        )
      },
    },
    {
      accessorKey: "isPublic",
      header: t('status'),
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
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [dialogContent, setDialogContent] = useState('')

  const fetchBooks = async () => {
    try {
      const response = await getBooksByPage({ page: pageIndex + 1, size: pageSize, search })
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
  }, [pageIndex, pageSize, search])

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
      toast.success(t('success'))
    } catch (error) {
      toast.error(t('errorUpdatingBook'))
    }
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('ebooks')} items={[]} />
      <div className="space-y-6">
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
