'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Upload, Image as ImageIcon, Edit3, Move } from 'lucide-react'
import { toast } from 'sonner'
import { 
  getHerbalImages, 
  createHerbalImage, 
  updateHerbalImage, 
  deleteHerbalImage,
  updateHerbalImageSortOrder,
  HerbalImageResponse,
  HerbalImageDto,
  SortOrderDto
} from '@/services/herbal-image-api'

interface HerbalImageUploadProps {
  herbalId: number
}

const imageTypes = [
  { value: 'main', label: 'Hình chính' },
  { value: 'detail', label: 'Hình chi tiết' },
  { value: 'part', label: 'Hình bộ phận' },
  { value: 'growth', label: 'Hình sinh trưởng' },
  { value: 'processing', label: 'Hình chế biến' },
  { value: 'usage', label: 'Hình sử dụng' },
  { value: 'other', label: 'Hình khác' }
]

const HerbalImageUpload: React.FC<HerbalImageUploadProps> = ({ herbalId }) => {
  const [images, setImages] = useState<HerbalImageResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<HerbalImageResponse | null>(null)
  const [editForm, setEditForm] = useState({
    alt: '',
    description: '',
    type: 'main' as const,
    isActive: true
  })

  // Load images
  const loadImages = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getHerbalImages(herbalId)
      setImages(data.sort((a, b) => a.sortOrder - b.sortOrder))
    } catch (error) {
      console.error('Lỗi khi tải hình ảnh:', error)
      toast.error('Có lỗi xảy ra khi tải hình ảnh')
    } finally {
      setLoading(false)
    }
  }, [herbalId])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    try {
      for (const file of acceptedFiles) {
        // Convert file to base64 (in real app, you'd upload to server first)
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64 = e.target?.result as string
          
          const imageData: HerbalImageDto = {
            url: base64,
            alt: file.name,
            type: 'other',
            sortOrder: images.length,
            isActive: true,
            herbalId
          }

          try {
            await createHerbalImage(imageData)
            toast.success(`Đã upload ${file.name}`)
            loadImages() // Reload images
          } catch (error) {
            console.error('Lỗi khi upload:', error)
            toast.error(`Lỗi khi upload ${file.name}`)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error('Lỗi khi xử lý file:', error)
      toast.error('Có lỗi xảy ra khi upload file')
    } finally {
      setUploading(false)
    }
  }, [images.length, herbalId, loadImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  })

  // Handle edit image
  const handleEditImage = (image: HerbalImageResponse) => {
    setEditingImage(image)
    setEditForm({
      alt: image.alt || '',
      description: image.description || '',
      type: image.type as any,
      isActive: image.isActive
    })
  }

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingImage) return

    try {
      await updateHerbalImage(editingImage.id, editForm)
      toast.success('Đã cập nhật hình ảnh')
      setEditingImage(null)
      loadImages()
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error)
      toast.error('Có lỗi xảy ra khi cập nhật hình ảnh')
    }
  }

  // Delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Bạn có chắc muốn xóa hình ảnh này?')) return

    try {
      await deleteHerbalImage(imageId)
      toast.success('Đã xóa hình ảnh')
      loadImages()
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      toast.error('Có lỗi xảy ra khi xóa hình ảnh')
    }
  }

  // Update sort order
  const handleSortOrderChange = async (imageId: number, newSortOrder: number) => {
    try {
      const sortData: SortOrderDto[] = images.map(img => ({
        id: img.id,
        sortOrder: img.id === imageId ? newSortOrder : img.sortOrder
      }))
      
      await updateHerbalImageSortOrder(sortData)
      loadImages()
    } catch (error) {
      console.error('Lỗi khi cập nhật thứ tự:', error)
      toast.error('Có lỗi xảy ra khi cập nhật thứ tự')
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Hình Ảnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Thả file vào đây' : 'Kéo & thả file vào đây'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Hoặc click để chọn file (PNG, JPG, GIF, WebP)
            </p>
            {uploading && (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Đang upload...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Images List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Danh Sách Hình Ảnh ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có hình ảnh nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  {/* Image Preview */}
                  <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt || 'Herbal image'}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      variant={image.isActive ? "default" : "secondary"}
                      className="absolute top-2 right-2"
                    >
                      {image.isActive ? 'Hoạt động' : 'Ẩn'}
                    </Badge>
                  </div>

                  {/* Image Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {imageTypes.find(t => t.value === image.type)?.label || image.type}
                      </Badge>
                      <span className="text-sm text-gray-500">#{image.sortOrder}</span>
                    </div>
                    
                    {image.alt && (
                      <p className="text-sm font-medium">{image.alt}</p>
                    )}
                    
                    {image.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditImage(image)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    
                    <Select
                      value={image.sortOrder.toString()}
                      onValueChange={(value) => handleSortOrderChange(image.id, parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: images.length }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa hình ảnh</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="alt">Alt text</Label>
                <Input
                  id="alt"
                  value={editForm.alt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Mô tả hình ảnh"
                />
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="type">Loại hình ảnh</Label>
                <Select
                  value={editForm.type}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                <Label htmlFor="isActive">Hoạt động</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingImage(null)}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveEdit}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HerbalImageUpload 