'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { createFeature, deleteFeature, getAllFeatures, getFeatures, updateFeature } from '@/services/manager-api';
import { Feature } from '@/types/feature';
import { Checkbox } from '@radix-ui/react-checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, MoreHorizontal, BadgeInfo, Pencil, Trash, Plus, ArrowLeftRight, PlusCircle } from 'lucide-react';
import { Action } from '@/types/actions';
import Badge from '@/components/ui/badge/Badge';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import ComponentCard from '@/components/common/ComponentCard';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import { Category } from '@/types/category';
import { buildFeature } from '@/lib/utils';
import { FeatureForm } from './components/FeatureForm';
import Link from "next/link";
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { AsyncWrapper } from '@/components/common/AsyncWrapper';
import { useTranslations } from 'next-intl';

export default function FeaturePage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureParent, setFeatureParent] = useState<Feature>();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const {isOpen, openModal, closeModal } = useModal();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>();
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const t = useTranslations('FeaturePage');
  // const { socket } = useSocket();

  const fetchFeatures = async () => {
    const response = await getAllFeatures(search);
    const featureTree = buildFeature(response);
    setFeatures(featureTree);
    // setPageCount(response.totalPages);
  };

  useEffect(() => {
    fetchFeatures();
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleSubmit = async (values: any) => {
    if (selectedFeature) {
      // Cập nhật navigator
      await updateFeature(selectedFeature.id, values);
      toast.success(t('updateSuccess'))
    } else {
      // Thêm navigator mới
      await createFeature(values);
      toast.success(t('addSuccess'))
    }
    await fetchFeatures()
    closeModal();
  };

  const handleDelete = async (feature: any) => {
    setSelectedFeature(feature)
    setOpenDialog(true);
    setDialogContent(t('confirmDelete'));
    

  };

  const confirmDelete=async ()=>{
    await deleteFeature(selectedFeature?.id);
    await fetchFeatures();
    setOpenDialog(false)
    toast.success(t('deleteSuccess'))
  }

  const handleChangeStatus = async (feature: Feature) => {
    await updateFeature(feature.id, { isActive: !feature.isActive });
    await fetchFeatures()
    toast.success(t('changeStatusSuccess'))
  };

  const columns: ColumnDef<Feature>[] = [
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
      accessorKey: "label",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('featureName')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "featureType",
      header: t('featureType'),
      cell: ({ row }) => {
        const featureType = row.getValue("featureType") as Category
        return (
          <div className="text-sm text-gray-500">
            <span>{featureType?.name ?? '-'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "icon",
      header: t('icon'),
      cell: ({ row }) => {
        const icon = row.getValue("icon") as string
        return (
          <Icon name={icon} size={20} className='text-gray-400' />
        )
      },
    },
    {
      accessorKey: "link",
      enableHiding: true,
      header: t('link'),
      cell: ({ row }) => {
        const link = row.getValue("link") as string;
        const parentId = row.original.parentId;
        return (
          parentId ?
            <Link
              href={link ?? '#'}
              className='text-sm text-blue-400'
            >
              {link ?? ''}
            </Link>
            :
            <div className='text-sm text-gray-500'>
              {link ?? ''}
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
      accessorKey: "sortOrder",
      header: t('sortOrder'),
      cell: ({ row }) => {
        const sortOrder = row.getValue("sortOrder") as number
        return (
          <div className="text-sm text-gray-500">
            {sortOrder ?? '-'}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const feature = row.original
        return (
          <div className="p-2 ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='shadow-sm rounded-sm bg-white dark:bg-gray-800'>
                {
                  feature.parentId == null && <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-green-500 dark:text-white"
                    onClick={() => {
                      setSelectedFeature(null);
                      setFeatureParent(feature)
                      openModal();
                    }}>
                    <PlusCircle className="mr-2 h-4 w-4 text-green-500 dark:text-white" />
                    {t('addChildFeature')}
                  </DropdownMenuItem>
                }
                <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-gray-700 dark:text-white"
                  onClick={() => {
                    setSelectedFeature(feature)
                    openModal();
                  }}>
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-700 dark:text-white" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(feature)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {feature.isActive ? t('inactive') : t('active')}
                </DropdownMenuItem>
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-blue-500 dark:text-white'
                  onClick={() => {
                    setSelectedFeature(feature)
                    openModal();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500 dark:text-white" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10" onClick={() => handleDelete(feature)}>
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
        setSelectedFeature(null);
        openModal();
      },
      title: t('addFeature'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ]

  return (
    <AsyncWrapper>
      <PageBreadcrumb pageTitle={t('featureList')} />
      <div className="space-y-6">
        <ComponentCard title={t('featureList')} listAction={lstActions}>
          <DataTable
            columns={columns}
            allowPagination={false}
            data={features}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            manualPagination={true}
            getRowChildren={(row) => (row as any).children}
          />
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="p-5 lg:p-10"
            modalSize="2xl"
          >
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
              {selectedFeature ? t('updateFeature') : t('addFeatureNew')}
            </h4>
            <FeatureForm
              initialData={selectedFeature}
              onSubmit={handleSubmit}
              onCancel={closeModal}
              featureParents={features}
              featureParent={featureParent}
            />
          </Modal>
        </ComponentCard>
        <AlertDialogUtils
          type="warning"
          content={dialogContent}
          confirmText={t('confirm')}
          cancelText={t('cancel')}
          isOpen={openDialog}
          onConfirm={() => confirmDelete()}
          onCancel={() => {setOpenDialog(false)}}
        />
      </div>
    </AsyncWrapper>
  );
} 