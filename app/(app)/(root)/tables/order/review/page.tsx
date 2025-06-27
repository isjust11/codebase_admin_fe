"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/services/auth-api";
import { createOrder } from "@/services/manager-api";
import { CreateOrderDto } from "@/types/dto/CreateOrderDto";
import { FoodItem } from "@/types/food-item";
import { OrderItem } from "@/types/order-item";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setOrderNote, clearOrder, setOrderItems } from "@/store/orderSlice";
import { RootState } from "@/store";

export default function OrderReviewPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const orderItems = useAppSelector((state: RootState) => state.order.orderItems);
  const tableDetail = useAppSelector((state: RootState) => state.order.tableDetail);
  const orderNote = useAppSelector((state: RootState) => state.order.orderNote);

  const handleItemNoteChange = (foodItemId: number, note: string) => {
    dispatch(setOrderNote(note));
  };

  const handleRemoveItem = (foodItem: FoodItem) => {
    const updatedItems = orderItems.filter((item: OrderItem) => item.foodItem.id !== foodItem.id);
    dispatch(setOrderItems(updatedItems));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total: number, item: OrderItem) => {
      return total + (item.foodItem.price * item.quantity);
    }, 0);
  };

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một món");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      const orderData: CreateOrderDto = {
        tableId: tableDetail?.id?.toString() || "",
        note: orderNote,
        orderItems: orderItems.map((item: OrderItem) => ({
          foodItem: item.foodItem,
          quantity: item.quantity,
          note: item.note,
          id: 0,
          price: item.foodItem.price,
        })),
        userId: user.id,
        guestId: user.id,
        totalAmount: calculateTotal(),
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        user: user,
        guest: user
      };

      const order = await createOrder(tableDetail?.id, orderData);
      toast.success("Đặt món thành công");
      dispatch(clearOrder());
      router.push("/tables/order/detail/" + order.id);
    } catch (error) {
      console.error("Lỗi khi đặt món:", error);
      toast.error("Có lỗi xảy ra khi đặt món");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Xem lại đơn hàng</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin bàn</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">Bàn số: {tableDetail?.name}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderItems.map((item: OrderItem) => (
              <div key={item.foodItem.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.foodItem.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">{item.foodItem.price.toLocaleString()}đ</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveItem(item.foodItem)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Ghi chú cho món này..."
                  value={item.note || ""}
                  onChange={(e) => handleItemNoteChange(item.foodItem.id, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ghi chú đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Nhập ghi chú cho đơn hàng..."
            value={orderNote}
            onChange={(e) => dispatch(setOrderNote(e.target.value))}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tổng cộng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">Tổng tiền:</p>
            <p className="text-xl font-bold text-primary">
              {calculateTotal().toLocaleString()}đ
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Quay lại
        </Button>
        <Button
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
        </Button>
      </div>
    </div>
  );
}
