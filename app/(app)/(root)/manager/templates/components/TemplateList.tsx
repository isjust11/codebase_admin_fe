'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Pencil,
  Trash,
  MoreHorizontal,
  ImageOff,
  Eye,
  Check,
  XCircle,
  Send,
  EyeOff,
  LayoutGrid,
  List,
} from 'lucide-react';
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
import { cn, mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Action } from '@/types/actions';
import { Template } from '@/types/template';
import { useTranslations } from 'next-intl';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import Badge from '@/components/ui/badge/Badge';
import { AppRoutes } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';

type StatusFilter = '' | 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
type ViewMode = 'list' | 'grid';

export default function TemplateList({ mine = false }: { mine?: boolean }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
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

  const activeSearch = view === 'grid' ? gridSearch : search;

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
    fetchTemplates(pageIndex, pageSize, activeSearch, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search, gridSearch, status, mine, view]);

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    try {
      await deleteTemplate(id);
      fetchTemplates(pageIndex, pageSize, activeSearch, status);
      toast.success(t('messages.deleteSuccess'));
      setIsOpen(false);
    } catch (_error) {
      toast.error(t('messages.deleteError'));
    } finally {
      setIsOpen(false);
    }
  };

  const handlePublish = async (item: Template) => {
    if (!item.id) return;
    try {
      await publishTemplate(item.id, !item.isPublished);
      fetchTemplates(pageIndex, pageSize, activeSearch, status);
      toast.success(t('messages.publishSuccess'));
    } catch (_error) {
      toast.error(t('messages.publishError'));
    }
  };

  const handleSubmit = async (item: Template) => {
    if (!item.id) return;
    try {
      await submitTemplate(item.id);
      fetchTemplates(pageIndex, pageSize, activeSearch, status);
      toast.success(t('messages.submitSuccess'));
    } catch (_error) {
      toast.error(t('messages.submitError'));
    }
  };

  const handleApprove = async (item: Template) => {
    if (!item.id) return;
    try {
      await approveTemplate(item.id);
      fetchTemplates(pageIndex, pageSize, activeSearch, status);
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
      fetchTemplates(pageIndex, pageSize, activeSearch, status);
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

  const statusColor = (value?: string): 'success' | 'info' | 'error' | 'warning' => {
    switch (value) {
      case 'PUBLISHED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'info';
    }
  };

  const renderItemActions = (item: Template) => {
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
              className="flex flex-start px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-300"
              onClick={() => window.open(`/template-preview/${item.id}`, '_blank')}
            >
              <Eye className="mr-2 h-4 w-4" /> {t('publicPreview')}
            </DropdownMenuItem>
          )}
          {(value === 'DRAFT' || value === 'REJECTED') && (
            <DropdownMenuItem
              className="flex flex-start px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-300"
              onClick={() => handleSubmit(item)}
            >
              <Send className="mr-2 h-4 w-4" /> {t('submitReview')}
            </DropdownMenuItem>
          )}
          {canApprove && value === 'PENDING' && (
            <DropdownMenuItem
              className="flex flex-start px-4 py-2 text-green-600 cursor-pointer hover:bg-green-300"
              onClick={() => handleApprove(item)}
            >
              <Check className="mr-2 h-4 w-4" /> {t('approve')}
            </DropdownMenuItem>
          )}
          {canReject && value === 'PENDING' && (
            <DropdownMenuItem
              className="flex flex-start px-4 py-2 cursor-pointer text-orange-600 hover:bg-orange-300"
              onClick={() => handleReject(item)}
            >
              <XCircle className="mr-2 h-4 w-4" /> {t('reject')}
            </DropdownMenuItem>
          )}
          {canPublish && (
            <DropdownMenuItem
              className="flex flex-start px-4 py-2 cursor-pointer hover:bg-yellow-200 text-yellow-600"
              onClick={() => handlePublish(item)}
            >
              <EyeOff className="mr-2 h-4 w-4" /> {item.isPublished ? t('unpublish') : t('publish')}
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
    {
      accessorKey: 'slug',
      header: t('packageSlug'),
      cell: ({ row }) => (
        <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-700">
          {row.original.slug || '—'}
        </code>
      ),
    },
    { accessorKey: 'type', header: t('type') },
    {
      id: 'premium',
      header: t('premium'),
      cell: ({ row }) =>
        row.original.isPremium ? (
          <Badge variant="light" color="primary">
            {t('premium')}
          </Badge>
        ) : (
          <Badge variant="light" color="info">
            —
          </Badge>
        ),
    },
    {
      accessorKey: 'status',
      header: t('status'),
      cell: ({ row }) => {
        const value = row.original.status || (row.original.isPublished ? 'PUBLISHED' : 'DRAFT');
        return (
          <Badge variant="light" color={statusColor(value)}>
            {statusLabel(value)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: ({ row }) => renderItemActions(row.original),
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {!mine ? (
              <div className="flex flex-wrap gap-2">
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
            ) : (
              <p className="text-sm text-stone-500">Xem dạng lưới để duyệt thumbnail thiệp nhanh hơn.</p>
            )}
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setView('grid');
                  setPageSize(12);
                  setPageIndex(0);
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  view === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800',
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('list');
                  setPageSize(10);
                  setPageIndex(0);
                }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                  view === 'list' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800',
                )}
              >
                <List className="h-3.5 w-3.5" /> Danh sách
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">{tUtils('loading')}</span>
            </div>
          ) : view === 'list' ? (
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
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={gridSearch}
                  onChange={(e) => {
                    setPageIndex(0);
                    setGridSearch(e.target.value);
                  }}
                  placeholder="Tìm theo tên, slug…"
                  className="max-w-sm"
                />
                <select
                  className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageIndex(0);
                    setPageSize(Number(e.target.value) || 12);
                  }}
                >
                  {[12, 24, 36].map((n) => (
                    <option key={n} value={n}>
                      {n} / trang
                    </option>
                  ))}
                </select>
              </div>

              {templates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
                  Chưa có thiệp nào phù hợp.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {templates.map((item) => {
                    const value = item.status || (item.isPublished ? 'PUBLISHED' : 'DRAFT');
                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300"
                      >
                        <button
                          type="button"
                          className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100"
                          onClick={() => navigateTo(`${AppRoutes.Manager.TemplatesUpdate}/${item.id}`)}
                        >
                          {item.thumbnailUrl ? (
                            <Image
                              src={mergeImageUrl(item.thumbnailUrl)}
                              alt={item.name}
                              fill
                              unoptimized
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-400">
                              <ImageOff className="h-10 w-10" />
                            </div>
                          )}
                        </button>

                        <div className="flex flex-1 flex-col gap-2 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              className="min-w-0 text-left"
                              onClick={() => navigateTo(`${AppRoutes.Manager.TemplatesUpdate}/${item.id}`)}
                            >
                              <div className="line-clamp-1 font-semibold text-stone-900">{item.name}</div>
                              <div className="mt-0.5 line-clamp-1 text-xs text-stone-500">
                                {item.slug || item.type || '—'}
                              </div>
                            </button>
                            {renderItemActions(item)}
                          </div>

                          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                            <Badge variant="light" color={statusColor(value)}>
                              {statusLabel(value)}
                            </Badge>
                            {item.isPremium ? (
                              <Badge variant="light" color="primary">
                                {t('premium')}
                              </Badge>
                            ) : null}
                            {item.type ? (
                              <Badge variant="light" color="info">
                                {item.type}
                              </Badge>
                            ) : null}
                          </div>

                          {value === 'PUBLISHED' && item.id ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-1 w-full"
                              onClick={() => window.open(`/template-preview/${item.id}`, '_blank')}
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" /> {t('publicPreview')}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pageCount > 1 ? (
                <div className="flex items-center justify-between gap-2 pt-2">
                  <p className="text-xs text-stone-500">
                    Trang {pageIndex + 1} / {pageCount}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pageIndex <= 0}
                      onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    >
                      Trước
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pageIndex >= pageCount - 1}
                      onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
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
