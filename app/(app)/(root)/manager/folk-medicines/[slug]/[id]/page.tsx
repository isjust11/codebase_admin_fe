'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { getFolkMedicine } from '@/services/folk-medicine-api';
import { FolkMedicine } from '@/types/folk-medicine';
import { ArrowLeft, Edit, Calendar, User, Tag, ThumbsUp, Eye as EyeIcon, BookOpen, FlaskConical, Utensils, Info } from 'lucide-react';
import { mergeImageUrl } from '@/lib/utils';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLoading } from '@/contexts/LoadingContext';
export default function FolkMedicineDetailView() {
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const id = params.id as string;
  const slug = params.slug as string;
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
  }, [id, back, tUtils]);

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
      <PageBreadcrumb 
        pageTitle={t('viewDetail')} 
        items={[
          { title: t('title'), href: '/manager/folk-medicines' },
          { title: folkMedicine.title, href: `/manager/folk-medicines/${folkMedicine.slug}/${folkMedicine.id}` }
        ]}
      />
      
      <div className="space-y-6">
        <ComponentCard title={t('viewDetail')}>
          <div className="space-y-6">
            {/* Header với actions */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{folkMedicine.title}</h1>
                {folkMedicine.summary && (
                  <p className="text-lg text-gray-600 leading-relaxed max-w-4xl">
                    {folkMedicine.summary}
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigateTo(`/manager/folk-medicines/update/${folkMedicine.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('edit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo(`/manager/folk-medicines/detail/${folkMedicine.id}`)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t('backToEdit')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Nội dung chính */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hình ảnh */}
                {folkMedicine.thumbnail && (
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <EyeIcon className="w-5 h-5 mr-2 text-blue-600" />
                        {t('thumbnail')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative w-full h-80">
                        <Image
                          src={mergeImageUrl(folkMedicine.thumbnail)}
                          alt={folkMedicine.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Nội dung chính */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                      {t('content')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: folkMedicine.content }} />
                  </CardContent>
                </Card>

                {/* Thành phần */}
                {folkMedicine.ingredients && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FlaskConical className="w-5 h-5 mr-2 text-purple-600" />
                        {t('ingredients')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                        {folkMedicine.ingredients}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cách chế biến */}
                {folkMedicine.preparation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Utensils className="w-5 h-5 mr-2 text-orange-600" />
                        {t('preparation')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                        {folkMedicine.preparation}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Cách sử dụng */}
                {folkMedicine.usage && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="w-5 h-5 mr-2 text-blue-600" />
                        {t('usage')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                        {folkMedicine.usage}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ghi chú */}
                {folkMedicine.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Info className="w-5 h-5 mr-2 text-yellow-600" />
                        {t('notes')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
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
                    <CardTitle className="text-lg">{t('basicInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600 block">{t('category')}</span>
                        <Badge variant="secondary" className="mt-1">
                          {folkMedicine.category?.name || tUtils('unknown')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600 block">{t('author')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {folkMedicine.author?.name || tUtils('unknown')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600 block">{t('createdAt')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(folkMedicine.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="text-sm text-gray-600 block">{t('updatedAt')}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(folkMedicine.updatedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Badge 
                        variant={folkMedicine.isActive ? "default" : "destructive"}
                        className="text-sm px-3 py-1"
                      >
                        {folkMedicine.isActive ? tUtils('active') : tUtils('inactive')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Thống kê */}

                {/* Thông tin URL */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('urlInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">{t('slug')}</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800 break-all">
                          {folkMedicine.slug}
                        </code>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">ID</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {folkMedicine.id}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Back button */}
            <div className="flex justify-start pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => back()}
                className="px-6 py-2"
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