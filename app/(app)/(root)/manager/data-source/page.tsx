'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ArrowLeftRight, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { createDataSource, deleteDataSource, getDataSourceTypes, getDataSources, updateDataSource, updateDataSourceStatus } from '@/services/manager-api';
import { DataSourceTypeOption } from '@/types/data-source';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataSource, DataSourceType } from '@/types/data-source';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { DataSourceForm } from './components/DataSourceForm';
import { Action } from '@/types/actions';
import Badge from '@/components/ui/badge/Badge';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export default function DataSourceManagement() {
  const t = useTranslations("DataSourcePage");
  const tUtils = useTranslations("Utils");
  const { navigateTo } = useLoading();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSourceTypes, setDataSourceTypes] = useState<DataSourceTypeOption[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [filterByType, setFilterByType] = useState<DataSource[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const { hasPermission, hasResourcePermission } = useAuth();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>();
  const searchParams = useSearchParams();

  const columns: ColumnDef<DataSource>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('name')}
            {column.getIsSorted() === "asc" ? <ArrowUp /> : <ArrowDown />}
          </Button>
        )
      },
    },
    {
      accessorKey: "title",
      header: t('dataTitle'),
    },
    {
      accessorKey: "type",
      header: t('type'),
      cell: ({ row }) => {
        const type = row.getValue("type") as DataSourceType
        if (!type) return null;
        const typeOption = dataSourceTypes.find(t => t.value === type);
        return <div className="capitalize">{typeOption?.label || type}</div>
      },
    },
    {
      accessorKey: "author",
      header: t('author'),
    },
    {
      accessorKey: "publisher",
      header: t('publisher'),
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
        const dataSource = row.original as DataSource;
       
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
                <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-blue-400 hover:text-blue-500'
                  onClick={() => {
                    setSelectedDataSource(dataSource);
                    openModal();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-400 hover:text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                {hasPermission('DATA_SOURCE_UPDATE') && <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(dataSource)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {dataSource.isActive ? t('inactive') : t('active')}
                </DropdownMenuItem>
                }
                {hasPermission('DATA_SOURCE_DELETE') && <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => {
                    if (dataSource.id) {
                      handleDelete(dataSource);
                    }
                  }}>
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const queryOpen = searchParams.get('onCreate');
  const queryType = searchParams.get('type');

  const handleDelete = async (dataSource: DataSource) => {
    setSelectedDataSource(dataSource)
    setOpenDialog(true);
    setDialogContent(t('messages.confirmDelete'));
  }

  useEffect(() => {
    if (queryOpen) {
      openModal();
    } 
  }, [queryOpen]);

  const confirmDelete = async () => {
    await deleteDataSource(selectedDataSource?.id?.toString() || '');
    await fetchData();
    setOpenDialog(false)
    toast.success(t('deleteSuccess'))
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataSourcesData, typesData] = await Promise.all([
        getDataSources({ page: pageIndex + 1, size: pageSize, search }),
        getDataSourceTypes()
      ]);
      setDataSources(dataSourcesData.data);
      setFilters(dataSourcesData.data);
      setDataSourceTypes(typesData);
      if (queryType) {
        const foundType = typesData.find(type => type.value === queryType);
        if (foundType) {
          setSelectedType(foundType.value);
        }
      }
      setPageCount(dataSourcesData.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useAsyncEffect(async () => {
    await fetchData();
  }, [pageIndex, pageSize, search]);

  const handleSizeChange = (size: number) => {
    setPageSize(size);
  };

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const setFilters = (data: DataSource[]) => {
    if (selectedType) {
      const filters = data.filter((dataSource) => dataSource.type === selectedType)
      setFilterByType(filters);
    }
    else {
      setFilterByType(data);
    }
  }

  const handleSave = async (values: any) => {
    try {
      setLoading(true)
      console.log(values)
      if (selectedDataSource) {
        await updateDataSource(selectedDataSource.id.toString(), values);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createDataSource(values);
        toast.success(t('messages.createSuccess'));
      }
      closeModal();
      // Refresh data
      await fetchData();
      setSelectedDataSource(null);
    } catch (error) {
      toast.error(t('messages.saveError'));
    } finally {
      setLoading(false);
    }
  }

  const handleChangeType = async (typeValue: string) => {
    console.log(typeValue)
    if (typeValue === 'all') {
      setFilterByType(dataSources);
      setSelectedType(null);
      return;
    }
    const filters = dataSources.filter((dataSource) => dataSource.type === typeValue)
    setFilterByType(filters);
    setSelectedType(typeValue as DataSourceType);
  }

  const handleChangeStatus = async (dataSource: DataSource) => {
    await updateDataSourceStatus(dataSource.id.toString(), { isActive: !dataSource.isActive });
    await fetchData();
    toast.success(t('messages.updateSuccess'));
  };

  const listAction: Action[] = [
    {
      title: t('add'),
      icon: <Plus className="mr-2 h-4 w-4" />,
      onClick: () => {
        setSelectedDataSource(null);
        openModal();
      },
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
      variant: 'primary',
    },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle={t('pageTitle')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')} listAction={listAction}>
          <div className="mb-4 flex items-center gap-2">
            <Select value={selectedType || 'all'} onValueChange={(value) => handleChangeType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent className="w-[200px] bg-white" >
                <SelectItem value="all">{t('all')}</SelectItem>
                {dataSourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-start items-center">
                      <span className="text-sm text-gray-500">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
           
          </div>
          <DataTable
            columns={columns}
            data={filterByType}
            pageCount={pageCount}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearch}
            onSizeChange={handleSizeChange}
            manualPagination={true}
            getRowChildren={(row) => (row as any).children}
          />
          <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[800px] p-5 lg:p-10"
            modalSize='4xl'
          >
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
              {selectedDataSource ? t('update') : t('add')}
            </h4>
            <DataSourceForm
              initialData={selectedDataSource}
              onSubmit={handleSave}
              onCancel={closeModal}
              dataSourceTypes={dataSourceTypes}
            />
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
    </div>
  );
}
