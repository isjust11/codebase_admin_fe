"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowLeftRight, ArrowUp, BadgeInfo, ImageOff, MoreHorizontal, Pencil, Plus, Trash, User, Calendar, MessageSquare } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { DataTable } from '@/components/DataTable';
import { deleteProductComplaint, getAllProductComplaints, updateProductComplaint } from '@/services/product-complaint-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import Badge from '@/components/ui/badge/Badge';
import { Action } from '@/types/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Category } from '@/types/category';
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils';
import Image from 'next/image';
import { ProductComplaint } from '@/types/productComplaint';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';

const ProductComplaintsPage = () => {
  const { navigateTo } = useLoading();
  const t = useTranslations('ProductComplaints');
  const tUtils = useTranslations('Utils');
  
  const columns: ColumnDef<ProductComplaint>[] = [
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
          aria-label={t('selectRow')}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "product.thumbnail",
      header: t('productImage'),
      cell: ({ row }) => {
        const product = row.original.product;
        const thumbnail = product?.thumbnail ? mergeImageUrl(product.thumbnail) : null;
        const isImageInvalid = thumbnail && thumbnail.split('.').pop() !== 'jpg' && thumbnail.split('.').pop() !== 'png' && thumbnail.split('.').pop() !== 'jpeg' && thumbnail.split('.').pop() !== 'webp';
        
        if (!thumbnail || isImageInvalid) {
          return (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">
                <ImageOff className="w-8 h-8" />
              </span>
            </div>
          );
        }
        return (
          <Image
            width={64}
            height={64}
            src={thumbnail}
            alt="product-thumbnail"
            className="w-16 h-16 object-cover rounded-md"
          />
        );
      },
    },
    {
      accessorKey: "product.title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('productName')}
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
          </Button>
        );
      },
      cell: ({ row }) => {
        const product = row.original.product;
        return (
          <div className='font-medium text-sm'>
            {product?.title || t('noData')}
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: t('category'),
      cell: ({ row }) => {
        const category = row.getValue("category") as Category;
        return (
          <div className="flex items-center">
            <div className="mr-2">
              {category?.icon && unicodeToEmoji(category.icon)}
            </div>
            <div className="text-sm text-gray-500">
              {category?.name || t('noData')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user.fullName",
      header: t('complainant'),
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">
              {user?.fullName || user?.email || t('anonymous')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t('createdAt')}
            {column.getIsSorted() === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />}
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {createdAt ? new Date(createdAt).toLocaleDateString() : t('noData')}
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: t('description'),
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs">
            <div className="flex items-start">
              <MessageSquare className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 line-clamp-2">
                {description || t('noData')}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const isResolved = status === 'resolved';
        return (
          <Badge 
            className={isResolved ? 'ring-green-400' : 'ring-yellow-400'} 
            variant="light" 
            color={isResolved ? 'success' : 'warning'}
          >
            {isResolved ? t('resolved') : t('pending')}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: t('actions'),
      cell: ({ row }) => {
        const productComplaint = row.original;
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
                <DropdownMenuItem 
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-300/20"
                  onClick={() => navigateTo(`/ecommerce/product-complaint/${productComplaint.id}`)}
                >
                  <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                  {t('viewDetail')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className='flex items-center px-4 py-2 cursor-pointer hover:bg-gray-300/20 text-violet-500 dark:text-white'
                  onClick={() => handleChangeStatus(productComplaint)}
                >
                  <ArrowLeftRight className="mr-2 h-4 w-4 text-violet-500 dark:text-white" />
                  {productComplaint.status === 'resolved' ? t('markAsPending') : t('markAsResolved')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className='flex items-center px-4 py-2 cursor-pointer hover:bg-blue-300/20 text-blue-500'
                  onClick={() => navigateTo(`/ecommerce/product-complaint/update/${productComplaint.id}`)}
                >
                  <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 flex items-center px-4 py-2 cursor-pointer hover:bg-gray-300/20" 
                  onClick={() => handleDelete(productComplaint)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const [productComplaints, setProductComplaints] = useState<ProductComplaint[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductComplaint, setSelectedProductComplaint] = useState<ProductComplaint | null>(null);
  const [dialogContent, setDialogContent] = useState('');

  const fetchProductComplaints = async () => {
    try {
      const response = await getAllProductComplaints({ page: pageIndex + 1, size: pageSize, search });
      if (response && response.data) {
        setProductComplaints(response.data);
        setPageCount(response.totalPages);
      }
    } catch (error) {
      console.error(t('errorLoadingProductComplaints'), error);
      toast.error(t('errorLoadingProductComplaints'));
    }
  };

  useEffect(() => {
    fetchProductComplaints();
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
    setPageIndex(0); // Reset to first page when searching
  };

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => {
        navigateTo('/ecommerce/product-complaint/create');
      },
      title: t('addProductComplaint'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },
  ];

  const handleDelete = async (productComplaint: ProductComplaint) => {
    setOpenDialog(true);
    setDialogContent(t('confirmDeleteProductComplaint'));
    setSelectedProductComplaint(productComplaint);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedProductComplaint?.id) {
        toast.error(t('errorDeletingProductComplaint'));
        return;
      }
      await deleteProductComplaint(String(selectedProductComplaint.id));
      toast.success(t('productComplaintDeletedSuccess'));
      fetchProductComplaints();
    } catch (error) {
      console.error('Error deleting product complaint:', error);
      toast.error(t('errorDeletingProductComplaint'));
    } finally {
      setOpenDialog(false);
      setSelectedProductComplaint(null);
    }
  };

  const handleChangeStatus = async (productComplaint: ProductComplaint) => {
    try {
      const newStatus = productComplaint.status === 'resolved' ? 'pending' : 'resolved';
      await updateProductComplaint(productComplaint.id, { 
        ...productComplaint, 
        status: newStatus 
      });
      
      toast.success(
        newStatus === 'resolved' 
          ? t('productComplaintResolvedSuccess') 
          : t('productComplaintPendingSuccess')
      );
      
      fetchProductComplaints();
    } catch (error) {
      console.error('Error updating product complaint status:', error);
      toast.error(t('errorUpdatingStatus'));
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={t('productComplaints')} items={[]} />
      <div className="space-y-6">
        <ComponentCard title={t('productComplaints')} listAction={lstActions}>
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={productComplaints}
              pageCount={pageCount}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearch}
              manualPagination={true}
            />
          </div>
        </ComponentCard>
        
        <AlertDialogUtils
          type='warning'
          isOpen={openDialog}
          onOpenChange={setOpenDialog}
          onConfirm={confirmDelete}
          title={t('deleteProductComplaint')}
          content={dialogContent}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onCancel={() => {
            setOpenDialog(false);
            setSelectedProductComplaint(null);
          }}
        />
      </div>
    </div>
  );
};

export default ProductComplaintsPage;
