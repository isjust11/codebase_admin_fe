'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
import { FoodItem } from '@/types/food-item'
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { toast } from 'sonner'
import { mergeImageUrl, unicodeToEmoji } from '@/lib/utils'
import { deleteFoodItem, getFoodItem } from '@/services/manager-api'
import Badge  from '@/components/ui/badge/Badge'
import Image from 'next/image'

const FoodItemDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        const id = Number(params.id)
        const data = await getFoodItem(id)
        setFoodItem(data)
      } catch (error) {
        toast.error('Không thể tải thông tin món ăn')
      } finally {
        setLoading(false)
      }
    }

    fetchFoodItem()
  }, [params.id])

  const handleDelete = async () => {
    try {
      await deleteFoodItem(Number(params.id))
      toast.success('Món ăn đã được xóa thành công')
      router.push('/manager/food-items')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa món ăn')
    }
  }

  const lstAction = [
    {
      icon: <ArrowLeft className="w-4 h-4 mr-2" />,
      onClick: () => router.push('/manager/food-items'),
      title: 'Quay lại',
      className: 'hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500',
    },
    {
      icon: <Edit className="w-4 h-4 mr-2" />,
      onClick: () => router.push(`/manager/food-items/update/${foodItem?.id}`),
      title: 'Chỉnh sửa',
      className: 'hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500',
    },
    {
      icon: <Trash className="w-4 h-4 mr-2" />,
      onClick: handleDelete,
      title: 'Xóa',
      className: 'bg-red-500 hover:bg-red-600 dark:hover:bg-red-800 rounded-md transition-colors text-red-500',
    },
  ]

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!foodItem) {
    return <div>Không tìm thấy món ăn</div>
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Chi tiết món ăn" 
        items={[
          { title: 'Danh sách món ăn', href: '/manager/food-items' },
          { title: foodItem.name, href: '#' }
        ]} 
      />
      
      <div className="space-y-6">
        <ComponentCard title="Thông tin chi tiết" listAction={lstAction}>
          <div className="flex gap-6">
            <div className="w-1/3">
              {foodItem.imageUrl ? (
                <Image
                width={350}
                height={300}
                  src={mergeImageUrl(foodItem.imageUrl)}
                  alt={foodItem.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}
            </div>
            
            <div className="w-2/3 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{foodItem.name}</h2>
                <Badge 
                  className={foodItem.isAvailable ? 'ring-green-400' : 'ring-red-400'} 
                  variant="light" 
                  color={foodItem.isAvailable ? 'success' : 'error'}
                >
                  {foodItem.isAvailable ? 'Đang bán' : 'Ngừng bán'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex mb-3 border-b border-gray-300 pb-3">
                  <span className="w-32">Giá:</span>
                  <span className="text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(foodItem.price)}
                  </span>
                </div>

                <div className="flex items-center  mb-3 border-b border-gray-300 pb-3">
                  <span className="w-32">Danh mục:</span>
                  <div className="flex">
                    {foodItem.foodCategory?.icon && (
                      <span className="mr-2">{unicodeToEmoji(foodItem.foodCategory.icon)}</span>
                    )}
                    <span>{foodItem.foodCategory?.name}</span>
                  </div>
                </div>

                <div className="flex items-center mb-3 border-b border-gray-200/100 pb-3">
                  <span className="w-32">Đơn vị tính:</span>
                  <div className="flex">
                    {foodItem.unitCategory?.icon && (
                      <span className="mr-2">{unicodeToEmoji(foodItem.unitCategory.icon)}</span>
                    )}
                    <span>{foodItem.unitCategory?.name}</span>
                  </div>
                </div>

                <div className="flex items-center mb-3 border-b border-gray-200/100 pb-3">
                  <span className="w-32">Trạng thái:</span>
                  <div className="flex">
                    {foodItem.statusCategory?.icon && (
                      <span className="mr-2">{unicodeToEmoji(foodItem.statusCategory.icon)}</span>
                    )}
                    <span>{foodItem.statusCategory?.name}</span>
                  </div>
                </div>
                <div className="flex mb-3 ">
                  <span className="w-32">Mô tả:</span>
                  <div className="flex px-3 py-2 border border-gray-200/100 rounded-md w-full min-h-20 bg-gray-50">
                    <span dangerouslySetInnerHTML={{ __html: foodItem.description || 'Không có mô tả' }}></span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}

export default FoodItemDetailPage 