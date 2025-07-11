'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, Trash, Shield, ArrowLeftRight } from 'lucide-react';
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
import { useModal } from '@/hooks/useModal';
import Badge from '@/components/ui/badge/Badge';
import { Role } from '@/types/role';
import { useTranslations } from 'next-intl';
import { AsyncWrapper } from '@/components/common/AsyncWrapper';
import RolePermissionManager from './components/RolePermissionManager';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

export default function RolesPage() {
  const t = useTranslations('RolesPage');
  const tUtils = useTranslations('Utils');
  const { hasResourcePermission, hasPermission } = useAuth();
  const hasPermissionToManageRoles = hasResourcePermission('role');
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');


  useEffect(() => {
    if (!hasPermissionToManageRoles) {
      router.push('/');
    }
  }, [hasPermissionToManageRoles]);

  const fetchRoles = async () => {
    try {
      const reponse = await getRoles({ page: pageIndex + 1, size: pageSize, search });
      setRoles(reponse.data);
      setPageCount(reponse.totalPages)
    } catch (error: any) {
      toast.error(t('fetchError') + error.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [pageIndex, pageSize, search]);


  const handleDelete = async (id: string) => {
    setSelectedRole(roles.find(role => role.id === id) || null);
    setDialogContent(t('confirmDelete', { name: selectedRole?.name || '' }));
    setOpenDialog(true);
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleSizeChange = (size: number) => {
    setPageSize(size);
  }

  const handleChangeStatus = async (role: Role) => {
    try {
      await updateRole(role.id, { isActive: !role.isActive });
      toast.success(t('updateSuccess'));
      fetchRoles();
    } catch (error: any) {
      toast.error(t('deleteError') + error.message);
    }
  }

  const confirmDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      toast.success(t('deleteSuccess'));
      setOpenDialog(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(t('deleteError') + error.message);
      setOpenDialog(false);
    }
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
          aria-label={t('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t('selectAll')}
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
            {t('roleName')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "description",
      header: t('description'),
    },
    {
      accessorKey: "code",
      header: t('roleCode'),
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
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean
        return (
          <Badge variant="light" color={status === true ? 'success' : 'error'} >
            {status == true ? t('active') : t('inactive')}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const role = row.original
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
                {hasPermission('ROLE_READ') && (
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                    onClick={() => router.push(`/manager/admin/roles/${role.id}`)}>
                    <BadgeInfo className="mr-2 h-4 w-4" />
                    {t('viewDetail')}
                  </DropdownMenuItem>
                )}
                {hasPermission('ROLE_ASSIGN_PERMISSION') && (
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-slate-500 dark:text-slate-400"
                    onClick={() => router.push(`/manager/admin/roles/rolepermission/${role.id}`)}>
                    <Shield className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-500" />
                    {t('managePermissions')}
                  </DropdownMenuItem>
                )}
                {hasPermission('ROLE_UPDATE') && <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(role)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {role.isActive ? t('inactive') : t('active')}
                </DropdownMenuItem>}
                {hasPermission('ROLE_UPDATE') && (
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-blue-500 dark:text-blue-400'
                    onClick={() => router.push(`/manager/admin/roles/update/${role.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                    {t('edit')}
                  </DropdownMenuItem>
                )}
                {hasPermission('ROLE_DELETE') && (
                  <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 dark:text-red-400" onClick={() => handleDelete(role.id)}>
                    <Trash className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                    {t('delete')}
                  </DropdownMenuItem>
                )}
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
        if (hasPermission('ROLE_CREATE')) {
          router.push('/manager/admin/roles/create')
        } else {
          toast.error(t('noPermission'));
        }
      },
      title: t('addRole'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  return (
    <AsyncWrapper>
      <PageBreadcrumb pageTitle={t('roleList')} />
      <div className="space-y-6">
        <ComponentCard title={t('roleList')} listAction={lstActions}>
          <DataTable
            columns={columns}
            data={roles}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            onSizeChange={handleSizeChange}
            manualPagination={true}
          />
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-4xl p-5 lg:p-10"
          >
            {selectedRole ? (
              <RolePermissionManager
                role={selectedRole}
                onClose={closeModal}
                onSave={() => {
                  toast.success(t('permissionUpdateSuccess'));
                  closeModal();
                }}
              />
            ) : (
              <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
                {t('addRoleNew')}
              </h4>
            )}
          </Modal>
          <AlertDialogUtils
            type="warning"
            title={tUtils('notify')}
            content={dialogContent}
            confirmText={tUtils('confirm')}
            cancelText={tUtils('cancel')}
            isOpen={openDialog}
            onConfirm={() => confirmDelete()}
            onCancel={() => { setOpenDialog(false) }}
          />
        </ComponentCard>
      </div>
    </AsyncWrapper>
  );
} 