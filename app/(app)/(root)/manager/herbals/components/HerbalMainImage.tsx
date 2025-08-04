'use client'
import React, { useState, useEffect } from 'react'
import { getHerbalImage } from '@/services/herbal-image-api'
import { HerbalImageDto } from '@/services/herbal-image-api'
import { Image as ImageIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
interface HerbalMainImageProps {
  herbalId: string
  className?: string
  fallbackSrc?: string
}

const HerbalMainImage: React.FC<HerbalMainImageProps> = ({ 
  herbalId, 
  className = "w-full h-full object-cover",
  fallbackSrc = "/images/placeholder-herbal.jpg"
}) => {
    const [image, setImage] = useState<HerbalImageDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const t = useTranslations('Herbals')
  useEffect(() => {
    const loadMainImage = async () => {
      try {
        setLoading(true)
        setError(false)
        const mainImage = await getHerbalImage(herbalId)
        setImage(mainImage)
      } catch (error) {
        console.error(t('errorLoadingMainImage'), error)
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
        alt={t('herbalsPlaceholder')}
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
      alt={image.alt || t('herbalsMainImage')}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc
      }}
    />
  )
}

export default HerbalMainImage 