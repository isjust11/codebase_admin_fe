'use client';

import { useEffect, useState } from 'react';
import { userApi, User } from '@/services/user-api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, Trash, Lock, Unlock } from 'lucide-react';
import { Checkbox } from '@radix-ui/react-checkbox';
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Action } from '@/types/actions';
import { DataTable } from '@/components/DataTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import { MoreDotIcon } from '@/public/icons';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export default function UsersPage() {
  const t = useTranslations('UsersPage');
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetchUsers = async (page: number, size: number, search: string) => {
    try {
      const response = await userApi.getByPage({ page: page + 1, size, search });
      setUsers(response.data);
      setPageCount(response.total);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách tài khoản');
    }
  };


  useEffect(() => {
    fetchUsers(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await userApi.delete(id);
      toast.success('Xóa người dùng thành công');
      fetchUsers(pageIndex, pageSize, search);
    } catch (_error) {
      toast.error('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const handleBlock = async (id: number, isBlocked: boolean) => {
    try {
      if (isBlocked) {
        await userApi.unblock(id);
        toast.success('Mở khóa tài khoản thành công');
      } else {
        await userApi.block(id);
        toast.success('Khóa tài khoản thành công');
      }
      fetchUsers(pageIndex, pageSize, search);
    } catch (_error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "picture",
      header: t('avatar'),
      cell: ({ row }) => {
        const picture = row.getValue("picture") as string;
        return (
          <div className="flex items-center">
            {picture ? (
              <img src={picture} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500">N/A</span>
              </div>
            )}
          </div>
        )
      }
    },

    {
      accessorKey: "username",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên đăng nhập
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "fullName",
      header: "Họ tên",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "roles",
      header: "Quyền",
      cell: ({ row }) => {
        const roles = row.original.roles;
        const isAdmin = row.original.isAdmin;
        return (
          <div className="text-sm">
            {roles?.map(role => role.name).join(', ') || 'Không có quyền'}
            {isAdmin && ' (Quản trị viên)'}
          </div>
        )
      }
    },
    {
      accessorKey: "isBlocked",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isBlocked = row.getValue("isBlocked") as boolean;
        return (
          <Badge variant="light" color={!isBlocked ? 'success' : 'error'}>
            {!isBlocked ? 'Hoạt động' : 'Đã khóa'}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Lần đăng nhập cuối",
      cell: ({ row }) => {
        const date = row.getValue("lastLogin") as Date;
        return (
          <div className="text-sm">
            {Intl.DateTimeFormat('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(date))}
          </div>
        )
      }
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="p-2">
            <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 " />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='shadow-sm rounded-sm bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => router.push(`/manager/admin/users/${user.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                  onClick={() => router.push(`/manager/admin/users/update/${user.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleBlock(user.id, user.isBlocked)}
                >
                  {user.isBlocked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Mở khóa
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Khóa
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleDelete(user.id)}>
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ];

  const lstActions: Action[] = [
    // {
    //   icon: <Plus className="w-4 h-4 mr-2" />,
    //   onClick: () => {
    //     router.push('/manager/admin/users/create')
    //   },
    //   title: "Thêm người dùng",
    //   className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    // },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Danh sách người dùng" />
      <div className="space-y-6">
        <ComponentCard title="Danh sách người dùng" listAction={lstActions}>
          <DataTable
            columns={columns}
            data={users}
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