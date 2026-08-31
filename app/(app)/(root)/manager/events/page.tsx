'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash, MoreHorizontal, ImageOff, Eye } from 'lucide-react';
import { deleteEvent, getEvents, EventDto } from '@/services/event-api';
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
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { Badge } from '@/components/ui/badge';
import { AppRoutes } from '@/constants';

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

  const fetchEvents = async (page: number, size: number, searchValue: string) => {
    setLoading(true);
    try {
      const response = await getEvents({ page: page + 1, size, search: searchValue });
      setEvents(response.data || []);
      setPageCount(response.totalPages || 0);
    } catch (_error) {
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
    } catch (_error) {
      toast.error('Failed to delete event');
    }
  };

  const statusLabel = (value?: string) => {
    switch (value) {
      case 'DRAFT': return 'Draft';
      case 'PUBLISHED': return 'Published';
      case 'CANCELLED': return 'Cancelled';
      case 'COMPLETED': return 'Completed';
      default: return value || 'Draft';
    }
  };

  const columns: ColumnDef<EventDto>[] = [
    {
      accessorKey: 'coverImageUrl',
      header: 'Cover',
      cell: ({ row }) => {
        const url = row.original.coverImageUrl;
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
            alt={row.original.title}
            width={64}
            height={64}
            unoptimized
            className="w-16 h-16 object-cover rounded-md"
          />
        );
      },
    },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'type', header: 'Type' },
    {
      accessorKey: 'eventDate',
      header: 'Date',
      cell: ({ row }) => {
        if (!row.original.eventDate) return null;
        return new Date(row.original.eventDate).toLocaleDateString();
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.original.status || 'DRAFT';
        return (
          <Badge variant={value === 'PUBLISHED' ? 'default' : value === 'COMPLETED' ? 'secondary' : 'outline'}>
            {statusLabel(value)}
          </Badge>
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
            <DropdownMenuContent align="end" className="bg-white shadow-sm rounded-xs">
              <DropdownMenuItem
                className="flex flex-start px-4 py-2 cursor-pointer hover:bg-blue-300 text-blue-500"
                onClick={() => navigateTo(`${AppRoutes.Manager.EventsUpdate}/${item.id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 flex flex-start px-4 py-2 cursor-pointer hover:bg-red-300"
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
      icon: <Plus className="w-4 h-4 mr-2" />,
      onClick: () => navigateTo(AppRoutes.Manager.EventsCreate),
      title: 'Add Event',
      className: 'hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500',
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Events Management" />
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
