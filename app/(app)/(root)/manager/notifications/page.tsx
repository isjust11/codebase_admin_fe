'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, BadgeInfo } from 'lucide-react';
import { deleteNotification, getNotifications } from '@/services/notification-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Action } from '@/types/actions';
import { Notification } from '@/types/notification';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('NotificationPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const fetchNotifications = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getNotifications({ page: page + 1, size, search });
      setNotifications(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setNotifications([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (notification: Notification) => {
    setNotification(notification);
    setIsOpen(true);
  }

  const handleDelete = async (notificationId: string | undefined) => {
    if (!notificationId) return;
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      fetchNotifications(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const columns: ColumnDef<Notification>[] = [
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
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('notificationTitle')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "content",
      header: t('content'),
      cell: ({ row }) => {
        const content = row.getValue("content") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {content || 'Không có nội dung'}
          </div>
        )
      }
    },
    {
      accessorKey: "type",
      header: t('type'),
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <div className="text-sm text-gray-500">
            {t(`types.${type}`) || type}
          </div>
        )
      },
    },
    {
      accessorKey: "priority",
      header: t('priority'),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <div className="text-sm text-gray-500">
            {t(`priorities.${priority}`) || priority}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="text-sm text-gray-500">
            {t(`statuses.${status}`) || status}
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
        const notification = row.original
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
                  onClick={() => navigateTo(`/manager/notifications/details/${notification.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetails')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500'
                  onClick={() => navigateTo(`/manager/notifications/update/${notification.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {tUtils('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" 
                  onClick={() => handleOpenDeleteDialog(notification)}>
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
        navigateTo('/manager/notifications/create')
      },
      title: t('addNotification'),
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
              data={notifications}
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
          onConfirm={() => handleDelete(notification?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

