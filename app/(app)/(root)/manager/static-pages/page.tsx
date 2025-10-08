'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ImageOff, BadgeInfo, Eye } from 'lucide-react';
import { deleteStaticPage, getStaticPages, toggleActiveStaticPage } from '@/services/static-page-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image'
import { Action } from '@/types/actions';
import { StaticPage } from '@/types/static-page';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Badge } from '@/components/ui/badge';

export default function StaticPagesManagement() {
  
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('StaticPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [staticPage, setStaticPage] = useState<StaticPage | null>(null);

  const fetchStaticPages = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getStaticPages({ page: page + 1, size, search });
      setStaticPages(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setStaticPages([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaticPages(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (staticPage: StaticPage) => {
    setStaticPage(staticPage);
    setIsOpen(true);
  }

  const handleDelete = async (staticPageId: string | undefined) => {
    if (!staticPageId) return;
    try {
      await deleteStaticPage(staticPageId);
      setStaticPages(staticPages.filter(page => page.id !== staticPageId));
      fetchStaticPages(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const handleToggleActive = async (staticPage: StaticPage) => {
    if (!staticPage.id) return;
    try {
      await toggleActiveStaticPage(staticPage.id);
      fetchStaticPages(pageIndex, pageSize, search);
      toast.success(t('messages.toggleSuccess'));
    } catch (_error) {
      toast.error(t('messages.toggleError'));
    }
  };

  const columns: ColumnDef<StaticPage>[] = [
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
      accessorKey: "thumbnail",
      header: t('thumbnail'),
      cell: ({ row }) => {
        const thumbnail = row.getValue("thumbnail") as string
        return (
          thumbnail ? 
          <Image width={64}
            height={64}
            src={thumbnail}
            alt="static page"
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
            {t('title')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "slug",
      header: t('slug'),
      cell: ({ row }) => {
        const slug = row.getValue("slug") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {slug || 'N/A'}
          </div>
        )
      }
    },
    {
      accessorKey: "isActive",
      header: t('status'),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <div className="flex items-center">
            <Badge className={`px-2 py-1 rounded-full text-xs ${
              isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isActive ? tUtils('active') : tUtils('inactive')}
            </Badge>
          
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
        const staticPage = row.original
        return (
          <div className="p-2 ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{tUtils('openMenu')}</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className='bg-white shadow-sm rounded-xs '>
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300"
                    onClick={() => navigateTo(`/manager/static-pages/details/${staticPage.id}`)}>
                    <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                    {t('viewDetails')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer text-yellow-300 hover:bg-yellow-100"
                    onClick={() => navigateTo(`/manager/static-pages/${staticPage.slug}/${staticPage.id}`)}>
                    <Eye className="mr-2 h-4 w-4 text-yellow-300" />
                    {t('viewPage')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500'
                    onClick={() => navigateTo(`/manager/static-pages/update/${staticPage.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                    {tUtils('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-green-300 text-green-500"
                    onClick={() => handleToggleActive(staticPage)}>
                    <Badge className="mr-2 h-4 w-4 text-green-500" />
                    {staticPage.isActive ? t('deactivate') : t('activate')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" onClick={() => handleOpenDeleteDialog(staticPage)}>
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
        navigateTo('/manager/static-pages/create')
      },
      title: t('addStaticPage'),
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
              <span className="text-gray-500 ">{tUtils('loading')}</span>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={staticPages}
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
          onConfirm={() => handleDelete(staticPage?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
