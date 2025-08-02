'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { getAuthorById } from '@/services/author-api'
import { Author } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit, Eye, Heart } from 'lucide-react'
import { mergeImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Badge from '@/components/ui/badge/Badge'

const AuthorDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const authorId = params.id as string
  
  const [author, setAuthor] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await getAuthorById(parseInt(authorId))
        setAuthor(response)
      } catch (error) {
        console.error('Lỗi khi tải thông tin tác giả:', error)
        toast.error('Có lỗi xảy ra khi tải thông tin tác giả')
      } finally {
        setLoading(false)
      }
    }
    
    if (authorId) {
      fetchAuthor()
    }
  }, [authorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Đang tải thông tin tác giả...</p>
        </div>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Không tìm thấy tác giả</p>
          <Button 
            onClick={() => router.push('/manager/authors')}
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle="Chi tiết tác giả" 
        items={[
          { title: 'Tác giả', href: '/manager/authors' },
          { title: author.name, href: `/manager/authors/${authorId}` }
        ]} 
      />
      
      <div className="space-y-6">
        {/* Header với hình ảnh và thông tin cơ bản */}
        <ComponentCard title="Thông tin cơ bản">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hình ảnh */}
            <div className="lg:col-span-1">
              {author.portrait ? (
                <Image
                  src={mergeImageUrl(author.portrait)}
                  alt={author.name}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Thông tin cơ bản */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
                {author.alias && (
                  <p className="text-lg text-gray-600 mt-2">Bút danh: {author.alias}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Badge 
                  className={author.isActive ? 'ring-green-400' : 'ring-red-400'} 
                  variant="light" 
                  color={author.isActive ? 'success' : 'error'}
                >
                  {author.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Badge>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{author.viewCount} lượt xem</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{author.likeCount} lượt thích</span>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {author.birthDate && (
                  <div>
                    <span className="font-medium text-gray-900">Ngày sinh:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(author.birthDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {author.deathDate && (
                  <div>
                    <span className="font-medium text-gray-900">Ngày mất:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(author.deathDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {author.birthPlace && (
                  <div>
                    <span className="font-medium text-gray-900">Nơi sinh:</span>
                    <span className="ml-2 text-gray-600">{author.birthPlace}</span>
                  </div>
                )}
                {author.deathPlace && (
                  <div>
                    <span className="font-medium text-gray-900">Nơi mất:</span>
                    <span className="ml-2 text-gray-600">{author.deathPlace}</span>
                  </div>
                )}
                {author.era && (
                  <div>
                    <span className="font-medium text-gray-900">Thời kỳ:</span>
                    <span className="ml-2 text-gray-600">{author.era}</span>
                  </div>
                )}
                {author.dynasty && (
                  <div>
                    <span className="font-medium text-gray-900">Triều đại:</span>
                    <span className="ml-2 text-gray-600">{author.dynasty}</span>
                  </div>
                )}
                {author.specialty && (
                  <div>
                    <span className="font-medium text-gray-900">Chuyên môn:</span>
                    <span className="ml-2 text-gray-600">{author.specialty}</span>
                  </div>
                )}
                {author.teacher && (
                  <div>
                    <span className="font-medium text-gray-900">Thầy dạy:</span>
                    <span className="ml-2 text-gray-600">{author.teacher}</span>
                  </div>
                )}
                {author.students && (
                  <div>
                    <span className="font-medium text-gray-900">Học trò:</span>
                    <span className="ml-2 text-gray-600">{author.students}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Thông tin chi tiết */}
        <ComponentCard title="Thông tin chi tiết">
          {author.biography && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tiểu sử</h4>
              <p className="text-gray-700 leading-relaxed">{author.biography}</p>
            </div>
          )}

          {author.career && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Sự nghiệp</h4>
              <p className="text-gray-700 leading-relaxed">{author.career}</p>
            </div>
          )}

          {author.achievements && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Thành tựu</h4>
              <p className="text-gray-700 leading-relaxed">{author.achievements}</p>
            </div>
          )}

          {author.contributions && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Đóng góp</h4>
              <p className="text-gray-700 leading-relaxed">{author.contributions}</p>
            </div>
          )}

          {author.works && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tác phẩm</h4>
              <p className="text-gray-700 leading-relaxed">{author.works}</p>
            </div>
          )}

          {author.philosophy && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Triết lý</h4>
              <p className="text-gray-700 leading-relaxed">{author.philosophy}</p>
            </div>
          )}

          {author.legacy && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Di sản</h4>
              <p className="text-gray-700 leading-relaxed">{author.legacy}</p>
            </div>
          )}

          {author.quotes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Trích dẫn</h4>
              <p className="text-gray-700 leading-relaxed italic">"{author.quotes}"</p>
            </div>
          )}

          {author.anecdotes && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Giai thoại</h4>
              <p className="text-gray-700 leading-relaxed">{author.anecdotes}</p>
            </div>
          )}

          {author.honors && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Danh hiệu</h4>
              <p className="text-gray-700 leading-relaxed">{author.honors}</p>
            </div>
          )}

          {author.memorials && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tưởng niệm</h4>
              <p className="text-gray-700 leading-relaxed">{author.memorials}</p>
            </div>
          )}

          {author.references && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Tài liệu tham khảo</h4>
              <p className="text-gray-700 leading-relaxed">{author.references}</p>
            </div>
          )}
        </ComponentCard>

        {/* Tác phẩm liên quan */}
        {(author.herbals && author.herbals.length > 0) && (
          <ComponentCard title="Thảo dược liên quan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {author.herbals.map((herbal: any) => (
                <div key={herbal.id} className="border rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900">{herbal.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{herbal.summary}</p>
                </div>
              ))}
            </div>
          </ComponentCard>
        )}

        {(author.folkMedicines && author.folkMedicines.length > 0) && (
          <ComponentCard title="Bài thuốc dân gian liên quan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {author.folkMedicines.map((folkMedicine: any) => (
                <div key={folkMedicine.id} className="border rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900">{folkMedicine.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{folkMedicine.summary}</p>
                </div>
              ))}
            </div>
          </ComponentCard>
        )}

        {/* Thông tin hệ thống */}
        <ComponentCard title="Thông tin hệ thống">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Ngày tạo:</span>
              <span className="ml-2 text-gray-600">
                {new Date(author.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Ngày cập nhật:</span>
              <span className="ml-2 text-gray-600">
                {new Date(author.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Slug:</span>
              <span className="ml-2 text-gray-600">{author.slug}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">ID:</span>
              <span className="ml-2 text-gray-600">{author.id}</span>
            </div>
          </div>
        </ComponentCard>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/manager/authors')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <Button
            onClick={() => router.push(`/manager/authors/update/${authorId}`)}
            className="flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AuthorDetailPage 