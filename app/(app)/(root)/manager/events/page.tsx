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
  Share2,
  QrCode,
  Users,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
} from 'lucide-react';
import { deleteEvent, getEvents, EventDto } from '@/services/event-api';
import { reactInviteUrl } from '@/services/event-guest-api';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { cn, mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Action } from '@/types/actions';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Badge } from '@/components/ui/badge';
import { AppRoutes } from '@/constants';
import EventShareDialog from './components/EventShareDialog';

type ViewMode = 'list' | 'grid';

export default function EventList() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<EventDto | null>(null);
  const [shareEvent, setShareEvent] = useState<EventDto | null>(null);

  const activeSearch = view === 'grid' ? gridSearch : search;

  const fetchEvents = async (page: number, size: number, searchValue: string) => {
    setLoading(true);
    try {
      const response = await getEvents({ page: page + 1, size, search: searchValue });
      setEvents(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch {
      toast.error('Could not load events');
      setEvents([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(pageIndex, pageSize, activeSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search, gridSearch, view]);

  const handleDelete = async (id: string | number | undefined) => {
    if (!id) return;
    try {
      await deleteEvent(String(id));
      fetchEvents(pageIndex, pageSize, activeSearch);
      toast.success('Event deleted successfully');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const statusLabel = (value?: string) => {
    switch (value) {
      case 'DRAFT':
        return 'Draft';
      case 'PUBLISHED':
        return 'Published';
      case 'CANCELLED':
        return 'Cancelled';
      case 'COMPLETED':
        return 'Completed';
      default:
        return value || 'Draft';
    }
  };

  const openShare = (item: EventDto) => {
    if (!item.slug && !item.reactInviteUrl) {
      toast.error('Sự kiện chưa có slug — cập nhật sự kiện trước khi chia sẻ');
      return;
    }
    setShareEvent(item);
  };

  const renderItemActions = (item: EventDto) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xs bg-white shadow-sm">
        <DropdownMenuItem
          className="cursor-pointer px-4 py-2 text-blue-500 hover:bg-blue-300"
          onClick={() => navigateTo(`${AppRoutes.Manager.EventsUpdate}/${item.id}`)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer px-4 py-2" onClick={() => openShare(item)}>
          <Share2 className="mr-2 h-4 w-4" /> Chia sẻ link + QR
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer px-4 py-2"
          onClick={() => navigateTo(`${AppRoutes.Manager.Events}/${item.id}/guests`)}
        >
          <Users className="mr-2 h-4 w-4" /> Quản lý khách mời
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer px-4 py-2" onClick={() => openShare(item)}>
          <QrCode className="mr-2 h-4 w-4" /> Mã QR thiệp
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer px-4 py-2 text-red-600 hover:bg-red-300"
          onClick={() => {
            setSelected(item);
            setIsOpen(true);
          }}
        >
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns: ColumnDef<EventDto>[] = [
    {
      accessorKey: 'coverImageUrl',
      header: 'Cover',
      cell: ({ row }) => {
        const url = row.original.coverImageUrl;
        if (!url) {
          return (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-200">
              <ImageOff className="h-8 w-8 text-gray-500" />
            </div>
          );
        }
        return (
          <Image
            src={mergeImageUrl(url)}
            alt={row.original.title}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-md object-cover"
          />
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          {row.original.slug ? (
            <code className="text-xs text-stone-500">{row.original.slug}</code>
          ) : null}
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type' },
    {
      accessorKey: 'eventDate',
      header: 'Date',
      cell: ({ row }) => {
        if (!row.original.eventDate) return null;
        return new Date(row.original.eventDate).toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.original.status || 'DRAFT';
        return (
          <Badge
            variant={
              value === 'PUBLISHED' ? 'default' : value === 'COMPLETED' ? 'secondary' : 'outline'
            }
          >
            {statusLabel(value)}
          </Badge>
        );
      },
    },
    {
      id: 'invite',
      header: 'Invite',
      cell: ({ row }) => {
        const url = row.original.reactInviteUrl || reactInviteUrl(row.original.slug);
        return url ? (
          <button
            type="button"
            className="max-w-[140px] truncate text-left text-xs text-blue-600 underline"
            onClick={() => openShare(row.original)}
            title={url}
          >
            Share / QR
          </button>
        ) : (
          <span className="text-xs text-stone-400">No slug</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => renderItemActions(row.original),
    },
  ];

  const lstActions: Action[] = [
    {
      icon: <Plus className="mr-2 h-4 w-4" />,
      onClick: () => navigateTo(AppRoutes.Manager.EventsCreate),
      title: 'Add Event',
      className: 'rounded-md text-blue-500 transition-colors hover:bg-blue-100 dark:hover:bg-blue-800',
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Events Management" />
      <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        <p className="font-medium text-stone-800">Tạo / sửa sự kiện theo 4 bước</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Thông tin & cover</li>
          <li>Chọn template (React package)</li>
          <li>Điền nội dung slots + live preview</li>
          <li>Xem lại → lưu → quản lý khách / QR</li>
        </ol>
      </div>
      <div className="space-y-6">
        <ComponentCard title="Events" listAction={lstActions}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500">Grid giúp xem cover và mở chia sẻ / khách mời nhanh hơn.</p>
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
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : view === 'list' ? (
            <DataTable
              columns={columns}
              data={events}
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
                  placeholder="Tìm theo tiêu đề, slug…"
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

              {events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
                  Chưa có sự kiện nào phù hợp.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {events.map((item) => {
                    const value = item.status || 'DRAFT';
                    const invite = item.reactInviteUrl || reactInviteUrl(item.slug);
                    return (
                      <div
                        key={String(item.id)}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-stone-300"
                      >
                        <button
                          type="button"
                          className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100"
                          onClick={() => navigateTo(`${AppRoutes.Manager.EventsUpdate}/${item.id}`)}
                        >
                          {item.coverImageUrl ? (
                            <Image
                              src={mergeImageUrl(item.coverImageUrl)}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-stone-400">
                              <ImageOff className="h-10 w-10" />
                            </div>
                          )}
                          <div className="absolute left-3 top-3">
                            <Badge
                              variant={
                                value === 'PUBLISHED'
                                  ? 'default'
                                  : value === 'COMPLETED'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="bg-white/90 backdrop-blur"
                            >
                              {statusLabel(value)}
                            </Badge>
                          </div>
                        </button>

                        <div className="flex flex-1 flex-col gap-2 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <button
                              type="button"
                              className="min-w-0 text-left"
                              onClick={() => navigateTo(`${AppRoutes.Manager.EventsUpdate}/${item.id}`)}
                            >
                              <div className="line-clamp-1 font-semibold text-stone-900">{item.title}</div>
                              {item.slug ? (
                                <code className="mt-0.5 block truncate text-xs text-stone-500">{item.slug}</code>
                              ) : null}
                            </button>
                            {renderItemActions(item)}
                          </div>

                          <div className="space-y-1 text-xs text-stone-500">
                            {item.eventDate ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                              </div>
                            ) : null}
                            {item.venue ? (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="line-clamp-1">{item.venue}</span>
                              </div>
                            ) : null}
                            {item.type ? <div className="text-stone-400">{item.type}</div> : null}
                          </div>

                          <div className="mt-auto flex flex-wrap gap-2 pt-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => openShare(item)}
                              disabled={!invite}
                            >
                              <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => navigateTo(`${AppRoutes.Manager.Events}/${item.id}/guests`)}
                            >
                              <Users className="mr-1.5 h-3.5 w-3.5" /> Khách
                            </Button>
                          </div>
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

        <EventShareDialog
          open={!!shareEvent}
          onOpenChange={(open) => !open && setShareEvent(null)}
          event={shareEvent}
        />

        <AlertDialogUtils
          title="Delete Event"
          content="Are you sure you want to delete this event?"
          confirmText="Confirm"
          cancelText="Cancel"
          onConfirm={() => handleDelete(selected?.id)}
          isOpen={isOpen}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}
