'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, ZoomIn, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getHerbalImages, HerbalImageResponse } from '@/services/herbal-image-api'

interface HerbalImageGalleryProps {
  herbalId: number
  showMainImageOnly?: boolean
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

const HerbalImageGallery: React.FC<HerbalImageGalleryProps> = ({ 
  herbalId, 
  showMainImageOnly = false 
}) => {
  const [images, setImages] = useState<HerbalImageResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<HerbalImageResponse | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true)
        const data = await getHerbalImages(herbalId)
        const sortedImages = data
          .filter(img => img.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
        
        if (showMainImageOnly) {
          const mainImage = sortedImages.find(img => img.type === 'main')
          setImages(mainImage ? [mainImage] : sortedImages.slice(0, 1))
        } else {
          setImages(sortedImages)
        }
      } catch (error) {
        console.error('Lỗi khi tải hình ảnh:', error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [herbalId, showMainImageOnly])

  const openLightbox = (image: HerbalImageResponse, index: number) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length
      setCurrentImageIndex(nextIndex)
      setSelectedImage(images[nextIndex])
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
      setCurrentImageIndex(prevIndex)
      setSelectedImage(images[prevIndex])
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Hình ảnh thảo dược
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Hình ảnh thảo dược
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Chưa có hình ảnh nào
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Hình ảnh thảo dược ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="relative group cursor-pointer"
                onClick={() => openLightbox(image, index)}
              >
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.alt || 'Herbal image'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {imageTypes.find(t => t.value === image.type)?.label || image.type}
                    </Badge>
                    {image.alt && (
                      <span className="text-xs text-gray-600 truncate max-w-[120px]">
                        {image.alt}
                      </span>
                    )}
                  </div>
                  
                  {image.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt || 'Herbal image'}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 text-white text-center">
              <div className="bg-black bg-opacity-50 rounded-lg p-3">
                {selectedImage.alt && (
                  <h3 className="font-semibold mb-1">{selectedImage.alt}</h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm text-gray-300">{selectedImage.description}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {imageTypes.find(t => t.value === selectedImage.type)?.label || selectedImage.type}
                  </Badge>
                  <span className="text-xs text-gray-300">
                    {currentImageIndex + 1} / {images.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HerbalImageGallery 