'use client'

import { OrderItem } from '@/types/order-item'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Table } from '@/types/table'
import { useAppSelector } from '@/hooks/useAppSelector'
import { RootState } from '@/store'


const OrderCard = () => {
    const router = useRouter()
    const orderItems = useAppSelector((state: RootState) => state.order.orderItems)
    const totalItems = orderItems.reduce((sum: number, item: OrderItem) => sum + item.quantity, 0)
    const totalPrice = orderItems.reduce((sum: number, item: OrderItem) => sum + (item.foodItem.price * item.quantity), 0)
    
    const handleReviewOrder = () => {
        router.push('/tables/order/review')
    }
    
    return (
        <AnimatePresence>
            {orderItems.length > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 right-0 bg-white shadow-lg p-4 z-50"
                    style={{
                        width: 'calc(100% - 280px)',
                        marginLeft: '280px'
                    }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ShoppingCart className="w-6 h-6" />
                            <div>
                                <p className="font-semibold">{totalItems} món</p>
                                <p className="text-sm text-gray-500">Tổng tiền: {totalPrice.toLocaleString('vi-VN')}đ</p>
                            </div>
                        </div>
                        <Button className="bg-blue-700 hover:bg-blue/90 color-black" onClick={() => handleReviewOrder()}>
                            Xem đơn hàng
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default OrderCard
