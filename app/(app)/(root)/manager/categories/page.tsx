'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ArrowLeftRight } from 'lucide-react';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { createCategory, deleteCategory, getCategories, getCategoryTypes, updateCategory } from '@/services/manager-api';
import { CategoryType } from '@/types/category-type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from '@/types/category';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import { CategoryForm } from './components/CategoryForm';
import { Action } from '@/types/actions';
import { unicodeToEmoji } from '@/lib/utils';
import Badge from '@/components/ui/badge/Badge';
import { Icon } from '@/components/ui/icon';
import { IconType } from '@/enums/icon-type.enum';
import { useAsyncEffect } from '@/hooks/useAsyncEffect';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import router from 'next/router';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

export default function CategoriesManagement() {
  const t = useTranslations("CategoriesPage");
  const tUtils = useTranslations("Utils");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<CategoryType | null>(null);
  const [filterByType, setFilterByType] = useState<Category[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const { hasPermission,hasResourcePermission } = useAuth();
  const hasResourcePermissionStatus = hasResourcePermission('category');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<string>();
  const columns: ColumnDef<Category>[] = [
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
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn tất cả"
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
      accessorKey: "description",
      header: t('description'),
    },
    {
      accessorKey: "type",
      header: t('type'),
      cell: ({ row }) => {
        const type = row.getValue("type") as CategoryType
        if (!type) return null;
        return <div className="capitalize">{type.name}</div>
      },
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
      accessorKey: "icon",
      header: t('icon'),
      cell: ({ row }) => {
        const iconUnicode = row.getValue("icon") as string;
        const iconType = row.original.iconType as IconType;
        if (iconType === IconType.emoji) {
          const icon = unicodeToEmoji(iconUnicode);
          return (
            <div>
              {icon}
            </div>
          );
        } else {
          return (
            <div>
              <Icon name={iconUnicode} size={20} />
            </div>
          );
        }
      },
    },

    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const category = row.original as Category;
       
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
                    setSelectedCategory(category);
                    openModal();
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-400 hover:text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                {hasPermission('CATEGORY_UPDATE') && <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/10 text-violet-500 dark:text-white'
                  onClick={() => {
                    handleChangeStatus(category)
                  }}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {category.isActive ? t('inactive') : t('active')}
                </DropdownMenuItem>
                }
                {hasPermission('CATEGORY_DELETE') && <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => {
                    if (category.id) {
                      handleDelete(category);
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
  const handleDelete = async (category: Category) => {
    setSelectedCategory(category)
    setOpenDialog(true);
    setDialogContent(t('messages.confirmDelete'));
  }
  const confirmDelete = async () => {
    await deleteCategory(selectedCategory?.id || '');
    await fetchData();
    setOpenDialog(false)
    toast.success(t('deleteSuccess'))
  }
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, typesData] = await Promise.all([
        getCategories({ page: pageIndex + 1, size: pageSize, search }),
        getCategoryTypes()
      ]);
      setCategories(categoriesData.data);
      setFilters(categoriesData.data);
      setCategoryTypes(typesData.data);
      setPageCount(categoriesData.totalPages);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasResourcePermissionStatus) {
      router.push('/');
    }
  }, [hasResourcePermissionStatus]);

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

  const setFilters = (data: Category[]) => {
    if (selectedType) {
      const filters = categories.filter((category) => category.type.id === selectedType.id)
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
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, values);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createCategory(values);
        toast.success(t('messages.createSuccess'));
      }
      closeModal();
      // Refresh data
      await fetchData();
      setSelectedCategory(null);
    } catch (error) {
      toast.error(t('messages.saveError'));
    } finally {
      setLoading(false);
    }
  }

  const handleChangeType = async (id: string) => {
    console.log(id)
    if (id === 'all') {
      setFilterByType(categories);
      setSelectedType(null);
      return;
    }
    const filters = categories.filter((category) => category.type.id === id)
    setFilterByType(filters);
    const foundType = categoryTypes.find(type => type.id === id);
    setSelectedType(foundType || null);
  }

  const handleChangeStatus = async (category: Category) => {
    await updateCategory(category.id, { isActive: !category.isActive });
    await fetchData();
    toast.success(t('messages.updateSuccess'));
  };

  const listAction: Action[] = [
    {
      title: t('add'),
      icon: <Plus className="mr-2 h-4 w-4" />,
      onClick: () => {
        setSelectedCategory(null);
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
          <div className="mb-4">
            <Select value={selectedType?.id} onValueChange={(value) => handleChangeType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent className="w-[200px] bg-white" >
                <SelectItem value="all">{t('all')}</SelectItem>
                {categoryTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-start items-center">
                      <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                      <span className="text-sm text-gray-500">{type.name}</span>
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
            className="max-w-[600px] p-5 lg:p-10"
            modalSize='2xl'
          >
            <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
              {selectedCategory ? t('update') : t('add')}
            </h4>
            <CategoryForm
              initialData={selectedCategory}
              onSubmit={handleSave}
              onCancel={closeModal}
              categoryTypes={categoryTypes} />
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