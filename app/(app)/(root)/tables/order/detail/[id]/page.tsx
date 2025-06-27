'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Order } from '@/types/order'
import { orderService as service } from '@/services/orderService'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { formatCurrency } from '@/lib/utils'
import { getTableById } from '@/services/table-api'
import { Table } from '@/types/table'

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [table, setTable] = useState<Table>({} as Table);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderId = params.id as string
        const orderData = await service.getOrderById(orderId)
        setOrder(orderData)
        if (orderData){
           const tableData = await getTableById(orderData.tableId);
           setTable(tableData);
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Không thể tải thông tin đơn hàng')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={`Chi tiết đơn hàng #${order.id}`} />
      <div className="space-y-6">
        <ComponentCard title={`Chi tiết đơn hàng #${order.id}`}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bàn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-medium">Bàn số:</span> {table.name}</p>
                  {/* <p><span className="font-medium">Trạng thái:</span> {order.orderStatus.name}</p> */}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.foodItem.name}</p>
                        <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                        {item.note && (
                          <p className="text-sm text-muted-foreground">Ghi chú: {item.note}</p>
                        )}
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tổng cộng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium">Tổng tiền:</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle>Ghi chú đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.note}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  )
}
