'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getArticle } from '@/services/article-api';
import Image from 'next/image';
import { Article } from '@/types/article';

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await getArticle(params.id);
      if (!data) return notFound();
      setArticle(data);
    };
    fetchArticle();
  }, [params.id]);

  if (!article) return null;

  return (
    <div>
          {article.thumbnail && (
            <Image src={article.thumbnail} alt={article.title} width={720} height={480} className="w-full max-w-xl mb-4 rounded" />
          )}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          <div className="text-gray-500 text-sm mb-4">
            {article.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'} | {article.createdAt && new Date(article.createdAt).toLocaleString('vi-VN')}
          </div>
          {article.thumbnail && (
            <Image src={article.thumbnail} alt={article.title} width={720} height={480} className="w-full max-w-xl mb-4 rounded" />
          )}
          {article.description && (
            <div className="mb-4 text-gray-700 italic">{article.description}</div>
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
} 