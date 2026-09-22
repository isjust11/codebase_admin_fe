'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Action } from '@/types/actions';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import InviteQrCode from '@/components/InviteQrCode';
import { getEvent } from '@/services/event-api';
import {
  createEventGuest,
  deleteEventGuest,
  EventGuest,
  getEventGuests,
  getEventRsvpStats,
  personalInviteUrl,
  reactInviteUrl,
  RsvpStats,
  updateEventGuest,
} from '@/services/event-guest-api';
import { AppRoutes } from '@/constants';
import { useLoading } from '@/contexts/LoadingContext';
import {
  ArrowLeft,
  Copy,
  MoreHorizontal,
  Plus,
  QrCode,
  Share2,
  Trash,
} from 'lucide-react';
import EventShareDialog from '../../components/EventShareDialog';

function rsvpBadge(status?: string) {
  switch (status) {
    case 'ATTENDING':
      return <Badge className="bg-emerald-600">Tham dự</Badge>;
    case 'DECLINED':
      return <Badge variant="destructive">Từ chối</Badge>;
    case 'MAYBE':
      return <Badge variant="secondary">Chưa chắc</Badge>;
    default:
      return <Badge variant="outline">Chờ RSVP</Badge>;
  }
}

export default function EventGuestsPage() {
  const params = useParams();
  const eventId = params.id?.toString() || '';
  const { navigateTo } = useLoading();

  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [stats, setStats] = useState<RsvpStats>({});
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventGuest | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', group: '' });
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<EventGuest | null>(null);

  const [qrGuest, setQrGuest] = useState<EventGuest | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const loadMeta = async () => {
    try {
      const event = await getEvent(eventId);
      setEventTitle(event.title || '');
      setEventSlug(event.slug || '');
    } catch {
      toast.error('Không tải được sự kiện');
    }
  };

  const loadGuests = async (page: number, size: number, searchValue: string) => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getEventGuests(eventId, { page: page + 1, size, search: searchValue }),
        getEventRsvpStats(eventId).catch(() => ({})),
      ]);
      setGuests(listRes.data || []);
      setPageCount(listRes.totalPages || 0);
      setStats(statsRes || {});
    } catch {
      toast.error('Không tải được danh sách khách');
      setGuests([]);
      setPageCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) return;
    loadMeta();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    loadGuests(pageIndex, pageSize, search);
  }, [eventId, pageIndex, pageSize, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', group: '' });
    setFormOpen(true);
  };

  const openEdit = (guest: EventGuest) => {
    setEditing(guest);
    setForm({
      name: guest.name || '',
      phone: guest.phone || '',
      email: guest.email || '',
      group: guest.group || '',
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên khách');
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) {
        await updateEventGuest(eventId, String(editing.id), form);
        toast.success('Đã cập nhật khách mời');
      } else {
        await createEventGuest(eventId, form);
        toast.success('Đã thêm khách mời');
      }
      setFormOpen(false);
      loadGuests(pageIndex, pageSize, search);
    } catch {
      toast.error('Lưu khách mời thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteEventGuest(eventId, String(selected.id));
      toast.success('Đã xóa khách mời');
      setDeleteOpen(false);
      loadGuests(pageIndex, pageSize, search);
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const copyLink = async (guest: EventGuest) => {
    const url = personalInviteUrl(guest.publicToken, guest.invitationUrl);
    if (!url) {
      toast.error('Khách chưa có link thiệp');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link cá nhân');
    } catch {
      toast.error('Không sao chép được');
    }
  };

  const columns: ColumnDef<EventGuest>[] = [
    {
      accessorKey: 'name',
      header: 'Tên',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.group ? (
            <div className="text-xs text-stone-500">{row.original.group}</div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Liên hệ',
      cell: ({ row }) => (
        <div className="text-sm text-stone-600">
          <div>{row.original.phone || '—'}</div>
          <div className="text-xs">{row.original.email || ''}</div>
        </div>
      ),
    },
    {
      accessorKey: 'rsvpStatus',
      header: 'RSVP',
      cell: ({ row }) => (
        <div className="space-y-1">
          {rsvpBadge(row.original.rsvpStatus)}
          {row.original.plusOnes ? (
            <div className="text-xs text-stone-500">+{row.original.plusOnes}</div>
          ) : null}
        </div>
      ),
    },
    {
      id: 'link',
      header: 'Link thiệp',
      cell: ({ row }) => {
        const url = personalInviteUrl(row.original.publicToken, row.original.invitationUrl);
        return url ? (
          <code className="block max-w-[180px] truncate text-xs text-stone-500" title={url}>
            {url}
          </code>
        ) : (
          <span className="text-xs text-stone-400">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const guest = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white shadow-sm">
              <DropdownMenuItem className="cursor-pointer" onClick={() => copyLink(guest)}>
                <Copy className="mr-2 h-4 w-4" /> Copy link cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setQrGuest(guest)}>
                <QrCode className="mr-2 h-4 w-4" /> QR cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(guest)}>
                Sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600"
                onClick={() => {
                  setSelected(guest);
                  setDeleteOpen(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const actions: Action[] = [
    {
      icon: <ArrowLeft className="mr-2 h-4 w-4" />,
      onClick: () => navigateTo(AppRoutes.Manager.Events),
      title: 'Danh sách sự kiện',
      variant: 'outline',
    },
    {
      icon: <Share2 className="mr-2 h-4 w-4" />,
      onClick: () => setShareOpen(true),
      title: 'Chia sẻ thiệp chung',
      variant: 'outline',
    },
    {
      icon: <Plus className="mr-2 h-4 w-4" />,
      onClick: openCreate,
      title: 'Thêm khách',
      className: 'text-blue-600',
    },
  ];

  const publicUrl = reactInviteUrl(eventSlug);

  return (
    <div>
      <PageBreadcrumb pageTitle={`Khách mời · ${eventTitle || 'Event'}`} />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng', value: stats.total ?? guests.length },
          { label: 'Tham dự', value: stats.ATTENDING ?? 0 },
          { label: 'Từ chối', value: stats.DECLINED ?? 0 },
          { label: 'Chờ RSVP', value: stats.PENDING ?? 0 },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-stone-500">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold text-stone-900">{item.value}</div>
          </div>
        ))}
      </div>

      <ComponentCard title="Quản lý khách mời" listAction={actions}>
        {publicUrl ? (
          <p className="mb-4 text-sm text-stone-500">
            Thiệp công khai:{' '}
            <a className="text-stone-800 underline" href={publicUrl} target="_blank" rel="noreferrer">
              {publicUrl}
            </a>
          </p>
        ) : (
          <p className="mb-4 text-sm text-amber-700">
            Sự kiện chưa có slug — cập nhật sự kiện để có link thiệp React Host.
          </p>
        )}

        {loading ? (
          <div className="py-8 text-center text-stone-500">Đang tải...</div>
        ) : (
          <DataTable
            columns={columns}
            data={guests}
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

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa khách mời' : 'Thêm khách mời'}</DialogTitle>
            <DialogDescription>
              Mỗi khách nhận link `/e/:token` riêng để RSVP cá nhân.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Họ tên *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Điện thoại</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Nhóm (bạn nhà trai / nhà gái…)</Label>
              <Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!qrGuest} onOpenChange={(open) => !open && setQrGuest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR thiệp · {qrGuest?.name}</DialogTitle>
            <DialogDescription>Quét để mở link cá nhân của khách.</DialogDescription>
          </DialogHeader>
          {qrGuest ? (
            <InviteQrCode
              value={personalInviteUrl(qrGuest.publicToken, qrGuest.invitationUrl) || ''}
              fileName={`guest-${qrGuest.name || 'invite'}`}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <EventShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        event={{ id: eventId, title: eventTitle, slug: eventSlug }}
      />

      <AlertDialogUtils
        title="Xóa khách mời"
        content={`Xóa "${selected?.name}"? Link thiệp cá nhân sẽ hết hiệu lực.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleDelete}
        isOpen={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
