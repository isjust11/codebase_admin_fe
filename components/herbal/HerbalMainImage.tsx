'use client'
import React, { useState, useEffect } from 'react'
import { getMainHerbalImage, HerbalImageResponse } from '@/services/herbal-image-api'
import { Image as ImageIcon } from 'lucide-react'

interface HerbalMainImageProps {
  herbalId: number
  className?: string
  fallbackSrc?: string
}

const HerbalMainImage: React.FC<HerbalMainImageProps> = ({ 
  herbalId, 
  className = "w-full h-full object-cover",
  fallbackSrc = "/images/placeholder-herbal.jpg"
}) => {
  const [image, setImage] = useState<HerbalImageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadMainImage = async () => {
      try {
        setLoading(true)
        setError(false)
        const mainImage = await getMainHerbalImage(herbalId)
        setImage(mainImage)
      } catch (error) {
        console.error('Lỗi khi tải hình ảnh chính:', error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadMainImage()
  }, [herbalId])

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  if (error || !image) {
    return (
      <img
        src={fallbackSrc}
        alt="Herbal placeholder"
        className={className}
        onError={(e) => {
          e.currentTarget.src = fallbackSrc
        }}
      />
    )
  }

  return (
    <img
      src={image.url}
      alt={image.alt || 'Herbal main image'}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc
      }}
    />
  )
}

export default HerbalMainImage 