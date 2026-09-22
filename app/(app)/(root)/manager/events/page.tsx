'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Pencil,
  Trash,
  MoreHorizontal,
  ImageOff,
  Share2,
  QrCode,
  Users,
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
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { Action } from '@/types/actions';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Badge } from '@/components/ui/badge';
import { AppRoutes } from '@/constants';
import EventShareDialog from './components/EventShareDialog';

export default function EventList() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<EventDto | null>(null);
  const [shareEvent, setShareEvent] = useState<EventDto | null>(null);

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
    fetchEvents(pageIndex, pageSize, search);
  }, [pageIndex, pageSize, search]);

  const handleDelete = async (id: string | number | undefined) => {
    if (!id) return;
    try {
      await deleteEvent(String(id));
      fetchEvents(pageIndex, pageSize, search);
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
      cell: ({ row }) => {
        const item = row.original;
        return (
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
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2"
                onClick={() => openShare(item)}
              >
                <Share2 className="mr-2 h-4 w-4" /> Chia sẻ link + QR
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2"
                onClick={() => navigateTo(`${AppRoutes.Manager.Events}/${item.id}/guests`)}
              >
                <Users className="mr-2 h-4 w-4" /> Quản lý khách mời
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2"
                onClick={() => openShare(item)}
              >
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
      },
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : (
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
