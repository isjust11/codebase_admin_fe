'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Image, 
  X, 
  Plus,
  Search,
  Grid3X3,
  List
} from 'lucide-react';

interface MediaManagerProps {
  multiple?: boolean;
  onSelect?: (urls: string[]) => void;
  selectedUrls?: string[];
}

interface MediaFile {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export function MediaManager({ multiple = false, onSelect, selectedUrls = [] }: MediaManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<string[]>(selectedUrls);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockFiles: MediaFile[] = [
        {
          id: '1',
          url: 'https://via.placeholder.com/300x200',
          name: 'slider-1.jpg',
          size: 1024000,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString(),
        },
        {
          id: '2',
          url: 'https://via.placeholder.com/300x200',
          name: 'slider-2.jpg',
          size: 2048000,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString(),
        },
        {
          id: '3',
          url: 'https://via.placeholder.com/300x200',
          name: 'banner-1.png',
          size: 1536000,
          type: 'image/png',
          uploadedAt: new Date().toISOString(),
        },
      ];
      setMediaFiles(mockFiles);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách media',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    try {
      setLoading(true);
      
      // Mock upload - replace with actual upload logic
      const newFiles: MediaFile[] = Array.from(files).map((file, index) => ({
        id: Date.now().toString() + index,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }));

      setMediaFiles(prev => [...newFiles, ...prev]);
      
      toast({
        title: 'Thành công',
        description: `Đã upload ${files.length} file`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể upload file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (fileId: string) => {
    const file = mediaFiles.find(f => f.id === fileId);
    if (!file) return;

    if (multiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.includes(file.url);
        if (isSelected) {
          return prev.filter(url => url !== file.url);
        } else {
          return [...prev, file.url];
        }
      });
    } else {
      setSelectedFiles([file.url]);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (onSelect) {
      onSelect(selectedFiles);
    }
    setIsOpen(false);
  };

  // Handle remove selected file
  const handleRemoveSelected = (url: string) => {
    setSelectedFiles(prev => prev.filter(u => u !== url));
  };

  // Filter files based on search
  const filteredFiles = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Files đã chọn:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Selected ${index + 1}`}
                  className="w-16 h-12 object-cover rounded border"
                />
                                 <button
                   onClick={() => handleRemoveSelected(url)}
                   className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                   title="Xóa file"
                   aria-label="Xóa file"
                 >
                   <X className="w-3 h-3" />
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Manager Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={() => fetchMediaFiles()}>
            <Image className="w-4 h-4 mr-2" />
            Chọn Media
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Media Manager</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Kéo thả files vào đây hoặc click để chọn
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    {loading ? 'Uploading...' : 'Chọn Files'}
                  </Button>
                                     <input
                     ref={fileInputRef}
                     type="file"
                     multiple
                     accept="image/*"
                     className="hidden"
                     title="Chọn files"
                     aria-label="Chọn files"
                     onChange={(e) => {
                       if (e.target.files) {
                         handleFileUpload(e.target.files);
                       }
                     }}
                   />
                </div>
              </CardContent>
            </Card>

            {/* Search and View Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Files Display */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
                {filteredFiles.map((file) => {
                  const isSelected = selectedFiles.includes(file.url);
                  return (
                    <div
                      key={file.id}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      {viewMode === 'grid' ? (
                        <div className="p-2">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded"
                          />
                          <div className="mt-2">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • {file.type}
                            </p>
                          </div>
                          {isSelected && (
                            <Badge variant="default">Đã chọn</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleConfirmSelection}>
                Chọn ({selectedFiles.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 