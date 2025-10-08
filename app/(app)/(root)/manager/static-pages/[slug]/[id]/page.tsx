'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, User, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { toast } from 'sonner';
import { getStaticPageBySlug } from '@/services/static-page-api';
import { StaticPage } from '@/types/static-page';
import { useTranslations } from 'next-intl';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { useParams } from 'next/navigation';
import Image from 'next/image';

export default function StaticPagePreview() {
  const [staticPage, setStaticPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigateTo } = useLoading();
  const t = useTranslations('StaticPage');
  const tUtils = useTranslations('Utils');
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    const fetchStaticPage = async () => {
      try {
        const data = await getStaticPageBySlug(slug);
        setStaticPage(data);
      } catch (error) {
        toast.error(t('messages.loadError'));
        navigateTo('/manager/static-pages');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStaticPage();
    }
  }, [slug, navigateTo, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
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
      <PageBreadcrumb pageTitle={t('staticPagePreview')} />
      <div className="space-y-6">
        {/* Header with actions */}
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
                {t('staticPagePreview')}
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
                  onClick={() => navigateTo(`/manager/static-pages/details/${staticPage.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('viewDetails')}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Page Preview */}
        <div className="bg-white border rounded-lg shadow-sm">
          {/* Status indicator */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`px-2 py-1 rounded-full text-xs ${
                  staticPage.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {staticPage.isActive ? tUtils('active') : tUtils('inactive')}
                </Badge>
                <span className="text-sm text-gray-500">
                  {t('previewMode')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Globe className="w-4 h-4" />
                <span>/pages/{staticPage.slug}</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="p-6">
            {/* Thumbnail */}
            {staticPage.thumbnail && (
              <div className="mb-6">
                <Image
                  src={staticPage.thumbnail}
                  alt={staticPage.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4">{staticPage.title}</h1>

            {/* Content */}
            <div className="prose max-w-none">
              <div 
                className="whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: staticPage.content }}
              />
            </div>

            {/* SEO Meta Information */}
            {(staticPage.metaTitle || staticPage.metaDescription) && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">{t('seoInformation')}</h3>
                
                {staticPage.metaTitle && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">{t('metaTitle')}:</span>
                    <p className="text-sm">{staticPage.metaTitle}</p>
                  </div>
                )}

                {staticPage.metaDescription && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">{t('metaDescription')}:</span>
                    <p className="text-sm">{staticPage.metaDescription}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
