'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ImageOff, ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, ChartColumn } from 'lucide-react';
import { deleteTable, getTables } from '@/services/table-api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteFoodItem, getAllFoods, getOrders } from '@/services/manager-api';
import { Order } from '@/types/order';
// import { useSocket } from '@/hooks/useSocket';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { unicodeToEmoji } from '@/lib/utils';
import { DataTable } from '@/components/DataTable';
import { Category } from '@/types/category';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Table } from '@/types/table';
import { User } from '@/types/user';

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  // const { subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom } = useSocket();
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [orderSelected, setOrderSelected] = useState<Order[]>([]);
  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  // useEffect(() => {
  //   // Đăng ký lắng nghe các sự kiện
  //   const handleOrderCreated = (data: any) => {
  //     console.log('New order created:', data);
  //     toast.success('Đơn hàng mới đã được tạo', {
  //       description: `Đơn hàng #${data.id} đã được thêm vào hệ thống`,
  //     });
  //     onGetOrders();
  //   };

  //   const handleOrderUpdated = (data: any) => {
  //     console.log('Order updated:', data);
  //     toast.info('Thông tin đơn hàng đã được cập nhật', {
  //       description: `Đơn hàng #${data.id} đã được cập nhật`,
  //     });
  //     onGetOrders();
  //   };
  //   const onGetOrders = async () => {
  //     const data = await getOrders();
  //     setOrders(data);
  //   };

  //   // Chỉ đăng ký sự kiện một lần
  //   subscribeToEvent('newOrder', handleOrderCreated);
  //   subscribeToEvent('orderUpdated', handleOrderUpdated);

  //   // Gọi getOrders lần đầu tiên
  //   onGetOrders();

  //   // Cleanup khi component unmount
  //   return () => {
  //     unsubscribeFromEvent('newOrder', handleOrderCreated);
  //     unsubscribeFromEvent('orderUpdated', handleOrderUpdated);
  //   };
  // }, []); // Bỏ các dependencies không cần thiết
  const onGetOrders = async (page: number, size: number, search: string) => {
    const data = await getOrders();
    setOrders(data);
    setPageCount(Math.ceil(data.length / pageSize));
    console.log('Page count:', Math.ceil(data.length / pageSize));
    console.log('Orders:', data);
  };
  useEffect(() => {

    onGetOrders(pageIndex, pageSize, search);
  }, [])

  
  const columns: ColumnDef<Order>[] = [
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
      accessorKey: "table",
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
      cell: ({ row }) => {
        const table = row.getValue('table') as Table;
        return (
          <div className='font-bold'>
            {table.name}
          </div>
        )
      }
    },
    {
      accessorKey: "account",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Người đặt
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const user = row.getValue('account') as User;
        return (
          <div className='font-bold'>
            {user.fullName}
          </div>
        )
      }
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tổng hóa đơn
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("totalAmount"))
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price)
        return formatted
      },
    },
    {
      accessorKey: "orderStatus",
      header: "Trạng thái",
      cell: ({ row }) => {
        const category = row.getValue("orderStatus") as Category
        return (
          <div className="flex flex-center">
            <div className="mr-2">
              {category?.icon && unicodeToEmoji(category.icon)}
            </div>
            <div className="text-sm text-gray-500">
              {category?.name}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "note",
      header: "Ghi chú"
    },
    {
      accessorKey: "createAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Thời gian tạo
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      // cell: ({ row }) => {
      //   const createAt = parseFloat(row.getValue("createAt"))
      //   const formatted = new Intl.DateTimeFormat('vi-VN', {
      //     day: '2-digit',
      //     month: '2-digit',
      //     year: 'numeric',
      //     hour: '2-digit',
      //     minute: '2-digit'
      //   }).format(createAt)
      //   return formatted
      // },
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const foodItem = row.original
        const handleDelete = async (id: number) => {
          try {
            await deleteFoodItem(id);
            toast.success('Món ăn đã được xóa thành công');
          } catch (_error) {
            toast.error('Có lỗi xảy ra khi xóa món ăn');
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
                  onClick={() => router.push(`/manager/food-items/${foodItem.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                  onClick={() => router.push(`/manager/food-items/update/${foodItem.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(foodItem.id)}>
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
  // load danh sách món ăn lên modal
  const handleDelete = async (tableId: number) => {
    try {
      await deleteTable(tableId);
      setOrders(orders.filter((table: Order) => table.id !== tableId));
      toast.success('Bàn đã được xóa thành công');
    } catch (_error) {
      toast.error('Có lỗi xảy ra khi xóa bàn');
    }
  };
  const lstActions = [
    {
      icon: <ChartColumn size={16} />,
      title: 'Xem báo cáo',
      onClick: () => router.push('/manager/orders/chart'),
    },
    {
      icon: <Pencil size={16} />,
      title: 'Chỉnh sửa',
      onClick: () => router.push('/manager/orders/edit'),
    },
  ];
  return (
    <div>
      <PageBreadcrumb pageTitle='Quản lý đơn hàng' />
      <div className="space-y-6">
        <ComponentCard title="Quản lý đơn hàng" listAction={lstActions}>
          <DataTable
            columns={columns}
            data={orders}
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