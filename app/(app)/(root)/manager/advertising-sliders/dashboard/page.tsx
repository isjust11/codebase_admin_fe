'use client';

import React from 'react';
import { AdvertisingSliderStats } from '@/components/AdvertisingSliderStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdvertisingSliderDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Advertising Sliders</h1>
          <p className="text-muted-foreground">Tổng quan về hiệu quả quảng cáo</p>
        </div>
        <Link href="/manager/advertising-sliders">
          <Button>
            Quản lý Sliders
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <AdvertisingSliderStats />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Phân Tích Hiệu Quả
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Xem chi tiết hiệu quả của từng slider và phân tích xu hướng
            </p>
            <Button variant="outline" className="w-full">
              Xem Báo Cáo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Phân Tích Theo Loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              So sánh hiệu quả giữa các loại slider khác nhau
            </p>
            <Button variant="outline" className="w-full">
              Xem Phân Tích
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lịch Quảng Cáo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Quản lý lịch trình và thời gian hiển thị của các slider
            </p>
            <Button variant="outline" className="w-full">
              Xem Lịch
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Hoạt Động Gần Đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Slider &quot;Khuyến mãi mùa hè&quot; được tạo</p>
                <p className="text-sm text-muted-foreground">2 giờ trước</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">+15% CTR</p>
                <p className="text-xs text-muted-foreground">So với tuần trước</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Slider &quot;Sản phẩm mới&quot; được cập nhật</p>
                <p className="text-sm text-muted-foreground">5 giờ trước</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">+8% Views</p>
                <p className="text-xs text-muted-foreground">So với tuần trước</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Slider &quot;Sự kiện đặc biệt&quot; được ẩn</p>
                <p className="text-sm text-muted-foreground">1 ngày trước</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-yellow-600">-5% CTR</p>
                <p className="text-xs text-muted-foreground">So với tuần trước</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 