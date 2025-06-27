'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAllFoods } from '@/services/manager-api'
import { FoodItem } from '@/types/food-item'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { OrderItem } from '@/types/order-item'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import OrderCard from '../../components/OrderCard'
import { getTableById } from '@/services/table-api'
import { Table } from '@/types/table'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { addOrderItem, setTableDetail } from '@/store/orderSlice'
import { RootState } from '@/store'

export default function OrderPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const tableDetail = useAppSelector((state: RootState) => state.order.tableDetail)
  const notifyDetail = useAppSelector((state: RootState) => state.notifycation.orderItems)
 
  const tableId = params.id as string;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodItems, tableDetail] = await Promise.all([
          getAllFoods(),
          getTableById(tableId)
        ])
        if (foodItems) {
          setFoodItems(foodItems.data);
        } else {
          toast.error('Không thể tải danh sách món ăn')
        }
        if (tableDetail) {
          dispatch(setTableDetail(tableDetail))
        } else {
          toast.error('Không thể tải thông tin bàn')
        }
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu')
      }
    }
    fetchData();
  }, [dispatch, tableId])

  const handleAddItem = (foodItem: FoodItem) => {
    const newOrderItem: OrderItem = {
      foodItem,
      quantity: 1,
      note: '',
      id: 0,
      price: foodItem.price
    }
    dispatch(addOrderItem(newOrderItem))
    toast.success(`Đã thêm ${foodItem.name} vào đơn hàng`)
  }

  const navigateToFoodItemCreate = () => {
    router.push('/manager/food-items/create')
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Đặt món bàn ${tableDetail?.name}`}/>
      <div className="space-y-6">
        <ComponentCard title={`Đặt món bàn ${tableDetail?.name}`}>
          <div className="container mx-auto">
            {foodItems.length == 0 && (<div className="flex justify-center flex-col items-center h-[60vh] w-full">
              <div className='text-2xl font-bold text-muted-foreground'>
                Không có món nào trong danh sách
              </div>
              <div className='text-muted-foreground'>
                Vui lòng thêm món ăn vào danh sách
              </div>
              <Button className='mt-4' variant="outline" onClick={() => navigateToFoodItemCreate()}>
                Thêm món ăn
              </Button>
            </div>)}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Danh sách món ăn */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foodItems.map((foodItem) => (
                    <Card key={foodItem.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{foodItem.name}</h3>
                          <p className="text-sm text-muted-foreground py-2">
                            <Label className="text-sm font-medium">Mô tả:</Label>
                            <span dangerouslySetInnerHTML={{ __html: foodItem.description || 'Không có mô tả' }}></span>
                          </p>
                          <p className="text-primary font-medium mt-2">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(foodItem.price)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddItem(foodItem)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Giỏ hàng */}
              {foodItems.length > 0 &&
                <OrderCard />}
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  )
} 