'use client';

import { useEffect, useRef, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  LayoutGrid,
  List,
  MoreHorizontal,
  Music,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import Badge from '@/components/ui/badge/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialogUtils } from '@/components/AlertDialogUtils';
import { useModal } from '@/hooks/useModal';
import { Action } from '@/types/actions';
import { MusicLibraryTrack } from '@/types/music-library';
import { cn } from '@/lib/utils';
import {
  createMusicLibraryTrack,
  deleteMusicLibraryTrack,
  getMusicLibraryTracks,
  updateMusicLibraryTrack,
  uploadMusicLibraryTrack,
} from '@/services/manager-api';

const EMPTY: Partial<MusicLibraryTrack> = {
  slug: '',
  name: '',
  mood: '',
  url: '',
  isActive: true,
  sortOrder: 0,
};

type ViewMode = 'list' | 'grid';

export default function MusicLibraryPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rows, setRows] = useState<MusicLibraryTrack[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MusicLibraryTrack | null>(null);
  const [draft, setDraft] = useState<Partial<MusicLibraryTrack>>(EMPTY);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<ViewMode>('grid');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [gridSearch, setGridSearch] = useState('');

  const load = async () => {
    const result = await getMusicLibraryTracks({
      page: pageIndex + 1,
      size: pageSize,
      search: view === 'grid' ? gridSearch : search,
    });
    setRows(result.data || []);
    setPageCount(Math.ceil((result.total || 0) / pageSize));
  };

  useEffect(() => {
    load().catch(() => toast.error('Không tải được thư viện nhạc'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, search, gridSearch, view]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingId(null);
  };

  const togglePlay = async (track: MusicLibraryTrack) => {
    if (!track.url) {
      toast.error('Bài này chưa có URL');
      return;
    }
    if (playingId === track.id) {
      stopPlayback();
      return;
    }
    stopPlayback();
    const audio = new Audio(track.url);
    audioRef.current = audio;
    setPlayingId(track.id);
    try {
      await audio.play();
      audio.onended = () => setPlayingId(null);
    } catch {
      setPlayingId(null);
      toast.error('Chưa phát được bản xem thử');
    }
  };

  const openCreate = () => {
    stopPlayback();
    setSelected(null);
    setDraft(EMPTY);
    openModal();
  };

  const openEdit = (track: MusicLibraryTrack) => {
    stopPlayback();
    setSelected(track);
    setDraft(track);
    openModal();
  };

  const save = async () => {
    try {
      if (selected) {
        await updateMusicLibraryTrack(selected.id, draft);
        toast.success('Đã cập nhật bài nhạc');
      } else {
        if (!draft.url?.trim()) {
          toast.error('Nhập URL hoặc tải file nhạc lên');
          return;
        }
        await createMusicLibraryTrack(draft);
        toast.success('Đã thêm bài nhạc');
      }
      closeModal();
      await load();
    } catch {
      toast.error('Không lưu được bài nhạc');
    }
  };

  const remove = async () => {
    if (!selected) return;
    try {
      if (playingId === selected.id) stopPlayback();
      await deleteMusicLibraryTrack(selected.id);
      toast.success('Đã xóa bài nhạc');
      await load();
    } catch {
      toast.error('Không xóa được bài nhạc');
    } finally {
      setConfirmOpen(false);
    }
  };

  const onUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      toast.error('Chỉ nhận file audio (mp3, wav, m4a,…)');
      return;
    }
    setUploading(true);
    try {
      await uploadMusicLibraryTrack(file, {
        name: draft.name || undefined,
        slug: draft.slug || undefined,
        mood: draft.mood || undefined,
        sortOrder: draft.sortOrder,
        isActive: draft.isActive !== false,
      });
      toast.success('Đã tải lên và thêm vào thư viện');
      closeModal();
      setSelected(null);
      setDraft(EMPTY);
      await load();
    } catch {
      toast.error('Tải nhạc lên chưa thành công');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const actions: Action[] = [
    {
      icon: <Plus className="mr-2 h-4 w-4" />,
      title: 'Thêm bài nhạc',
      onClick: openCreate,
      className: 'hover:bg-blue-100 rounded-md text-blue-500',
    },
  ];

  const columns: ColumnDef<MusicLibraryTrack>[] = [
    {
      accessorKey: 'name',
      header: 'Tên',
      cell: ({ row }) => (
        <div className="min-w-[160px]">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-stone-500">{row.original.mood || '—'}</div>
        </div>
      ),
    },
    { accessorKey: 'slug', header: 'Slug' },
    {
      id: 'preview',
      header: 'Nghe thử',
      cell: ({ row }) =>
        row.original.url ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => void togglePlay(row.original)}
            >
              {playingId === row.original.id ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <audio controls preload="none" className="h-8 max-w-[180px]" src={row.original.url} />
          </div>
        ) : (
          '—'
        ),
    },
    {
      accessorKey: 'sortOrder',
      header: 'Thứ tự',
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
      <PageBreadcrumb pageTitle="Thư viện nhạc" />
      <ComponentCard title="Nhạc nền thiệp" listAction={actions}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-500">
            Danh sách này hiện trên landing khi khách chọn nhạc có sẵn. Grid giúp nghe thử nhanh hơn.
          </p>
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

        {view === 'list' ? (
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
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={gridSearch}
                onChange={(e) => {
                  setPageIndex(0);
                  setGridSearch(e.target.value);
                }}
                placeholder="Tìm theo tên, slug, mood…"
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

            {rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-6 py-16 text-center text-sm text-stone-500">
                Chưa có bài nhạc nào phù hợp.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {rows.map((track) => {
                  const isPlaying = playingId === track.id;
                  return (
                    <div
                      key={track.id}
                      className={cn(
                        'group flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition',
                        isPlaying ? 'border-fuchsia-300 ring-2 ring-fuchsia-100' : 'border-stone-200 hover:border-stone-300',
                      )}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => void togglePlay(track)}
                          className={cn(
                            'grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition',
                            isPlaying
                              ? 'bg-fuchsia-600 text-white'
                              : 'bg-gradient-to-br from-fuchsia-50 to-rose-50 text-fuchsia-700 group-hover:from-fuchsia-100 group-hover:to-rose-100',
                          )}
                          aria-label={isPlaying ? `Dừng ${track.name}` : `Nghe ${track.name}`}
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                        </button>
                        <div className="flex items-center gap-1">
                          <Badge variant="light" color={track.isActive ? 'success' : 'error'}>
                            {track.isActive ? 'Đang dùng' : 'Ẩn'}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white shadow-sm">
                              <DropdownMenuItem onClick={() => openEdit(track)}>
                                <Pencil className="mr-2 h-4 w-4" /> Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelected(track);
                                  setConfirmOpen(true);
                                }}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <button type="button" onClick={() => void togglePlay(track)} className="mb-3 text-left">
                        <div className="line-clamp-1 font-semibold text-stone-900">{track.name}</div>
                        <div className="mt-0.5 line-clamp-1 text-xs text-stone-500">{track.mood || track.slug}</div>
                      </button>

                      {track.url ? (
                        <audio
                          controls
                          preload="none"
                          className="mt-auto h-9 w-full"
                          src={track.url}
                          onPlay={() => {
                            // Keep card play-state in sync when using native controls
                            if (playingId && playingId !== track.id) {
                              audioRef.current?.pause();
                            }
                            setPlayingId(track.id);
                          }}
                          onPause={() => {
                            if (playingId === track.id) setPlayingId(null);
                          }}
                        />
                      ) : (
                        <p className="mt-auto text-xs text-stone-400">Chưa có file</p>
                      )}
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[640px] p-6" modalSize="2xl">
        <h4 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Music className="h-5 w-5 text-fuchsia-700" />
          {selected ? 'Sửa bài nhạc' : 'Thêm bài nhạc'}
        </h4>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Tên</Label>
              <Input
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Giai điệu ấm áp"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Slug</Label>
              <Input
                value={draft.slug || ''}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="warm-melody"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Tâm trạng / mô tả ngắn</Label>
            <Input
              value={draft.mood || ''}
              onChange={(e) => setDraft({ ...draft, mood: e.target.value })}
              placeholder="Dịu dàng · piano"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">URL nhạc</Label>
            <Input
              value={draft.url || ''}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              placeholder="https://…"
            />
            {draft.url ? <audio controls className="mt-2 h-9 w-full" src={draft.url} /> : null}
          </div>
          {!selected ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4">
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => void onUpload(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Đang tải lên…' : 'Hoặc tải file MP3 lên kho hệ thống'}
              </Button>
              <p className="mt-2 text-center text-xs text-stone-500">
                Upload sẽ tự tạo bài mới (có thể điền tên/slug trước).
              </p>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Thứ tự</Label>
              <Input
                type="number"
                value={draft.sortOrder ?? 0}
                onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end gap-2 pb-1 text-sm">
              <Switch
                checked={draft.isActive !== false}
                onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
              />
              Đang dùng trên landing
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="button" onClick={save} disabled={uploading}>
              Lưu
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDialogUtils
        isOpen={confirmOpen}
        type="warning"
        title="Xóa bài nhạc"
        content="Bài sẽ biến khỏi thư viện mặc định trên landing. Thiệp đã chọn URL này vẫn giữ link cũ."
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={remove}
        onOpenChange={setConfirmOpen}
      />
    </div>
  );
}
