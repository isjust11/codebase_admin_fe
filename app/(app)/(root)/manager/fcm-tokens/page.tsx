'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash, ArrowDown, ArrowUp, MoreHorizontal, BadgeInfo, XCircle } from 'lucide-react';
import { deleteFcmToken, getFcmTokens, deactivateFcmToken } from '@/services/fcm-token-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { FcmToken } from '@/types/fcm-token';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

export default function FcmTokensManagement() {
  const [tokens, setTokens] = useState<FcmToken[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('FcmTokenPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<FcmToken | null>(null);

  const fetchTokens = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getFcmTokens({ page: page + 1, size, search });
      setTokens(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setTokens([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (token: FcmToken) => {
    setToken(token);
    setIsOpen(true);
  }

  const handleDelete = async (tokenId: string | undefined) => {
    if (!tokenId) return;
    try {
      await deleteFcmToken(tokenId);
      setTokens(tokens.filter(t => t.id !== tokenId));
      fetchTokens(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const handleDeactivate = async (tokenId: string | undefined) => {
    if (!tokenId) return;
    try {
      await deactivateFcmToken(tokenId);
      fetchTokens(pageIndex, pageSize, search);
      toast.success(t('messages.deactivateSuccess'));
    } catch (_error) {
      toast.error(t('messages.deactivateError'));
    }
  };

  const columns: ColumnDef<FcmToken>[] = [
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
      accessorKey: "token",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('token')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const token = row.getValue("token") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate font-mono">
            {token}
          </div>
        )
      }
    },
    {
      accessorKey: "platform",
      header: t('platform'),
      cell: ({ row }) => {
        const platform = row.getValue("platform") as string
        return (
          <div className="text-sm text-gray-500">
            {platform ? t(`platforms.${platform}`) : tUtils('unknown')}
          </div>
        )
      },
    },
    {
      accessorKey: "deviceId",
      header: t('deviceId'),
      cell: ({ row }) => {
        const deviceId = row.getValue("deviceId") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {deviceId || 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "userId",
      header: t('userId'),
      cell: ({ row }) => {
        const userId = row.getValue("userId") as number
        return (
          <div className="text-sm text-gray-500">
            {userId || 'N/A'}
          </div>
        )
      },
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
        const token = row.original
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
                  onClick={() => navigateTo(`/manager/fcm-tokens/details/${token.id}`)}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetails')}
                </DropdownMenuItem>
                {token.isActive && (
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-yellow-300 text-yellow-600'
                    onClick={() => handleDeactivate(token.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4 text-yellow-600" />
                    {t('deactivate')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" 
                  onClick={() => handleOpenDeleteDialog(token)}>
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

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={tokens}
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
          onConfirm={() => handleDelete(token?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

