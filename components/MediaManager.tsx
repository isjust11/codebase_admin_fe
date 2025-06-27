'use client';

import React, { useEffect, useState } from 'react';
import { Media, mediaApi, MediaQueryParams, MediaResponse } from '@/services/media-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, X, Check, Search } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaManagerProps {
  onSelect?: (media: Media | Media[]) => void;
  selectedMedia?: Media | Media[] | null;
  multiple?: boolean;
}

export function MediaManager({ onSelect, selectedMedia, multiple = false }: MediaManagerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Media[]>(
    selectedMedia ? (Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia]) : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mimeType, setMimeType] = useState<string>('');
  const itemsPerPage = 12;

  const fetchMedia = async () => {
    try {
      const params: MediaQueryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        mimeType: mimeType || undefined,
      };
      const response = await mediaApi.getAll(params);
      setMedia(response);
      // setTotalPages(response.totalPages);
    } catch (_error) {
      toast.error('Không thể tải danh sách media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [currentPage, searchQuery, mimeType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedMedia = await mediaApi.upload(file);
        setMedia((prev) => Array.isArray(prev) ? [...prev, uploadedMedia] : [uploadedMedia]);
        if (onSelect) {
          onSelect(uploadedMedia);
        }
      }
      toast.success('Tải lên media thành công');
    } catch (_error) {
      toast.error('Có lỗi xảy ra khi tải lên media');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa media này?')) {
      try {
        await mediaApi.delete(id);
        setMedia((prev) => prev.filter((item) => item.id !== id));
        setSelectedItems((prev) => prev.filter((item) => item.id !== id));
        toast.success('Xóa media thành công');
      } catch (_error) {
        toast.error('Có lỗi xảy ra');
      }
    }
  };

  const handleSelect = (item: Media) => {
    if (multiple) {
      const isSelected = selectedItems.some((selected) => selected.id === item.id);
      const newSelected = isSelected
        ? selectedItems.filter((selected) => selected.id !== item.id)
        : [...selectedItems, item];
      setSelectedItems(newSelected);
      if (onSelect) {
        onSelect(newSelected);
      }
    } else {
      setSelectedItems([item]);
      if (onSelect) {
        onSelect(item);
      }
    }
  };

  const handlePreview = (item: Media) => {
    const index = media.findIndex((m) => m.id === item.id);
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handlePrevPreview = () => {
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNextPreview = () => {
    setPreviewIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMimeTypeChange = (value: string) => {
    setMimeType(value);
    setCurrentPage(1);
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Quản lý Media</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Tải lên
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tải lên Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Chọn file</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*,audio/*"
                  multiple={multiple}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên file..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        <Select value={mimeType} onValueChange={handleMimeTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại file" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="image">Hình ảnh</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Âm thanh</SelectItem>
            <SelectItem value="application">Tài liệu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media && media.map((item) => (
          <div
            key={item.id}
            className={`relative group border rounded-lg overflow-hidden cursor-pointer ${
              selectedItems.some((selected) => selected.id === item.id)
                ? 'border-primary'
                : 'border-border'
            }`}
          >
            {item.mimeType.startsWith('image/') ? (
              <Image
                src={`http://localhost:4000${item.url}`}
                alt={item.originalName}
                width={200}
                height={200}
                className="object-cover w-full h-48"
                onClick={() => handlePreview(item)}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-muted">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <span className="flex items-center px-4">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Xem trước Media</span>
              <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video">
            {media && media[previewIndex]?.mimeType.startsWith('image/') ? (
              <Image
                src={media[previewIndex].url}
                alt={media[previewIndex].originalName}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePrevPreview}
                className="rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={handleNextPreview}
                className="rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Tên file: {media && media[previewIndex]?.originalName}</p>
            <p>Loại file: {media && media[previewIndex]?.mimeType}</p>
            <p>Kích thước: {media && (media[previewIndex]?.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 