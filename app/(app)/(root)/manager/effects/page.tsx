'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import Badge from '@/components/ui/badge/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { useModal } from '@/hooks/useModal';
import { Action } from '@/types/actions';
import { InviteEffect, InviteEffectKind } from '@/types/invite-effect';
import { createInviteEffect, deleteInviteEffect, getInviteEffects, updateInviteEffect } from '@/services/manager-api';

const KINDS: InviteEffectKind[] = ['burst', 'ambient', 'gate', 'scroll', 'audio'];

const EMPTY: Partial<InviteEffect> = {
  slug: '',
  themeKey: '',
  name: '',
  description: '',
  kind: 'ambient',
  defaultEnabled: true,
  isActive: true,
  sortOrder: 0,
};

export default function EffectsPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const [rows, setRows] = useState<InviteEffect[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InviteEffect | null>(null);
  const [draft, setDraft] = useState<Partial<InviteEffect>>(EMPTY);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    const result = await getInviteEffects({ page: pageIndex + 1, size: pageSize, search });
    setRows(result.data || []);
    setPageCount(Math.ceil((result.total || 0) / pageSize));
  };

  useEffect(() => {
    load().catch(() => toast.error('Không tải được kho hiệu ứng'));
  }, [pageIndex, pageSize, search]);

  const openCreate = () => {
    setSelected(null);
    setDraft(EMPTY);
    openModal();
  };

  const openEdit = (effect: InviteEffect) => {
    setSelected(effect);
    setDraft(effect);
    openModal();
  };

  const save = async () => {
    try {
      if (selected) {
        await updateInviteEffect(selected.id, draft);
        toast.success('Đã cập nhật hiệu ứng');
      } else {
        await createInviteEffect(draft);
        toast.success('Đã thêm hiệu ứng');
      }
      closeModal();
      await load();
    } catch {
      toast.error('Không lưu được hiệu ứng');
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      await deleteInviteEffect(selected.id);
      toast.success('Đã xóa hiệu ứng');
      await load();
    } catch {
      toast.error('Không xóa được hiệu ứng');
    } finally {
      setConfirmOpen(false);
    }
  };

  const actions: Action[] = [
    {
      icon: <Plus className="mr-2 h-4 w-4" />,
      title: 'Thêm hiệu ứng',
      onClick: openCreate,
      className: 'hover:bg-blue-100 rounded-md text-blue-500',
    },
  ];

  const columns: ColumnDef<InviteEffect>[] = [
    { accessorKey: 'name', header: 'Tên' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'themeKey', header: 'Theme key' },
    { accessorKey: 'kind', header: 'Loại' },
    {
      accessorKey: 'defaultEnabled',
      header: 'Mặc định',
      cell: ({ row }) => (row.original.defaultEnabled ? 'Bật' : 'Tắt'),
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant="light" color={row.original.isActive ? 'success' : 'error'}>
          {row.original.isActive ? 'Đang dùng' : 'Ẩn'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-sm">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                setSelected(row.original);
                setConfirmOpen(true);
              }}
            >
              <Trash className="mr-2 h-4 w-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle="Kho hiệu ứng" />
      <ComponentCard title="Hiệu ứng thiệp" listAction={actions}>
        <p className="mb-4 text-sm text-stone-500">
          Danh sách này là nguồn trên server. Form tạo template đọc các hiệu ứng đang dùng. Slug phải khớp component trong package hiệu ứng thì thiệp mới vẽ được.
        </p>
        <DataTable
          columns={columns}
          data={rows}
          pageCount={pageCount}
          onPaginationChange={(nextPage, nextSize) => {
            setPageIndex(nextPage);
            setPageSize(nextSize);
          }}
          onSearchChange={setSearch}
          onSizeChange={setPageSize}
          manualPagination
        />
      </ComponentCard>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[640px] p-6" modalSize="2xl">
        <h4 className="mb-6 text-lg font-semibold text-gray-800">{selected ? 'Sửa hiệu ứng' : 'Thêm hiệu ứng'}</h4>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Tên</Label>
              <Input value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block">Slug</Label>
              <Input value={draft.slug || ''} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="confetti" />
            </div>
            <div>
              <Label className="mb-1.5 block">Theme key</Label>
              <Input value={draft.themeKey || ''} onChange={(e) => setDraft({ ...draft, themeKey: e.target.value })} placeholder="effectConfetti" />
            </div>
            <div>
              <Label className="mb-1.5 block">Loại</Label>
              <select
                className="h-10 w-full rounded-md border border-stone-200 px-3 text-sm"
                value={draft.kind || 'ambient'}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value as InviteEffectKind })}
              >
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Mô tả</Label>
            <Textarea value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Switch checked={draft.defaultEnabled !== false} onCheckedChange={(checked) => setDraft({ ...draft, defaultEnabled: checked })} />
              Bật mặc định
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={draft.isActive !== false} onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })} />
              Đang dùng
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>Hủy</Button>
            <Button type="button" onClick={save}>Lưu</Button>
          </div>
        </div>
      </Modal>

      <AlertDialogUtils
        isOpen={confirmOpen}
        type="warning"
        title="Xóa hiệu ứng"
        content="Hiệu ứng sẽ biến khỏi form tạo template. Thiệp đã lưu vẫn giữ giá trị theme cũ."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={remove}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
