"use client";
import { useEffect, useState } from "react";
import { getArticle } from "@/services/article-api";
import { useParams } from "next/navigation";
import { Article } from "@/types/article";

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string ;

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
        setError("Không tìm thấy bài viết hoặc có lỗi khi tải dữ liệu.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!article) return null;

  return (
    <div className="pb-3">
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow max-h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <div className="mb-2 text-gray-500 text-sm">
        Ngày đăng: {article.createdAt ? new Date(article.createdAt).toLocaleString() : "Không rõ"}
      </div>
      {article.description && (
        <div className="mb-4 text-lg text-gray-700 dark:text-gray-300">{article.description}</div>
      )}
      <div className="prose dark:prose-invert max-w-none " dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
    </div>
  );
}
