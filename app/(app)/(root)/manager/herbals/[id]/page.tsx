'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useParams } from 'next/navigation'
import { getHerbalById } from '@/services/herbal-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit, Eye, Heart } from 'lucide-react'
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils'
import Image from 'next/image'
import Badge from '@/components/ui/badge/Badge'
import { Herbal } from '@/types/herbal'
import { HerbalImageDto } from '@/services/herbal-image-api'
import { getHerbalImages } from '@/services/herbal-image-api'
import HerbalImageGallery from '../components/HerbalImageGallery'
import { useTransition } from 'react'
import { Action } from '@/types/actions'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext'; 

const HerbalDetailPage = () => {
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const { navigateTo } = useLoading();
  const params = useParams()
  const herbalId = params.id as string
  const [imageDisplay, setImageDisplay] = useState<string>('')
  const [herbal, setHerbal] = useState<Herbal | null>(null)
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<HerbalImageDto[]>([])
  useEffect(() => {
    const fetchHerbal = async () => {
      try {
        const response = await getHerbalById(herbalId)
        const images = await getHerbalImages(herbalId)
        if(images.length > 0) {
          const image = images.find((image: HerbalImageDto) => image.type === 'main')
          if(image) {
            setImageDisplay(mergeImageUrl(image.url))
          }else{
            setImageDisplay(mergeImageUrl(images[0].url))
          }
        }
        setHerbal(response)
        setImages(images)
      } catch (error) {
        console.error('Lỗi khi tải thông tin thảo dược:', error)
        toast.error(t('error'))
      } finally {
        setLoading(false)
      }
    }
    
    if (herbalId) {
      fetchHerbal()
    }
  }, [herbalId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!herbal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('notFound')}</p>
          <Button 
            onClick={() => navigateTo('/manager/herbals')}
            className="mt-4"
          >
            {t('backToList')}
          </Button>
        </div>
      </div>
    )
  }
  const lstAction: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => {
        startTransition(() => {
          navigateTo('/manager/herbals')
        })
      },
      title: t('back'),
      className:isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300',
      variant: 'outline'
    },
    {
      icon: <Edit className="w-4 h-4" />,
      onClick: () =>{
        startTransition(() => {
          navigateTo(`/manager/herbals/update/${herbalId}`)
        })
      },
      title: t('edit'),
      className: isPending ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-800 rounded-md transition-colors text-white',
      variant: 'primary'
    }
  ]

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('detail')} 
        items={[
          { title: t('herbals'), href: '/manager/herbals' },
          { title: herbal.title, href: `/manager/herbals/${herbalId}` }
        ]} 
      />
      
      <div className="space-y-6">
        {/* Header với hình ảnh và thông tin cơ bản */}
        <ComponentCard title={t('basicInfo')} listAction={lstAction }>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hình ảnh */}
            <div className="lg:col-span-1">
              {imageDisplay ? (
                <Image
                  src={mergeImageUrl(imageDisplay)}
                  alt={herbal.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">{tUtils('noImage')}</span>
                </div>
              )}
            </div>

            {/* Thông tin cơ bản */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h5 className="text-lg font-bold text-gray-900">{herbal.title}</h5>
                {herbal.scientificName && (
                  <p className="text-sm text-gray-600 italic mt-2">{herbal.scientificName}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Badge 
                  className={herbal.isActive ? 'ring-green-400' : 'ring-red-400'} 
                  variant="light" 
                  color={herbal.isActive ? 'success' : 'error'}
                >
                  {herbal.isActive ? t('active') : t('inactive')}
                </Badge>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{herbal.viewCount} {tUtils('views')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                    <span>{herbal.likeCount} {tUtils('likes')}</span>
                </div>
              </div>

              {herbal.category && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{tUtils('category')}:</span>
                  <div className="flex items-center space-x-2">
                    {herbal.category.icon && unicodeToEmoji(herbal.category.icon)}
                    <span className="text-sm font-medium">{herbal.category.name}</span>
                  </div>
                </div>
              )}

              {herbal.summary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t('summary')}</h3>
                  <p className="text-gray-700 leading-relaxed">{herbal.summary}</p>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Thông tin chi tiết */}
        <ComponentCard title={t('detailInfo')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {herbal.title && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">{t('commonNames')}</h5>
                <p className="text-gray-700">{herbal.title}</p>
              </div>
            )}

            {herbal.category && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">{t('family')}</h5>
                <p className="text-gray-700">{herbal.category?.name}</p>
              </div>
            )}

            {herbal.partsUsedCategory && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">{t('partsUsed')}</h5>
                <p className="text-gray-700">{herbal.partsUsedCategory.name}</p>
              </div>
            )}
          </div>

          {herbal.medicinalProperties && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">{t('medicinalProperties')}</h5>
              <p className="text-gray-700 leading-relaxed">{herbal.medicinalProperties}</p>
            </div>
          )}

          {herbal.preparationMethods && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">{t('preparationMethods')}</h5>
              <p className="text-gray-700 leading-relaxed">{herbal.preparationMethods}</p>
            </div>
          )}

          {herbal.dosage && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">{t('dosage')}</h5>
              <p className="text-gray-700 leading-relaxed">{herbal.dosage}</p>
            </div>
          )}

          {herbal.contraindications && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">{t('contraindications')}</h5>
              <p className="text-gray-700 leading-relaxed">{herbal.contraindications}</p>
            </div>
          )}

          {herbal.sideEffects && (
            <div className="mt-6">
              <h5 className="font-semibold text-gray-900 mb-2">{t('sideEffects')}</h5>
              <p className="text-gray-700 leading-relaxed">{herbal.sideEffects}</p>
            </div>
          )}
        </ComponentCard>

          {/* Danh sách hình ảnh */}
          <ComponentCard title={t('imageList')}>
            <HerbalImageGallery herbalId={herbalId} />
        </ComponentCard>

        {/* Nội dung chi tiết */}
        <ComponentCard title={t('content')}>
          <div className="prose max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: herbal.content }}
            />
          </div>
        </ComponentCard>

        {/* Thông tin hệ thống */}
        <ComponentCard title={t('systemInfo')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-900">{t('createdAt')}:</span>
              <span className="ml-2 text-gray-600">
                {new Date(herbal.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('updatedAt')}:</span>
              <span className="ml-2 text-gray-600">
                {new Date(herbal.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('slug')}:</span>
              <span className="ml-2 text-gray-600">{herbal.slug}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{t('id')}:</span>
              <span className="ml-2 text-gray-600">{herbal.id}</span>
            </div>
          </div>
        </ComponentCard>

      </div>
    </div>
  )
}

export default HerbalDetailPage 