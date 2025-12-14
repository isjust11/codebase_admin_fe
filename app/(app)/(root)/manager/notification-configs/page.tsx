'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, BadgeInfo } from 'lucide-react';
import { deleteNotificationConfig, getNotificationConfigs } from '@/services/notification-config-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Action } from '@/types/actions';
import { NotificationConfig } from '@/types/notification-config';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

export default function NotificationConfigsManagement() {
  const [configs, setConfigs] = useState<NotificationConfig[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('NotificationConfigPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<NotificationConfig | null>(null);

  const fetchConfigs = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getNotificationConfigs({ page: page + 1, size, search });
      setConfigs(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setConfigs([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (config: NotificationConfig) => {
    setConfig(config);
    setIsOpen(true);
  }

  const handleDelete = async (configId: string | undefined) => {
    if (!configId) return;
    try {
      await deleteNotificationConfig(configId);
      setConfigs(configs.filter(c => c.id !== configId));
      fetchConfigs(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const columns: ColumnDef<NotificationConfig>[] = [
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
          aria-label={tUtils('selectAll')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "key",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('key')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "isDefault",
      header: t('scope'),
      cell: ({ row }) => {
        const isDefault = row.getValue("isDefault") as boolean
        return (
          <div className="text-sm">
            {isDefault ? (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                🌐 Tất cả
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                👤 Cá nhân
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "value",
      header: t('value'),
      cell: ({ row }) => {
        const value = row.getValue("value") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {value || 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "isActive",
      header: t('isActive'),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <div className="text-sm">
            <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isActive ? tUtils('active') : tUtils('inactive')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t('createdAt'),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return (
          <div className="text-sm text-gray-500">
            {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const config = row.original
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tUtils('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs'>
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300"
                  onClick={() => navigateTo(`/manager/notification-configs/details/${config.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500'
                  onClick={() => navigateTo(`/manager/notification-configs/update/${config.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {tUtils('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" 
                  onClick={() => handleOpenDeleteDialog(config)}>
                  <Trash className="mr-2 h-4 w-4 text-red-600" />
                  {tUtils('delete')}
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
        navigateTo('/manager/notification-configs/create')
      },
      title: t('addConfig'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={configs}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          )}
        </ComponentCard>
        <AlertDialogUtils 
          title={t('messages.deleteTitle')}
          content={t('messages.deleteDescription')}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onConfirm={() => handleDelete(config?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

