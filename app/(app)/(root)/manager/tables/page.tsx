'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ImageOff, BadgeInfo, QrCode } from 'lucide-react';
import { deleteTable, getTables } from '@/services/table-api';
import { Table, Table as TableType } from '@/types/table';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image'
import { Category } from '@/types/category';
import { Action } from '@/types/actions';

export default function TablesManagement() {
  
  const [tables, setTables] = useState<TableType[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const router = useRouter();

  const fetchTables = async (page: number, size: number, search: string) => {
    try {
      const response = await getTables({ page: page + 1, size, search });
      setTables(response.data);
      setPageCount(response.total);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách bàn');
    }
  };

  useEffect(() => {
    fetchTables(pageIndex, pageSize,search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch=(searchValue: string)=>{
    setSearch(searchValue);
  }

  const handleDelete = async (tableId: number) => {
    try {
      await deleteTable(tableId);
      setTables(tables.filter(table => table.id !== tableId));
      fetchTables(pageIndex, pageSize,search);
      toast.success('Bàn đã được xóa thành công');
    } catch (_error) {
      toast.error('Có lỗi xảy ra khi xóa bàn');
    }
  };

  const columns: ColumnDef<Table>[] = [
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
          aria-label="Chọn tất cả"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
     {
          accessorKey: "imageUrl",
          header: "Hình ảnh",
          cell: ({ row }) => {
            const imageUrl = mergeImageUrl(row.getValue("imageUrl") as string)
            return (
              imageUrl ? 
              <Image width={164}
                height={124}
                src={imageUrl}
                alt="food-item"
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên bàn
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "capacity",
      header:"Số người",
    },
    {
      accessorKey: "description",
      header:"Mô tả",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="text-sm text-gray-500">
            <span dangerouslySetInnerHTML={{ __html: description || 'Không có mô tả' }}></span>
          </div>
        )
      }
    },
    {
      accessorKey: "tableStatus",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("tableStatus") as Category
        return (
          <div className={`capitalize`}>
            {status?.name??'Không có'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const table = row.original
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
                    onClick={() => router.push(`/manager/tables/${table.id}`)}>
                    <BadgeInfo className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                    onClick={() => router.push(`/manager/tables/update/${table.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(table.id)}>
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
   const lstActions: Action[] = [
      {
        icon: <Plus className="w-4 h-4 mr-2" />,
        onClick: () => {
          router.push('/manager/tables/create')
        },
        title: "Thêm bàn mới",
        className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      },
      {
        icon: <QrCode className="w-4 h-4 mr-2" />,
        onClick: () => {
          router.push('/manager/tables/qrcodes')
        },
        title: " QR Codes",
        className: "bg-yellow-400 hover:bg-yellow-500 dark:hover:bg-red-800 rounded-md transition-colors text-red-500",
      },
    ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách bàn" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách bàn" listAction={lstActions}>
          <DataTable 
            columns={columns} 
            data={tables}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            manualPagination={true}
          />
        </ComponentCard>
      </div>
    </div>
  );
} 