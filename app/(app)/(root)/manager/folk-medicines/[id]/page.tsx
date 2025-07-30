'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { getFolkMedicine } from '@/services/folk-medicine-api';
import { FolkMedicine } from '@/types/folk-medicine';
import { ArrowLeft, Edit, Eye, Calendar, User, Tag, ThumbsUp, Eye as EyeIcon } from 'lucide-react';
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';

export default function FolkMedicineDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [folkMedicine, setFolkMedicine] = useState<FolkMedicine | null>(null);

  useEffect(() => {
    const fetchFolkMedicine = async () => {
      try {
        const data = await getFolkMedicine(id);
        setFolkMedicine(data);
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải thông tin bài thuốc');
        router.push('/manager/folk-medicines');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFolkMedicine();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!folkMedicine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Không tìm thấy bài thuốc</p>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Chi tiết bài thuốc dân gian" />
      <div className="space-y-6">
        <ComponentCard title="Chi tiết bài thuốc dân gian">
          <div className="space-y-6">
            {/* Header với actions */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{folkMedicine.title}</h1>
                <p className="text-gray-600 mt-2">{folkMedicine.summary}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/manager/folk-medicines/update/${folkMedicine.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/manager/folk-medicines/${folkMedicine.slug}/${folkMedicine.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem bài thuốc
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thông tin chính */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hình ảnh */}
                {folkMedicine.thumbnail && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hình ảnh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative w-full h-64">
                        <Image
                          src={mergeImageUrl(folkMedicine.thumbnail)}
                          alt={folkMedicine.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Nội dung chính */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nội dung chính</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700">
                        {folkMedicine.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thành phần */}
                {folkMedicine.ingredients && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Thành phần</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {folkMedicine.ingredients}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cách chế biến */}
                {folkMedicine.preparation && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cách chế biến</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {folkMedicine.preparation}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cách sử dụng */}
                {folkMedicine.usage && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cách sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {folkMedicine.usage}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ghi chú */}
                {folkMedicine.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ghi chú</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {folkMedicine.notes}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar thông tin */}
              <div className="space-y-6">
                {/* Thông tin cơ bản */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Danh mục:</span>
                      <Badge variant="secondary">
                        {folkMedicine.category?.name || 'Chưa phân loại'}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Tác giả:</span>
                      <span className="text-sm font-medium">
                        {folkMedicine.author?.name || 'Không xác định'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Ngày tạo:</span>
                      <span className="text-sm font-medium">
                        {new Date(folkMedicine.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Cập nhật:</span>
                      <span className="text-sm font-medium">
                        {new Date(folkMedicine.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={folkMedicine.isActive ? "default" : "destructive"}>
                        {folkMedicine.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Thống kê */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thống kê</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Lượt xem:</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {folkMedicine.viewCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">Lượt thích:</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        {folkMedicine.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Slug */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 break-all">
                      <strong>Slug:</strong> {folkMedicine.slug}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Back button */}
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
} 