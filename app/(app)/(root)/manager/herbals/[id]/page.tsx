'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { getHerbalById } from '@/services/herbal-api'
import { Herbal } from '@/services/herbal-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit, Eye, Heart } from 'lucide-react'
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils'
import Image from 'next/image'
import { Category } from '@/types/category'
import Badge from '@/components/ui/badge/Badge'

const HerbalDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const herbalId = params.id as string
  
  const [herbal, setHerbal] = useState<Herbal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHerbal = async () => {
      try {
        const response = await getHerbalById(parseInt(herbalId))
        setHerbal(response)
      } catch (error) {
        console.error('Lỗi khi tải thông tin thảo dược:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin thảo dược')
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
          <p className="mt-4">Đang tải thông tin thảo dược...</p>
        </div>
      </div>
    )
  }

  if (!herbal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Không tìm thấy thảo dược</p>
          <Button 
            onClick={() => router.push('/manager/herbals')}
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Chi tiết thảo dược" 
        items={[
          { title: 'Thảo dược', href: '/manager/herbals' },
          { title: herbal.title, href: `/manager/herbals/${herbalId}` }
        ]} 
      />
      
      <div className="space-y-6">
        {/* Header với hình ảnh và thông tin cơ bản */}
        <ComponentCard title="Thông tin cơ bản">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hình ảnh */}
            <div className="lg:col-span-1">
              {herbal.thumbnail ? (
                <Image
                  src={mergeImageUrl(herbal.thumbnail)}
                  alt={herbal.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Thông tin cơ bản */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{herbal.title}</h1>
                {herbal.scientificName && (
                  <p className="text-lg text-gray-600 italic mt-2">{herbal.scientificName}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Badge 
                  className={herbal.isActive ? 'ring-green-400' : 'ring-red-400'} 
                  variant="light" 
                  color={herbal.isActive ? 'success' : 'error'}
                >
                  {herbal.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{herbal.viewCount} lượt xem</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{herbal.likeCount} lượt thích</span>
                </div>
              </div>

              {herbal.category && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Danh mục:</span>
                  <div className="flex items-center space-x-2">
                    {herbal.category.icon && unicodeToEmoji(herbal.category.icon)}
                    <span className="text-sm font-medium">{herbal.category.name}</span>
                  </div>
                </div>
              )}

              {herbal.summary && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tóm tắt</h3>
                  <p className="text-gray-700 leading-relaxed">{herbal.summary}</p>
                </div>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Thông tin chi tiết */}
        <ComponentCard title="Thông tin chi tiết">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {herbal.commonNames && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tên thường gọi</h4>
                <p className="text-gray-700">{herbal.commonNames}</p>
              </div>
            )}

            {herbal.family && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Họ</h4>
                <p className="text-gray-700">{herbal.family}</p>
              </div>
            )}

            {herbal.partsUsed && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bộ phận sử dụng</h4>
                <p className="text-gray-700">{herbal.partsUsed}</p>
              </div>
            )}

            {herbal.activeCompounds && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Hợp chất hoạt tính</h4>
                <p className="text-gray-700">{herbal.activeCompounds}</p>
              </div>
            )}
          </div>

          {herbal.medicinalProperties && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tính chất dược liệu</h4>
              <p className="text-gray-700 leading-relaxed">{herbal.medicinalProperties}</p>
            </div>
          )}

          {herbal.preparationMethods && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Phương pháp chế biến</h4>
              <p className="text-gray-700 leading-relaxed">{herbal.preparationMethods}</p>
            </div>
          )}

          {herbal.dosage && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Liều lượng</h4>
              <p className="text-gray-700 leading-relaxed">{herbal.dosage}</p>
            </div>
          )}

          {herbal.contraindications && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Chống chỉ định</h4>
              <p className="text-gray-700 leading-relaxed">{herbal.contraindications}</p>
            </div>
          )}

          {herbal.sideEffects && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tác dụng phụ</h4>
              <p className="text-gray-700 leading-relaxed">{herbal.sideEffects}</p>
            </div>
          )}
        </ComponentCard>

        {/* Nội dung chi tiết */}
        <ComponentCard title="Nội dung chi tiết">
          <div className="prose max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: herbal.content }}
            />
          </div>
        </ComponentCard>

        {/* Thông tin hệ thống */}
        <ComponentCard title="Thông tin hệ thống">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Ngày tạo:</span>
              <span className="ml-2 text-gray-600">
                {new Date(herbal.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Ngày cập nhật:</span>
              <span className="ml-2 text-gray-600">
                {new Date(herbal.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Slug:</span>
              <span className="ml-2 text-gray-600">{herbal.slug}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">ID:</span>
              <span className="ml-2 text-gray-600">{herbal.id}</span>
            </div>
          </div>
        </ComponentCard>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/manager/herbals')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button
            onClick={() => router.push(`/manager/herbals/update/${herbalId}`)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HerbalDetailPage 