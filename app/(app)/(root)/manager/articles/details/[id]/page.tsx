'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { getArticle } from '@/services/article-api';
import { Article } from '@/types/article';
import { useTranslations } from 'next-intl';
import { BadgeInfo, Eye } from 'lucide-react';

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [article, setArticle] = useState<Article | null>(null);
  const tUtils = useTranslations('Utils');
  useEffect(() => {
    const fetchArticle = async () => {
      const data = await getArticle(id);
      if (!data) return notFound();
      setArticle(data);
    };
    fetchArticle();
  }, [id]);

  if (!article) return null;

  return (
    <div className="pb-3 bg-white rounded-lg shadow p-6">
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex justify-center items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
            <div className="text-gray-500 text-sm mb-4">
              {article.status?.name ? article.status?.name : tUtils('unknown')} | {article.createdAt && new Date(article.createdAt).toLocaleString('vi-VN')}
            </div>
            <div className="text-gray-500 text-sm mb-4">
              {tUtils('likes')}: <span className="text-blue-500">{article.like ? article.like : 0}</span> | {tUtils('views')}: <span className="text-emerald-500">{article.view ? article.view : 0}</span>
            </div>
            {article.content && (
              <div className="mb-4 text-gray-700 italic" dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}