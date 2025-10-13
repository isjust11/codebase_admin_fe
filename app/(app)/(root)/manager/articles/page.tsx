'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, ArrowDown, ArrowUp, MoreHorizontal, ImageOff, BadgeInfo, Eye, Badge } from 'lucide-react';
import { deleteArticle, getArticles } from '@/services/article-api';
import { useLoading } from '@/contexts/LoadingContext';
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
import { Article } from '@/types/article';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Category } from '@/types/category';

export default function ArticlesManagement() {
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('ArticlePage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const fetchArticles = async (page: number, size: number, search: string) => {
    setLoading(true);
    try {
      const response = await getArticles({ page: page + 1, size, search });
      setArticles(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (error) {
      toast.error(t('messages.loadError'));
      setArticles([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);
  };

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  }

  const handleOpenDeleteDialog = (article: Article) => {
    setArticle(article);
    setIsOpen(true);
  }

  const handleDelete = async (articleId: string | undefined) => {
    if (!articleId) return;
    try {
      await deleteArticle(articleId);
      setArticles(articles.filter(article => article.id !== articleId));
      fetchArticles(pageIndex, pageSize, search);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const columns: ColumnDef<Article>[] = [
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
        // console.log(thumbnail)
        return (
          thumbnail ? 
          <Image width={64}
            height={64}
            src={mergeImageUrl(thumbnail)}
            alt="article"
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
            {summary || 'Không có mô tả'}
          </div>
        )
      }
    },
    {
      accessorKey: "status",
      header: t('status'),
      cell: ({ row }) => {
        const status = row.getValue("status") as Category
        return (
          <div className="text-sm text-gray-500">
            {status?.name || tUtils('unknown')}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: t('category'),
      cell: ({ row }) => {
        const category = row.getValue("category") as Category
        return (
          <div className="text-sm text-gray-500">
            {category?.name || tUtils('unknown')}
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
        const article = row.original
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
                    onClick={() => navigateTo(`/manager/articles/details/${article.id}`)}>
                    <BadgeInfo className="mr-2 h-4 w-4 text-gray-500" />
                    {t('viewDetails')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-start px-4 py-2 cursor-pointer text-yellow-300 hover:bg-yellow-100"
                    onClick={() => navigateTo(`/manager/articles/${article.slug}/${article.id}`)}>
                    <Eye className="mr-2 h-4 w-4 text-yellow-300" />
                    {t('viewArticle')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className='flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500'
                    onClick={() => navigateTo(`/manager/articles/update/${article.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                    {tUtils('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300" onClick={() => handleOpenDeleteDialog(article)}>
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
        navigateTo('/manager/articles/create')
      },
      title: t('addArticle'),
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
              data={articles}
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
          onConfirm={() => handleDelete(article?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
} 