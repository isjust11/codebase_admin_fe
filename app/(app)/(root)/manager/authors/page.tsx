'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, ImageOff, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'
import { DataTable } from '@/components/DataTable'
import { deleteAuthor, getAuthorsByPage, updateAuthor } from '@/services/author-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Action } from '@/types/actions'
import { Checkbox } from '@/components/ui/checkbox'
import { isImgFormat } from '@/lib/utils'
import Image from 'next/image'
import { Author } from '@/types/author'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
import { useTranslations } from 'next-intl'

const AuthorsPage = () => {
  const router = useRouter()
  const { navigateTo } = useLoading()
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const [errorImage, setErrorImage] = useState(false)
  const columns: ColumnDef<Author>[] = [
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
          aria-label={tUtils('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={tUtils('selectRow')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "portrait",
      header: t('thumbnail'),
      cell: ({ row }) => {
        const author = row.original as any
        const imageUrl = author.portrait
        if (errorImage || !isImgFormat(imageUrl)) {
          return (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">
                <ImageOff className="w-8 h-8" />
              </span>
            </div>
          )
        }
        return (
          imageUrl ? <Image
            width={164}
            height={124}
            src={imageUrl}
            alt="author-portrait"
            className="w-16 h-16 object-cover rounded-md"
            onError={() => setErrorImage(true)}
          /> :
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">
                <ImageOff className="w-8 h-8" />
              </span>
            </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('name')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return (
          <div className='font-bold'>
            {name}
          </div>
        )
      }
    },
    {
      accessorKey: "alias",
      header: t('alias'),
      cell: ({ row }) => {
        const alias = row.getValue("alias") as string;
        return (
          <div className="text-sm text-gray-600">
            {alias || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "era",
      header: t('era'),
      cell: ({ row }) => {
        const era = row.getValue("era") as string;
        return (
          <div className="text-sm text-gray-600">
            {era || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "dynasty",
      header: t('dynasty'),
      cell: ({ row }) => {
        const dynasty = row.getValue("dynasty") as string;
        return (
          <div className="text-sm text-gray-600">
            {dynasty || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "specialty",
      header: t('specialty'),
      cell: ({ row }) => {
        const specialty = row.getValue("specialty") as string;
        return (
          <div className="text-sm text-gray-600">
            {specialty || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "viewCount",
      header: t('viewCount'),
      cell: ({ row }) => {
        const viewCount = row.getValue("viewCount") as number;
        return (
          <div className="text-sm text-gray-600">
            {viewCount}
          </div>
        )
      },
    },
    {
      accessorKey: "likeCount",
      header: t('likeCount'),
      cell: ({ row }) => {
        const likeCount = row.getValue("likeCount") as number;
        return (
          <div className="text-sm text-gray-600">
            {likeCount}
          </div>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: t('isActive'),
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge className={status ? 'ring-green-400' : 'ring-red-400'} variant="light" color={status ? 'success' : 'error'} >
            {status ? tUtils('active') : tUtils('inactive')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: tUtils('actions'),
      cell: ({ row }) => {
        const author = row.original

        return (
          <div className="p-2 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tUtils('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs '>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/manager/authors/${author.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  {tUtils('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(author)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {author.isActive ? tUtils('inactive') : tUtils('active')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-500/20 text-blue-500'
                  onClick={() => navigateTo(`/manager/authors/update/${author.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {tUtils('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-500/50" onClick={() => handleDelete(author)}>
                  <Trash className="mr-2 h-4 w-4" />
                    {tUtils('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
  const [authors, setAuthors] = useState<Author[]>([])
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)
  const [dialogContent, setDialogContent] = useState('')
  const handleDelete = async (author: Author) => {
    setOpenDialog(true);
    setDialogContent('Bạn có chắc chắn muốn xóa tác giả này không?');
    setSelectedAuthor(author);
  }
  const fetchAuthors = async () => {
    try {
      const response = await getAuthorsByPage({ page: pageIndex + 1, size: pageSize, search });
      if (response && response.data) {
        setAuthors(response.data);
        setPageCount(response.totalPages);
      }
    } catch (error) {
      console.error(t('errorLoadAuthors'), error);
      toast.error(t('messages.errorLoadAuthors'));
    }
  }

  useEffect(() => {
    fetchAuthors();
  }, [pageIndex, pageSize, search])

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => {
        navigateTo('/manager/authors/create')
      },
      title: t('addAuthor'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]
  const confirmDelete = async () => {
    try {
      if (!selectedAuthor?.id) {
        toast.error(t('messages.errorDeleteAuthor'))
        return
      }
      await deleteAuthor(String(selectedAuthor.id));
    } catch (error) {
      toast.error(t('messages.errorDeleteAuthor'));
    }
    fetchAuthors();
    setOpenDialog(false)
    toast.success(t('messages.deleteSuccess'));
  }
  const handleChangeStatus = async (author: Author) => {
    await updateAuthor(author.id, { ...author, isActive: !author.isActive });
    fetchAuthors();
    toast.success(t('messages.changeStatusSuccess'));
  }
  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={authors}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          </div>
        </ComponentCard>
        <AlertDialogUtils
          type='warning'
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={confirmDelete}
          title={tUtils('delete')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setOpenDialog(false)}
        />
      </div>

    </div>

  )
}

export default AuthorsPage 