'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, ImageOff, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/DataTable'
import { deleteHerbal, getAllHerbals, updateHerbal } from '@/services/herbal-api'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import Badge from '@/components/ui/badge/Badge'
import { Action } from '@/types/actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Category } from '@/types/category'
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils'
import Image from 'next/image'
import { Herbal } from '@/types/herbal'
import { useTranslations } from 'next-intl'
import { AlertDialogUtils } from '@/components/AlertDialogUtils'
const HerbalsPage = () => {
  const router = useRouter()
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const columns: ColumnDef<Herbal>[] = [
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
      accessorKey: "thumbnail",
      header: t('image'),
      cell: ({ row }) => {
        const thumbnail: any = mergeImageUrl(row.getValue("thumbnail") as string)
        // check link image invalid
        const isImageInvalid = thumbnail.split('.').pop() !== 'jpg' && thumbnail.split('.').pop() !== 'png' && thumbnail.split('.').pop() !== 'jpeg' && thumbnail.split('.').pop() !== 'webp'
        if (!thumbnail || isImageInvalid) {
          return (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">
                <ImageOff className="w-8 h-8" />
              </span>
            </div>
          )
        }
        
        return (
          <Image
            width={164}
            height={124}
            src={thumbnail}
            alt="herbal-thumbnail"
            className="w-16 h-16 object-cover rounded-md"
            onLoad={() => {
              console.log('image loaded')
              setImageError(false)
            }}
            onInvalid={() => {
              console.log('image invalid')
              setImageError(true)
            }}
            onError={() => {
              console.log('image error')
              setImageError(true)
            }}
          />
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('herbals')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className='font-bold'>
            {title}
          </div>
        )
      }
    },
    {
      accessorKey: "scientificName",
      header: t('scientificName'),
      cell: ({ row }) => {
        const scientificName = row.getValue("scientificName") as string;
        return (
          <div className="text-sm text-gray-600 italic">
            {scientificName || t('noData')}
          </div>
        )
      },
    },
    {
      accessorKey: "family",
      header: t('family'),
      cell: ({ row }) => {
        const family = row.getValue("family") as string;
        return (
          <div className="text-sm text-gray-600">
            {family || t('noData')}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: t('category'),
      cell: ({ row }) => {
        const category = row.getValue("category") as Category
        return (
          <div className="flex flex-center">
            <div className="mr-2">
              {category?.icon && unicodeToEmoji(category.icon)}
            </div>
            <div className="text-sm text-gray-500">
              {category?.name || t('noData')}
            </div>
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
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge className={status ? 'ring-green-400' : 'ring-red-400'} variant="light" color={status ? 'success' : 'error'} >
            {status ? t('active') : t('inactive')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const herbal = row.original
        
        return (
          <div className="p-2 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs '>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => router.push(`/manager/herbals/${herbal.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(herbal)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                    {herbal.isActive ? tUtils('inactive') : tUtils('active')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500'
                  onClick={() => router.push(`/manager/herbals/update/${herbal.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(herbal)}>
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
  const [herbals, setHerbals] = useState<Herbal[]>([])
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [imageError, setImageError] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedHerbal, setSelectedHerbal] = useState<Herbal | null>(null)
  const [dialogContent, setDialogContent] = useState('')
  const fetchHerbals = async () => {
    try {
      const response = await getAllHerbals({ page: pageIndex + 1, size: pageSize, search });
      if (response && response.data) {
        setHerbals(response.data);
        setPageCount(response.totalPages);
      }
    } catch (error) {
      console.error(t('errorLoadingHerbals'), error);
      toast.error(t('errorLoadingHerbals'));
    }
  }
  
  useEffect(() => {
    fetchHerbals();
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
        router.push('/manager/herbals/create')
      },
      title: t('addHerbal'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  const handleDelete = async (herbal: Herbal) => {
    setOpenDialog(true);
    setDialogContent(t('confirmDeleteHerbal'));
    setSelectedHerbal(herbal);
  } 
  
  const confirmDelete = async () => {
    try {
      await deleteHerbal(selectedHerbal?.id!.toString()!);
    } catch (error) {
      toast.error(t('errorDeletingHerbal'))
    }
    fetchHerbals();
    setOpenDialog(false)
    toast.success(t('herbalDeletedSuccess'))
  }

  const handleChangeStatus = async (herbal: Herbal) => {
    await updateHerbal(herbal.id, { ...herbal, isActive: !herbal.isActive });
    fetchHerbals();
    toast.success(t('success'))
  }
  return (
    <div>
      <PageBreadcrumb pageTitle={t('herbals')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('herbals')} listAction={lstActions}>
          <div className="container mx-auto">
          <DataTable
            columns={columns}
            data={herbals}
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
          title={t('deleteHerbal')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => setOpenDialog(false)}
        />
      </div>

    </div>

  )
}

export default HerbalsPage 