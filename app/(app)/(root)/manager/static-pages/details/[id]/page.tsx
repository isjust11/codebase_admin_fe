'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Eye, Calendar, User, Globe } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import { getStaticPage } from '@/services/static-page-api';
import { StaticPage } from '@/types/static-page';
import { useTranslations } from 'next-intl';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function StaticPageDetails() {
  const [staticPage, setStaticPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useLoading();
  const t = useTranslations('StaticPage');
  const tUtils = useTranslations('Utils');
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchStaticPage = async () => {
      try {
        const data = await getStaticPage(id);
        setStaticPage(data);
      } catch (error) {
        toast.error(t('messages.loadError'));
        navigateTo('/manager/static-pages');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStaticPage();
    }
  }, [id, navigateTo, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">{tUtils('loading')}</span>
      </div>
    );
  }

  if (!staticPage) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-gray-500">{t('messages.notFound')}</span>
      </div>
    );
  }
  return (
    <div>
      <PageBreadcrumb pageTitle={t('staticPageDetails')} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateTo('/manager/static-pages')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                {t('staticPageDetails')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigateTo(`/manager/static-pages/update/${staticPage.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {tUtils('edit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateTo(`/manager/static-pages/${staticPage.slug}/${staticPage.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('viewPage')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('status')}:</span>
              <Badge className={`px-2 py-1 rounded-full text-xs ${
                staticPage.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {staticPage.isActive ? tUtils('active') : tUtils('inactive')}
              </Badge>
            </div>

            {/* Thumbnail */}
            {staticPage.thumbnail && (
              <div className="space-y-2">
                <span className="text-sm font-medium">{t('thumbnail')}:</span>
                <div className="relative w-32 h-20 rounded-md overflow-hidden">
                  <Image
                    src={staticPage.thumbnail}
                    alt={staticPage.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <span className="text-sm font-medium">{t('title')}:</span>
              <h1 className="text-2xl font-bold">{staticPage.title}</h1>
            </div>

            {/* Slug */}
            {staticPage.slug && (
              <div className="space-y-2">
                <span className="text-sm font-medium">{t('slug')}:</span>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    /{staticPage.slug}
                  </code>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <span className="text-sm font-medium">{t('content')}:</span>
              <div className="prose max-w-none">
                <div 
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: staticPage.content }}
                />
              </div>
            </div>

            {/* Meta Information */}
            {(staticPage.metaTitle || staticPage.metaDescription) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('metaInformation')}</h3>
                
                {staticPage.metaTitle && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">{t('metaTitle')}:</span>
                    <p className="text-sm text-gray-600">{staticPage.metaTitle}</p>
                  </div>
                )}

                {staticPage.metaDescription && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">{t('metaDescription')}:</span>
                    <p className="text-sm text-gray-600">{staticPage.metaDescription}</p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">{t('createdAt')}:</span>
                  <p className="text-sm text-gray-600">
                    {staticPage.createdAt ? new Date(staticPage.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-sm font-medium">{t('updatedAt')}:</span>
                  <p className="text-sm text-gray-600">
                    {staticPage.updatedAt ? new Date(staticPage.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
