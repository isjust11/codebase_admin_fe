"use client";
import { useEffect, useState } from "react";
import { getArticle } from "@/services/article-api";
import { useParams } from "next/navigation";
import { Article } from "@/types/article";
import { useTranslations } from "next-intl";

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string ;
  const t = useTranslations('ArticlesPage');
  const tUtils = useTranslations('Utils');
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getArticle(id)
      .then((data) => {
        setArticle(data);
        setError("");
      })
      .catch(() => {
        setError(tUtils('notFound'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">{tUtils('loading')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!article) return null;

  return (
    <div className="pb-3 bg-white rounded-lg shadow p-6">
      <div className="flex justify-center items-center">
        <div className="space-y-6 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
          <div className="mb-2 text-gray-500 text-sm">
            {tUtils('createdAt')}: {article.createdAt ? new Date(article.createdAt).toLocaleString() : tUtils('unknown')}
          </div>
          <div className="prose dark:prose-invert max-w-none " dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </div>
  );
}
