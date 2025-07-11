'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Pencil, ArrowDown, ArrowUp, BadgeInfo, MoreHorizontal, Trash, RefreshCcw, ArrowLeftRight } from 'lucide-react';
import { deletePermission, getPermissions, updatePermission } from '@/services/auth-api';
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
import { Permission } from '@/types/permission';
import { useTranslations } from 'next-intl';
import { AsyncWrapper } from '@/components/common/AsyncWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PermissionManager from './components/permission-manager';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';


export default function PermissionsPage() {
  const t = useTranslations('PermissionsPage');
  const tUtils = useTranslations('Utils');
  const router = useRouter();
  const { hasPermission,hasResourcePermission } = useAuth();
  const hasResourcePermissionStatus = hasResourcePermission('permission');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [totalPages, setTotalPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const actionRef = useRef<{ refresh: () => void }>({ refresh: () => {} });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const fetchPermissions = async () => {
    try {
      const response = await getPermissions({ page: pageIndex + 1, size: pageSize, search });
      setPermissions(response.data);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toast.error(t('fetchError') + error.message);
    }
  };

  useEffect(() => {
    if (!hasResourcePermissionStatus) {
      router.push('/manager/admin/permissions/template');
    }
  }, [hasResourcePermissionStatus]);

  useEffect(() => {
    fetchPermissions();
  }, [pageIndex, pageSize, search]);

  const handleDelete = async (id: string) => {
    setSelectedPermission(permissions.find(permission => permission.id === id) || null);
    setDialogContent(t('confirmDelete'))  ;
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePermission(selectedPermission?.id || '');
      toast.success(t('deleteSuccess'));
      fetchPermissions();
      setOpenDialog(false);
    } catch (error: any) {
      toast.error(t('deleteError', { message: error.message }));
      setOpenDialog(false);
    }
  };

  const handleSizeChange = (size: number) => {
    setPageSize(size);
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

  const getResourceDisplayName = (resourceKey: string) => {
    const resourceNames: { [key: string]: string } = {
      user: t('user'),
      role: t('role'),
      permission: t('permission'),
      feature: t('feature'),
      article: t('article'),
      category: t('category'),
      order: t('order'),
      payment: t('payment'),
      reservation: t('reservation'),
      table: t('table'),
      exam: t('exam'),
      question: t('question'),
      media: t('media'),
      notification: t('notification'),
      history: t('history'),
      food_item: t('foodItem'),
    };
    return resourceNames[resourceKey] || resourceKey;
  };

  const getActionDisplayName = (actionKey: string) => {
    const actionNames: { [key: string]: string } = {
      CREATE: t('create'),
      READ: t('read'),
      UPDATE: t('update'),
      DELETE: t('delete'),
      EXPORT: t('export'),
      IMPORT: t('import'),
      APPROVE: t('approve'),
      REJECT: t('reject'),
      PUBLISH: t('publish'),
      BLOCK: t('block'),
      UNBLOCK: t('unblock'),
      ASSIGN: t('assign'),
      UPLOAD: t('upload'),
      DOWNLOAD: t('download'),
    };
    return actionNames[actionKey] || actionKey;
  };

  const handleChangeStatus = async (permission: Permission) => {
    try {
      await updatePermission(permission.id, { isActive: !permission.isActive });
      toast.success(t('updateSuccess'));
      fetchPermissions();
    } catch (error: any) {
      toast.error(t('updateError', { message: error.message }));
    }
  };

  const columns: ColumnDef<Permission>[] = [
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
            {t('permissionName')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "resource",
      header: t('resource'),
      cell: ({ row }) => {
        const resource = row.getValue("resource") as string;
        return resource ? (
          <Badge variant="light" color="primary">
            {getResourceDisplayName(resource)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "action",
      header: t('action'),
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        return action ? (
          <Badge variant="light" color="info">
            {getActionDisplayName(action)}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "code",
      header: t('permissionCode'),
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {code}
          </code>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("isActive") as boolean;
        return (
          <Badge variant="light" color={status === true ? 'success' : 'error'}>
            {status === true ? t('active') : t('inactive')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "description",
      header: t('description'),
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs truncate">
            {description || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t('createdAt'),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return new Date(createdAt).toLocaleDateString('vi-VN');
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const permission = row.original;
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs'>
                {hasPermission('PERMISSION_READ') && <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => router.push(`/manager/admin/permissions/${permission.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4" />
                  {t('viewDetail')}
                </DropdownMenuItem>}
                {hasPermission('PERMISSION_UPDATE') && 
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-blue-500 dark:text-blue-400'
                  onClick={() => router.push(`/manager/admin/permissions/update/${permission.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                  {t('edit')}
                </DropdownMenuItem>}
                {hasPermission('PERMISSION_UPDATE') && <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(permission)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {permission.isActive ? t('inactive') : t('active')}
                </DropdownMenuItem>}
                {hasPermission('PERMISSION_DELETE') && <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" 
                  onClick={() => handleDelete(permission.id.toString())}>
                  <Trash className="mr-2 h-4 w-4 text-red-600" />
                  {t('delete')}
                </DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ];

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => {
        router.push('/manager/admin/permissions/create');
      },
      title: t('addPermission'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ];
  const refreshActions: Action[] = [
    {
      icon: <RefreshCcw className="w-4 h-4 mr-2" />,
      onClick: () => {
        actionRef.current?.refresh();
      },
      title: t('refresh'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ];
  return (
    <AsyncWrapper>
      <PageBreadcrumb pageTitle={t('permissionManagement')} />
      <div className="space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg shadow-sm">
            <TabsTrigger 
              value="list"
              className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              {t('permissionList')}
            </TabsTrigger>
            <TabsTrigger 
              value="template"
              className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              {t('permissionManagementTemplate')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <ComponentCard title={t('permissionManagement')} listAction={lstActions}>
              <DataTable
                columns={columns}
                data={permissions}
                pageCount={totalPages}
                onPaginationChange={handlePaginationChange}
                onSearchChange={handleSearch}
                manualPagination={true}
                onSizeChange={handleSizeChange}
              />
            </ComponentCard>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <ComponentCard title={t('permissionManagementTemplate')} listAction={refreshActions}>
              <PermissionManager ref={actionRef} />
            </ComponentCard>
          </TabsContent>
        </Tabs>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-[600px] p-5 lg:p-10"
        >
          <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
            {selectedPermission ? t('updatePermission') : t('addPermissionNew')}
          </h4>
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
      </div>
    </AsyncWrapper>
  );
} 