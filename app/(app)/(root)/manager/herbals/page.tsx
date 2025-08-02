'use client'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, BadgeInfo, ImageOff, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable } from '@/components/DataTable'
import { deleteHerbal, getAllHerbals } from '@/services/herbal-api'
import { Herbal } from '@/services/herbal-api'
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

const HerbalsPage = () => {
  const router = useRouter()
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
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "thumbnail",
      header: "Hình ảnh",
      cell: ({ row }) => {
        const thumbnail = mergeImageUrl(row.getValue("thumbnail") as string)
        return (
          thumbnail ? <Image
            width={164}
            height={124}
            src={thumbnail}
            alt="herbal-thumbnail"
            className="w-16 h-16 object-cover rounded-md"
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên thảo dược
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
      header: "Tên khoa học",
      cell: ({ row }) => {
        const scientificName = row.getValue("scientificName") as string;
        return (
          <div className="text-sm text-gray-600 italic">
            {scientificName || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "family",
      header: "Họ",
      cell: ({ row }) => {
        const family = row.getValue("family") as string;
        return (
          <div className="text-sm text-gray-600">
            {family || 'Chưa có'}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Danh mục",
      cell: ({ row }) => {
        const category = row.getValue("category") as Category
        return (
          <div className="flex flex-center">
            <div className="mr-2">
              {category?.icon && unicodeToEmoji(category.icon)}
            </div>
            <div className="text-sm text-gray-500">
              {category?.name || 'Chưa phân loại'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "viewCount",
      header: "Lượt xem",
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
      header: "Lượt thích",
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
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge className={status ? 'ring-green-400' : 'ring-red-400'} variant="light" color={status ? 'success' : 'error'} >
            {status ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const herbal = row.original
        const handleDelete = async (id: number) => {
          try {
            await deleteHerbal(id);
            toast.success('Thảo dược đã được xóa thành công');
            // Refresh data
            fetchHerbals();
          } catch (_error) {
            toast.error('Có lỗi xảy ra khi xóa thảo dược');
          }
        }
        return (
          <div className="p-2 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs '>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => router.push(`/manager/herbals/${herbal.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                  onClick={() => router.push(`/manager/herbals/update/${herbal.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(herbal.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
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
 
  const fetchHerbals = async () => {
    try {
      const response = await getAllHerbals({ page: pageIndex + 1, size: pageSize, search });
      if (response && response.data) {
        setHerbals(response.data);
        setPageCount(response.totalPages);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thảo dược:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách thảo dược');
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
      title: "Thêm thảo dược mới",
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]
  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách thảo dược" items={[]} />
      <div className="space-y-6">
        <ComponentCard title="Danh sách thảo dược" listAction={lstActions}>
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
      </div>

    </div>

  )
}

export default HerbalsPage 