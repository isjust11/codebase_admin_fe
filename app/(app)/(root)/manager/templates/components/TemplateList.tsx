'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, MoreHorizontal, ImageOff, Eye, Check, XCircle, Send } from 'lucide-react';
import {
  deleteTemplate,
  getMyTemplates,
  getTemplates,
  publishTemplate,
  approveTemplate,
  rejectTemplate,
  submitTemplate,
} from '@/services/template-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Action } from '@/types/actions';
import { Template } from '@/types/template';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Badge } from '@/components/ui/badge';
import { AppRoutes } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';

type StatusFilter = '' | 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

export default function TemplateList({ mine = false }: { mine?: boolean }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusFilter>(() => {
    if (mine) return '';
    const raw = searchParams.get('status');
    if (raw === 'DRAFT' || raw === 'PENDING' || raw === 'PUBLISHED' || raw === 'REJECTED') {
      return raw;
    }
    return '';
  });
  const [loading, setLoading] = useState(true);
  const t = useTranslations('TemplatePage');
  const tUtils = useTranslations('Utils');
  const { navigateTo } = useLoading();
  const { hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);

  const canPublish = hasPermission('TEMPLATE_PUBLISH');
  const canApprove = hasPermission('TEMPLATE_APPROVE') || canPublish;
  const canReject = hasPermission('TEMPLATE_REJECT') || canPublish;

  const fetchTemplates = async (page: number, size: number, searchValue: string, statusValue: string) => {
    setLoading(true);
    try {
      const response = mine
        ? await getMyTemplates({ page: page + 1, size, search: searchValue })
        : await getTemplates({ page: page + 1, size, search: searchValue, status: statusValue || undefined });
      setTemplates(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (_error) {
      toast.error(t('messages.loadError'));
      setTemplates([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates(pageIndex, pageSize, search, status);
  }, [pageIndex, pageSize, search, status, mine]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await deleteTemplate(id);
      fetchTemplates(pageIndex, pageSize, search, status);
      toast.success(t('messages.deleteSuccess'));
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const handlePublish = async (item: Template) => {
    if (!item.id) return;
    try {
      await publishTemplate(item.id, !item.isPublished);
      fetchTemplates(pageIndex, pageSize, search, status);
      toast.success(t('messages.publishSuccess'));
    } catch (_error) {
      toast.error(t('messages.publishError'));
    }
  };

  const handleSubmit = async (item: Template) => {
    if (!item.id) return;
    try {
      await submitTemplate(item.id);
      fetchTemplates(pageIndex, pageSize, search, status);
      toast.success(t('messages.submitSuccess'));
    } catch (_error) {
      toast.error(t('messages.submitError'));
    }
  };

  const handleApprove = async (item: Template) => {
    if (!item.id) return;
    try {
      await approveTemplate(item.id);
      fetchTemplates(pageIndex, pageSize, search, status);
      toast.success(t('messages.approveSuccess'));
    } catch (_error) {
      toast.error(t('messages.approveError'));
    }
  };

  const handleReject = async (item: Template) => {
    if (!item.id) return;
    const note = window.prompt(t('rejectNote')) || '';
    try {
      await rejectTemplate(item.id, note);
      fetchTemplates(pageIndex, pageSize, search, status);
      toast.success(t('messages.rejectSuccess'));
    } catch (_error) {
      toast.error(t('messages.rejectError'));
    }
  };

  const statusLabel = (value?: string) => {
    switch (value) {
      case 'PENDING':
        return t('pending');
      case 'PUBLISHED':
        return t('published');
      case 'REJECTED':
        return t('rejected');
      default:
        return t('draft');
    }
  };

  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: 'thumbnailUrl',
      header: t('thumbnail'),
      cell: ({ row }) => {
        const url = row.original.thumbnailUrl;
        if (!url) {
          return (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <ImageOff className="w-8 h-8 text-gray-500" />
            </div>
          );
        }
        return (
          <Image
            src={mergeImageUrl(url)}
            alt={row.original.name}
            width={64}
            height={64}
            unoptimized
            className="w-16 h-16 object-cover rounded-md"
          />
        );
      },
    },
    { accessorKey: 'name', header: t('name') },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'type', header: t('type') },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const value = row.original.status || (row.original.isPublished ? 'PUBLISHED' : 'DRAFT');
        return (
          <Badge variant={value === 'PUBLISHED' ? 'default' : 'secondary'}>{statusLabel(value)}</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: ({ row }) => {
        const item = row.original;
        const value = item.status || (item.isPublished ? 'PUBLISHED' : 'DRAFT');
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs">
              <DropdownMenuItem
                className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500"
                onClick={() => navigateTo(`${AppRoutes.Manager.TemplatesUpdate}/${item.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> {t('edit')}
              </DropdownMenuItem>
              {value === 'PUBLISHED' && item.id && (
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer"
                  onClick={() => window.open(`/template-preview/${item.id}`, '_blank')}
                >
                  <Eye className="mr-2 h-4 w-4" /> {t('publicPreview')}
                </DropdownMenuItem>
              )}
              {(value === 'DRAFT' || value === 'REJECTED') && (
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer"
                  onClick={() => handleSubmit(item)}
                >
                  <Send className="mr-2 h-4 w-4" /> {t('submitReview')}
                </DropdownMenuItem>
              )}
              {canApprove && value === 'PENDING' && (
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer text-green-600"
                  onClick={() => handleApprove(item)}
                >
                  <Check className="mr-2 h-4 w-4" /> {t('approve')}
                </DropdownMenuItem>
              )}
              {canReject && value === 'PENDING' && (
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer text-orange-600"
                  onClick={() => handleReject(item)}
                >
                  <XCircle className="mr-2 h-4 w-4" /> {t('reject')}
                </DropdownMenuItem>
              )}
              {canPublish && (
                <DropdownMenuItem
                  className="flex flex-start px-4 py-2 cursor-pointer"
                  onClick={() => handlePublish(item)}
                >
                  <Eye className="mr-2 h-4 w-4" /> {item.isPublished ? t('unpublish') : t('publish')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300"
                onClick={() => {
                  setSelected(item);
                  setIsOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const lstActions: Action[] = [
    {
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo(AppRoutes.Manager.TemplatesCreate),
      title: t('addTemplate'),
      className: 'hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500',
    },
  ];

  const filters: { value: StatusFilter; label: string }[] = [
    { value: '', label: t('allStatuses') },
    { value: 'DRAFT', label: t('draft') },
    { value: 'PENDING', label: t('pending') },
    { value: 'PUBLISHED', label: t('published') },
    { value: 'REJECTED', label: t('rejected') },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={mine ? t('mineTitle') : t('title')} />
      <div className="space-y-6">
        <ComponentCard title={mine ? t('mineTitle') : t('title')} listAction={lstActions}>
          {!mine && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.map((filter) => (
                <Button
                  key={filter.value || 'all'}
                  type="button"
                  size="sm"
                  variant={status === filter.value ? 'default' : 'outline'}
                  onClick={() => {
                    setPageIndex(0);
                    setStatus(filter.value);
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={templates}
              pageCount={pageCount}
              onPaginationChange={(p, s) => {
                setPageIndex(p);
                setPageSize(s);
              }}
              onSearchChange={setSearch}
              manualPagination={true}
            />
          )}
        </ComponentCard>
        <AlertDialogUtils
          title={t('deleteTitle')}
          content={t('deleteDescription')}
          confirmText={tUtils('confirm')}
          cancelText={tUtils('cancel')}
          onConfirm={() => handleDelete(selected?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
