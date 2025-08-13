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
import { useTranslations } from 'next-intl';
import { useLoading } from '@/contexts/LoadingContext';

export default function FolkMedicineDetail() {
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations('FolkMedicinesPage');
  const tUtils = useTranslations('Utils');
  const [loading, setLoading] = useState(true);
  const [folkMedicine, setFolkMedicine] = useState<FolkMedicine | null>(null);

  useEffect(() => {
    const fetchFolkMedicine = async () => {
      try {
        const data = await getFolkMedicine(id);
        setFolkMedicine(data);
      } catch (error) {
        toast.error(tUtils('loadError'));
        navigateTo('/manager/folk-medicines');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFolkMedicine();
    }
  }, [id, back]);

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
        <p>{tUtils('notFound')}</p>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={t('title')} />
      <div className="space-y-6">
        <ComponentCard title={t('title')}>
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
                  onClick={() => navigateTo(`/manager/folk-medicines/update/${folkMedicine.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('edit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo(`/manager/folk-medicines/${folkMedicine.slug}/${folkMedicine.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('viewDetail')}
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
                      <CardTitle>{t('thumbnail')}</CardTitle>
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
                    <CardTitle>{t('content')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: folkMedicine.content }} />
                  </CardContent>
                </Card>

                {/* Thành phần */}
                {folkMedicine.ingredients && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('ingredients')}</CardTitle>
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
                      <CardTitle>{t('preparation')}</CardTitle>
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
                      <CardTitle>{t('usage')}</CardTitle>
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
                      <CardTitle>{t('notes')}</CardTitle>
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
                    <CardTitle>{t('basicInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t('category')}:</span>
                      <Badge variant="secondary">
                        {folkMedicine.category?.name || tUtils('unknown')}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t('author')}:</span>
                      <span className="text-sm font-medium">
                        {folkMedicine.author || tUtils('unknown')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t('createdAt')}:</span>
                      <span className="text-sm font-medium">
                        {new Date(folkMedicine.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{t('updatedAt')}:</span>
                      <span className="text-sm font-medium">
                        {new Date(folkMedicine.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={folkMedicine.isActive ? "default" : "destructive"}>
                        {folkMedicine.isActive ? tUtils('active') : tUtils('inactive')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Thống kê */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('statistics')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{t('viewCount')}:</span>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {folkMedicine.viewCount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">{t('likeCount')}:</span>
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
                    <CardTitle>{t('urlInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 break-all">
                      <strong>{t('slug')}:</strong> {folkMedicine.slug}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Back button */}
            <div className="flex justify-start">
              <Button
                variant="outline"
                onClick={() => back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {tUtils('back')}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
} 