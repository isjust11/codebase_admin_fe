'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Media, mediaApi, MediaQueryParams, MediaResponse } from '@/services/media-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight, X, Check, Search, ImageOff, Info, Pen, Save } from 'lucide-react';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from './ui/modal';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { type Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AlertDialogUtils } from './AlertDialogUtils';
import { useTranslations } from 'next-intl';
import ImageCrop from './react-crop/imageCrop';

interface MediaManagerProps {
  onSelect?: (media: Media | Media[] | null) => void;
  selectedMedia?: Media | Media[] | null;
  multiple?: boolean;
}

const MediaThumbnail: React.FC<{ item: Media }> = ({ item }) => {
  const [hasError, setHasError] = useState(false);

  if (item.mimeType.startsWith('image/') && !hasError) {
    return (
      <Image
        src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
        alt={item.originalName}
        width={item.width || 200}
        height={item.height || 200}
        className="object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  if (item.mimeType.startsWith('video/')) {
    return (
      <video
        src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
        controls
        className="object-cover w-full h-48 rounded"
      />
    );
  }

  if (item.mimeType.startsWith('audio/')) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-muted rounded">
        <audio
          src={`${process.env.NEXT_PUBLIC_API_URL}${item.url}`}
          controls
        />
      </div>
    );
  }

  // fallback cho các loại file khác
  return (
    <div className="w-full h-48 flex items-center justify-center bg-muted rounded">
      <ImageOff className="h-12 w-12 text-muted-foreground text-gray-300" />
    </div>
  );
};

export function MediaManager({ onSelect, selectedMedia, multiple = true }: MediaManagerProps) {
  const t = useTranslations('Utils');
  const [medias, setMedias] = useState<Media[]>([]);
  const [fileUploads, setFileUploads] = useState<(File & { preview: string, status?: boolean, message?: string })[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [selectedItems, setSelectedItems] = useState<Media[]>(
    selectedMedia ? (Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia]) : []
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mimeType, setMimeType] = useState<string>('');
  const itemsPerPage = 100;
  const [isUploading, setIsUploading] = useState(false);

  // Thêm phím tắt cho việc chọn tất cả
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'a') {
          e.preventDefault();
          if (multiple) {
            setSelectedItems(medias);
            if (onSelect) {
              onSelect(medias);
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [medias, multiple, onSelect]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
      }));
      setFileUploads(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
      "audio/*": [],
    },
    multiple: true
  });

  const fetchMedia = async () => {
    try {
      const params: MediaQueryParams = {
        page: currentPage,
        size: itemsPerPage,
        search: searchQuery,
        mimeType: mimeType || undefined,
      };
      const response = await mediaApi.getAll(params);
      setMedias(response.data);
      setTotalPages(response.totalPages)
    } catch (_error) {
      toast.error('Không thể tải danh sách media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [currentPage, searchQuery, mimeType]);

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks
    return () => fileUploads.forEach(file => URL.revokeObjectURL(file.preview));
  }, [fileUploads]);

  const handleUploadMultipleFiles = async () => {
    if (fileUploads.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < fileUploads.length; i++) {
      const fileToUpload = fileUploads[i];
      if (fileToUpload.status === true) continue;

      try {
        await mediaApi.upload(fileToUpload);
        setFileUploads(prevFiles =>
          prevFiles.map((file, index) =>
            index === i ? { ...file, status: true, message: 'Tải lên thành công' } : file
          )
        );
      } catch (error: any) {
        setFileUploads(prevFiles =>
          prevFiles.map((file, index) =>
            index === i ? { ...file, status: false, message: error.message || 'Tải lên thất bại' } : file
          )
        );
      }
    }

    setIsUploading(false);
    await fetchMedia();
    toast.info('Hoàn tất quá trình tải lên. Kiểm tra trạng thái của từng tệp.');
  };

  const removeFile = (previewUrl: string) => {
    setFileUploads(files => files.filter(file => file.preview !== previewUrl));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa media này?')) {
      try {
        await mediaApi.delete(id);
        setMedias((prev) => prev.filter((item) => item.id !== id));
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
    const index = medias.findIndex((m) => m.id === item.id);
    setImageError(false);
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const handlePrevPreview = () => {
    setImageError(false);
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : medias.length - 1));
  };

  const handleNextPreview = () => {
    setImageError(false);
    setPreviewIndex((prev) => (prev < medias.length - 1 ? prev + 1 : 0));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMimeTypeChange = (value: string) => {
    setMimeType(value);
    setCurrentPage(1);
  };

  const handleSaveChanges = async () => {
    if (!completedCrop || !imgRef) {
      toast.error('Vui lòng chọn một vùng để cắt.');
      return;
    }

    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    const canvas = document.createElement('canvas');
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Không thể tạo context 2D');
    }
    ctx.drawImage(
      imgRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      toast.error('Không thể tạo ảnh đã cắt.');
      return;
    }

    const currentMedia = medias[previewIndex];
    const file = new File([blob], currentMedia.originalName, { type: 'image/png' });

    try {
      await mediaApi.update(currentMedia.id, file);
      await fetchMedia();
      setEditMode(false);
      setIsPreviewOpen(false);
      toast.success('Ảnh đã được cập nhật thành công.');
    } catch (error) {
      toast.error('Có lỗi khi cập nhật ảnh.');
    }
  };

  const handleDeleteSelectedItems = async () => {
    setOpenDialog(false);
    await mediaApi.deleteMultiple(selectedItems.map(item => item.id));
    await fetchMedia();
    setSelectedItems([]);
    if (onSelect) {
      onSelect(null);
    }
    toast.success('Xóa tất cả file thành công');
  }

  return (
    <div className="space-y-4 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Quản lý Media</h1>

        <div className="flex items-center gap-2">
          {
            selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="default" className='bg-red-500 hover:bg-red-600' onClick={() => {
                  setOpenDialog(true);
                }}><Trash2 className="h-4 w-4 mr-2" /> Xóa tất cả ({selectedItems.length})</Button>
              </div>
            )
          }
          <Button onClick={() => setIsDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Tải lên
          </Button>
        </div>
        <Modal isOpen={isDialogOpen} onClose={() => { setIsDialogOpen(false); setFileUploads([]) }} className='w-3/4 max-w-4xl'>
          <div className='p-4'>
            <div>
              <div className='text-2xl'>Tải lên Media</div>
            </div>
            <div className="space-y-4 py-6">
              <div
                {...getRootProps()}
                className={`dropzone rounded-xl border-2 border-dashed p-7 lg:p-10 text-center cursor-pointer
                  ${isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                  }
                `}
              >
                <input multiple {...getInputProps()} />
                <div className="dz-message flex flex-col items-center m-0!">
                  <div className="mb-[22px] flex justify-center">
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      <Upload className="h-8 w-8" />
                    </div>
                  </div>
                  <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                    {isDragActive ? "Thả tệp vào đây" : "Kéo & thả hoặc nhấn để chọn tệp"}
                  </h4>
                  <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                    Tải lên nhiều tệp cùng lúc
                  </span>
                </div>
              </div>

              {fileUploads.length > 0 && (
                <div className="pt-4">
                  <h4 className="font-semibold text-lg mb-2">Các tệp đã chọn ({fileUploads.length}):</h4>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {fileUploads.map((file) => (
                        <div key={file.preview} className="relative group aspect-square">
                          <Image
                            src={file.preview}
                            alt={file.name}
                            fill
                            className="object-cover rounded-lg"
                                  />
                          {!isUploading && file.status !== true && (
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.preview);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {file.status === true && (
                            <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center">
                              <Check className="h-8 w-8 text-white" />
                            </div>
                          )}
                          {file.status === false && (
                            <div className="absolute inset-0 bg-red-500/70 flex flex-col items-center justify-center p-2 text-center">
                              <X className="h-8 w-8 text-white" />
                              <p className="text-white text-xs mt-1 leading-tight">{file.message}</p>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); setFileUploads([]) }}>
                Đóng
              </Button>
              <Button
                onClick={handleUploadMultipleFiles}
                disabled={isUploading || fileUploads.filter(f => f.status !== true).length === 0}
              >
                {isUploading
                  ? 'Đang tải lên...'
                  : `Tải lên ${fileUploads.filter(f => f.status !== true).length} tệp`}
              </Button>
            </div>
          </div>
        </Modal>
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
          <SelectContent className='bg-white'>
            <SelectItem value="*">Tất cả</SelectItem>
            <SelectItem value="image/">Hình ảnh</SelectItem>
            <SelectItem value="video/">Video</SelectItem>
            <SelectItem value="audio/">Âm thanh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hiển thị số lượng file đã chọn */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Đã chọn <span className='text-blue-500'>{selectedItems.length}</span> file{selectedItems.length > 1 ? 's' : ''}
            </span>
            {multiple && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Ctrl+A để chọn tất cả</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItems([]);
                if (onSelect) {
                  onSelect(multiple ? [] : null);
                }
              }}
            >
              Bỏ chọn tất cả
            </Button>
          </div>
        </div>
      )}

      {/* Nút chọn tất cả khi có nhiều file */}
      {multiple && medias.length > 0 && selectedItems.length === 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="bg-fuchsia-300 hover:bg-fuchsia-400"
            onClick={() => {
              setSelectedItems(medias);
              if (onSelect) {
                onSelect(medias);
              }
            }}
          >
            Chọn tất cả ({medias.length} file)
          </Button>
        </div>
      )}

      {
        medias.length === 0 && (
          <div className="container mx-auto">
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Không có dữ liệu</p>
            </div>
          </div>
        )
      }
      {
        loading && (
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="animate-spin h-10 w-10 border-4 border-fuchsia-500 border-t-transparent rounded-full mb-4"></div>
            <p>Đang tải...</p>
          </div>
        )
      }
      <div className='h-3/4'>
        <div
          className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-y-scroll max-h-[60vh]"
        >
          {medias && medias.map((item) => {
            const isSelected = selectedItems.some((selected) => selected.id === item.id);
            return (
              <div
                onClick={() => handlePreview(item)}
                key={item.id}
                className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${isSelected
                  ? 'ring-2 ring-blue-500/20 shadow-lg'
                  : 'border-border hover:border-blue-500/50'
                  }`}
              >
                {/* Checkbox overlay */}
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white/80 border-gray-300 hover:border-blue-500'
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>

                {/* Thumbnail */}
                <div >
                  <MediaThumbnail item={item} />
                </div>

                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                  >
                    {isSelected ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 bg-red-500/90 hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>

                {/* Tên file */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-blue-950/80 text-white text-xs truncate">
                  {item.originalName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      <Modal isOpen={isPreviewOpen} onClose={() => { setIsPreviewOpen(false); setEditMode(false); }} className='w-3/4'>
        <div className="w-full p-4">
          <div className="flex justify-between items-center text-2xl font-bold mb-4 px-10 py-5 mr-10">
            <span>Xem trước Media</span>
            {medias[previewIndex]?.mimeType.startsWith('image/') &&
              !editMode && (
                <Button variant="outline" className='mr-5 ' onClick={() => setEditMode(true)}>
                  <Pen className='text-gray-400'></Pen>
                  Chỉnh sửa</Button>
              )}
            {medias[previewIndex]?.mimeType.startsWith('image/') &&
              editMode && (
                <div className='group-last:'>
                  <Button variant="outline" className='mr-5' onClick={() => setEditMode(false)}>
                    <X className='text-gray-400'></X>
                    Hủy</Button>
                </div>

              )}
          </div>

          {editMode ? (
            <ImageCrop src={process.env.NEXT_PUBLIC_API_URL + medias[previewIndex].url} />
          ) : (
            <>
              <div className="relative aspect-video object-cover">
                {medias && medias[previewIndex]?.mimeType.startsWith('image/') && !imageError ? (
                  <Image
                    src={process.env.NEXT_PUBLIC_API_URL + medias[previewIndex].url}
                    alt={medias[previewIndex].originalName}
                    fill
                    className="object-contain"
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                ) : medias && medias[previewIndex]?.mimeType.startsWith('video/') && !videoError ? (
                  <video
                    width="1320"
                    height="640"
                    controls
                    autoPlay={false}
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain"
                  >
                    <source src={process.env.NEXT_PUBLIC_API_URL + medias[previewIndex].url} type={medias[previewIndex].mimeType} />
                    <track
                      src={medias[previewIndex].filename}
                      kind="subtitles"
                      srcLang="en"
                      label="English"
                    />
                    Your browser does not support the video tag.
                  </video>
                ) : medias && medias[previewIndex]?.mimeType.startsWith('audio/') && !audioError ? (
                  <div className="flex items-end justify-self-end w-full h-full">
                    <audio
                      src={process.env.NEXT_PUBLIC_API_URL + medias[previewIndex].url}
                      controls
                      onError={() => setAudioError(true)}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    {medias && medias[previewIndex]?.mimeType.startsWith('image/') && imageError ? (
                      <div className="text-destructive text-center">
                        <p>Không thể tải file đa phương tiện.</p>
                        <p className="text-xs">Vui lòng kiểm tra lại đường dẫn hoặc file.</p>
                      </div>
                    ) : (
                      <ImageIcon className="h-24 w-24 text-muted-foreground" />
                    )}
                  </div>
                )}
                {/* Overlay next/prev buttons - đặt ngoài controls */}
                <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handlePrevPreview}
                    className="rounded-full bg-fuchsia-300 hover:bg-fuchsia-400 pointer-events-auto"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleNextPreview}
                    className="rounded-full bg-fuchsia-300 hover:bg-fuchsia-400 pointer-events-auto"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p><span className='text-gray-500'>Tên file:</span> {medias && medias[previewIndex]?.originalName}</p>
                <p><span className='text-gray-500'>Loại file:</span> {medias && medias[previewIndex]?.mimeType}</p>
                <p><span className='text-gray-500'>Kích thước:</span> {medias && ((medias[previewIndex]?.width ?? 0) + ' x ' + (medias[previewIndex]?.height ?? 0))}</p>
                <p><span className='text-gray-500'>Dung lượng:</span> {medias && (medias[previewIndex]?.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </>
          )}
        </div>
      </Modal>

      <AlertDialogUtils
        type="warning"
        content={t('removeConfirm', { count: selectedItems.length })}
        confirmText={t('confirm')}
        cancelText={t('cancel')}
        isOpen={openDialog}
        onConfirm={() => handleDeleteSelectedItems()}
        onCancel={() => { setOpenDialog(false) }}
      />
    </div>
  );
} 