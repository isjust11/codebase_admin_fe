'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, Trash } from 'lucide-react';
import { getRoles, deleteRole, createRole, updateRole, findbyCode } from '@/services/auth-api';
import { Checkbox } from '@radix-ui/react-checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { Action } from '@/types/actions';
import { DataTable } from '@/components/DataTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { Modal } from '@/components/ui/modal';
// import { RoleForm } from './components/role-form';
import { useModal } from '@/hooks/useModal';
import Badge from '@/components/ui/badge/Badge';
import { Role } from '@/types/role';
import { useTranslations } from 'next-intl';
import { AsyncWrapper } from '@/components/common/AsyncWrapper';

export default function RolesPage() {
  const t = useTranslations('RolesPage');
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetchRoles = async () => {
    try {
      const reponse = await getRoles({ page: pageIndex + 1, size: pageSize, search });
      setRoles(reponse.data);
      setPageCount(reponse.totalPages)
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách vai trò: ' + error.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [pageIndex, pageSize, search]);


  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;
    try {
      await deleteRole(id);
      toast.success('Xóa vai trò thành công');
      fetchRoles();
    } catch (error: any) {
      toast.error('Lỗi khi xóa vai trò: ' + error.message);
    }
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const columns: ColumnDef<Role>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên vai trò
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: t("description"),
    },
    {
      accessorKey: "code",
      header: "Mã vai trò",
      cell: ({ row }) => {
        const code = row.getValue("code") as string
        return (
          <div className="text-sm text-gray-500">
            {code}
          </div>
        )
      }
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge variant="light" color={status === true ? 'success' : 'error'} >
            {status == true ? 'Hoạt động' : 'Ngừng hoạt động'}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: 'Thao tác',
      cell: ({ row }) => {
        const role = row.original
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
                  onClick={() => router.push(`/manager/admin/roles/${role.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                  onClick={() => router.push(`/manager/admin/roles/update/${role.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(role.id)}>
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
        // setSelectedRole(null)
        // openModal();
        router.push('/manager/admin/roles/create')
      },
      title: "Thêm vai trò",
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  return (
    <AsyncWrapper>
      <PageBreadcrumb pageTitle="Danh sách vai trò" />
      <div className="space-y-6">
        <ComponentCard title={t("roleList")} listAction={lstActions}>
          <DataTable
            columns={columns}
            data={roles}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            manualPagination={true}
          />
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[600px] p-5 lg:p-10"
          >
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
              {selectedRole ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}
            </h4>
          </Modal>
        </ComponentCard>
      </div>
    </AsyncWrapper>
  );
} 