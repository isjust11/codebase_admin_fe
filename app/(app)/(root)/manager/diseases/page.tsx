'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Pencil, Trash, ArrowLeftRight, BadgeInfo } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { DataTable } from '@/components/DataTable';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Badge from '@/components/ui/badge/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

import { useLoading } from '@/contexts/LoadingContext';
import { Action } from '@/types/actions';
import { Disease } from '@/types/disease';
import { deleteDisease, getDiseases, updateDisease } from '@/services/disease-api';

const DiseasesPage: React.FC = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo<ColumnDef<Disease>[]>(() => [
    {
      id: 'select',
      accessorKey: 'id',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={tUtils('selectAll')}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={tUtils('selectRow')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('name')}
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue('name') as string;
        return <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>;
      },
    },
    {
      accessorKey: 'slug',
      header: t('slug'),
      cell: ({ row }) => {
        const slug = row.getValue('slug') as string | undefined;
        return <span className="text-sm text-gray-600 dark:text-gray-400">{slug || tUtils('noData')}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: t('description'),
      cell: ({ row }) => {
        const description = row.getValue('description') as string | undefined;
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {description || tUtils('noData')}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: t('status'),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge
            className={isActive ? 'ring-green-400' : 'ring-red-400'}
            variant="light"
            color={isActive ? 'success' : 'error'}
          >
            {isActive ? tUtils('active') : tUtils('inactive')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: t('updatedAt'),
      cell: ({ row }) => {
        const updatedAt = row.getValue('updatedAt') as string | undefined;
        if (!updatedAt) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">{tUtils('noData')}</span>;
        }
        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(updatedAt).toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: tUtils('actions'),
      cell: ({ row }) => {
        const disease = row.original;
        return (
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{tUtils('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs dark:bg-gray-900">
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/manager/diseases/${disease.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {tUtils('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500"
                  onClick={() => handleToggleStatus(disease)}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500" />
                  {disease.isActive ? t('deactivate') : t('activate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500"
                  onClick={() => navigateTo(`/manager/diseases/update/${disease.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {tUtils('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => handleDelete(disease)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {tUtils('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [navigateTo, t, tUtils]);
  
  const fetchDiseases = async () => {
    setIsLoading(true);
    try {
      const response = await getDiseases({
        page: pageIndex + 1,
        size: pageSize,
        search,
      });

      if (response && response.data) {
        setDiseases(response.data);
        setPageCount(response.totalPages ?? 0);
      }
    } catch (error) {
      console.error(t('messages.loadError'), error);
      toast.error(t('messages.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSizeChange = (newSize: number) => {
    setPageIndex(0);
    setPageSize(newSize);
  };

  const handleSearchChange = (value: string) => {
    setPageIndex(0);
    setSearch(value);
  };

  const handleDelete = (disease: Disease) => {
    setSelectedDisease(disease);
    setDialogContent(t('messages.confirmDelete', { name: disease.name }));
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedDisease) {
      setOpenDialog(false);
      return;
    }
    try {
      await deleteDisease(selectedDisease.id);
      toast.success(t('messages.deleteSuccess'));
      fetchDiseases();
    } catch (error) {
      console.error(t('messages.deleteError'), error);
      toast.error(t('messages.deleteError'));
    } finally {
      setOpenDialog(false);
      setSelectedDisease(null);
    }
  };

  const handleToggleStatus = async (disease: Disease) => {
    try {
      await updateDisease(disease.id, {
        name: disease.name,
        slug: disease.slug,
        description: disease.description,
        symptoms: disease.symptoms,
        causes: disease.causes,
        prevention: disease.prevention,
        isActive: !disease.isActive,
      });
      toast.success(t('messages.toggleStatusSuccess'));
      fetchDiseases();
    } catch (error) {
      console.error(t('messages.toggleStatusError'), error);
      toast.error(t('messages.toggleStatusError'));
    }
  };

  const actions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo('/manager/diseases/create'),
      title: t('addDisease'),
      className: 'hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500',
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={actions}>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={diseases}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              manualPagination
              onSizeChange={handleSizeChange}
            />
            {isLoading && (
              <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {tUtils('loading')}
              </div>
            )}
          </div>
        </ComponentCard>

        <AlertDialogUtils
          type="warning"
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={confirmDelete}
          onCancel={() => setOpenDialog(false)}
          title={t('messages.deleteTitle')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
        />
      </div>
    </div>
  );
};

export default DiseasesPage;

