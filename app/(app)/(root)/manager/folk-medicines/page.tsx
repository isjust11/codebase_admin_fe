'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ImageOff, BadgeInfo, Eye, Leaf } from 'lucide-react';
import { deleteFolkMedicine, getFolkMedicines } from '@/services/folk-medicine-api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image'
import { Action } from '@/types/actions';
import { FolkMedicine } from '@/types/folk-medicine'; 
import { useTranslations } from 'next-intl';

export default function FolkMedicinesManagement() {
  const t = useTranslations('FolkMedicinesPage');
  const tUtils = useTranslations('Utils');
  
  const [folkMedicines, setFolkMedicines] = useState<FolkMedicine[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchFolkMedicines = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getFolkMedicines({ page: page + 1, size, search });
      setFolkMedicines(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.error'));
      setFolkMedicines([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolkMedicines(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleDelete = async (folkMedicineId: number) => {
    try {
      await deleteFolkMedicine(folkMedicineId.toString());
      setFolkMedicines(folkMedicines.filter(medicine => medicine.id !== folkMedicineId));
      fetchFolkMedicines(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const columns: ColumnDef<FolkMedicine>[] = [
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
        const thumbnail = mergeImageUrl(row.getValue("thumbnail") as string)
        return (
          thumbnail ? 
          <Image width={64}
            height={64}
            src={thumbnail}
            alt="folk medicine"
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
      accessorKey: "summary",
      header: t('summary'),
      cell: ({ row }) => {
        const summary = row.getValue("summary") as string
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {summary || t('noSummary')}
          </div>
        )
      }
    },
    {
      accessorKey: "category",
      header: t('category'),
      cell: ({ row }) => {
        const category = row.original.category
        return (
          <div className="text-sm text-gray-600">
            {category?.name || t('noCategory')}
          </div>
        )
      },
    },
    {
      accessorKey: "viewCount",
      header: t('viewCount'),
      cell: ({ row }) => {
        const viewCount = row.getValue("viewCount") as number
        return (
          <div className="text-sm text-blue-600 font-medium">
            {viewCount.toLocaleString()}
          </div>
        )
      },
    },
    {
      accessorKey: "likeCount",
      header: t('likeCount'),
      cell: ({ row }) => {
        const likeCount = row.getValue("likeCount") as number
        return (
          <div className="text-sm text-red-600 font-medium">
            {likeCount.toLocaleString()}
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
          <div className={`capitalize px-2 py-1 rounded-full text-xs ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? t('active') : t('inactive')}
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
        const folkMedicine = row.original
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
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                    onClick={() => router.push(`/manager/folk-medicines/${folkMedicine.id}`)}>
                    <BadgeInfo className="mr-2 h-4 w-4" />
                    {t('viewDetail')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer color-yellow-300 hover:bg-yellow-300/20"
                    onClick={() => router.push(`/manager/folk-medicines/${folkMedicine.slug}/${folkMedicine.id}`)}>
                    <Eye className="mr-2 h-4 w-4 color-yellow-300" />
                    {t('viewFolkMedicine')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20'
                    onClick={() => router.push(`/manager/folk-medicines/update/${folkMedicine.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20" onClick={() => handleDelete(folkMedicine.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    {t('delete')}
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
        router.push('/manager/folk-medicines/create')
      },
      title: t('add-folk-medicine'),
      className: "hover:bg-green-100 dark:hover:bg-green-800 rounded-md transition-colors text-green-500",
    },
  ]

  const handleSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={lstActions}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500 ">{t('loading')}</span>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={folkMedicines}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSizeChange={handleSizeChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          )}
        </ComponentCard>
      </div>
    </div>
  );
} 