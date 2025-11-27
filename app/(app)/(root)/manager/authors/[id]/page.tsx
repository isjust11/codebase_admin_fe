'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'
import { getAuthorById } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Edit, Eye, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { isImgFormat, mergeImageUrl } from '@/lib/utils'
import Image from 'next/image'
import Badge from '@/components/ui/badge/Badge'
import { useTranslations } from 'next-intl'
import { Author } from '@/types/author'
import { Action } from '@/types/actions'

const AuthorDetailPage = () => {
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const { navigateTo } = useLoading()
  const params = useParams()
  const authorId = params.id as string
  
  const [author, setAuthor] = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(true)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true)

  const lstButton:Action[] = [
    {
      title: tUtils('back'),
      className: 'text-gray-600 hover:bg-gray-100 bg-gray-400',
      icon: <ArrowLeft className="w-4 h-4" />,
      onClick: () => navigateTo('/manager/authors')
    },
    {
      title: tUtils('edit'),
      className: 'text-blue-500 hover:bg-blue-100 bg-blue-200',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => navigateTo(`/manager/authors/update/${authorId}`)
    }
  ]
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await getAuthorById(authorId)
        setAuthor(response)
      } catch (error) {
        console.error(tUtils('loadError'), error)
        toast.error(tUtils('loadError'))
      } finally {
        setLoading(false)
      }
    }
    
    if (authorId) {
      fetchAuthor()
    }
  }, [authorId])

  if (!author) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">{t('notFound')}</p>
          <Button 
            onClick={() => navigateTo('/manager/authors')}
            className="mt-4"
          >
            {tUtils('back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('detailAuthor')} 
        items={[
          { title: t('authors'), href: '/manager/authors' },
          { title: author.name, href: `/manager/authors/${authorId}` }
        ]} 
      />
      <div className="space-y-6">
        {/* Header với hình ảnh và thông tin cơ bản */}
        <ComponentCard title={t('basicInfo')} listAction={lstButton}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hình ảnh bên trái */}
            <div className="flex flex-col-1 items-center lg:items-start">
              {(author.portrait || author.avatar) && isImgFormat(author.portrait || author.avatar || '') ? (
                <Image
                  src={mergeImageUrl(author.portrait || author.avatar || '')}
                  alt={author.name}
                  width={400}
                  height={500}
                  className="w-full max-w-md h-auto object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full max-w-md h-96 bg-gray-200 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-gray-500">{t('noImage')}</span>
                </div>
              )}
            </div>

            {/* Thông tin cơ bản bên phải */}
            <div className="space-y-6 col-span-2">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
                {author.alias && (
                  <p className="text-lg text-gray-600 mt-2">{t('alias')}: {author.alias}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <Badge 
                  className={author.isActive ? 'ring-green-400' : 'ring-red-400'} 
                  variant="light" 
                  color={author.isActive ? 'success' : 'error'}
                >
                  {author.isActive ? tUtils('active') : tUtils('inactive')}
                </Badge>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{author.viewCount} {t('views')}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{author.likeCount} {t('likes')}</span>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {author.birthDate && (
                  <div>
                    <span className="font-medium text-gray-900">{t('birthDate')}:</span>
                    <span className="ml-2 text-gray-600">
                      {author.birthDate}
                    </span>
                  </div>
                )}
                {author.deathDate && (
                  <div>
                    <span className="font-medium text-gray-900">{t('deathDate')}:</span>
                    <span className="ml-2 text-gray-600">
                      {author.deathDate}
                    </span>
                  </div>
                )}
                {author.birthPlace && (
                  <div>
                    <span className="font-medium text-gray-900">{t('birthPlace')}:</span>
                    <span className="ml-2 text-gray-600">{author.birthPlace}</span>
                  </div>
                )}
                {author.deathPlace && (
                  <div>
                    <span className="font-medium text-gray-900">{t('deathPlace')}:</span>
                    <span className="ml-2 text-gray-600">{author.deathPlace}</span>
                  </div>
                )}
                {author.era && (
                  <div>
                    <span className="font-medium text-gray-900">{t('era')}:</span>
                    <span className="ml-2 text-gray-600">{author.era}</span>
                  </div>
                )}
                {author.dynasty && (
                  <div>
                    <span className="font-medium text-gray-900">{t('dynasty')}:</span>
                    <span className="ml-2 text-gray-600">{author.dynasty}</span>
                  </div>
                )}
                {author.specialty && (
                  <div>
                    <span className="font-medium text-gray-900">{t('specialty')}:</span>
                    <span className="ml-2 text-gray-600">{author.specialty}</span>
                  </div>
                )}
                {author.teacher && (
                  <div>
                    <span className="font-medium text-gray-900">{t('teacher')}:</span>
                    <span className="ml-2 text-gray-600">{author.teacher}</span>
                  </div>
                )}
                {author.students && (
                  <div>
                    <span className="font-medium text-gray-900">{t('students')}:</span>
                    <span className="ml-2 text-gray-600">{author.students}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Thông tin chi tiết - Collapsible */}
        <ComponentCard title={t('detailInfo')}>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <span className="text-sm text-gray-600">{showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          
          {showDetails && (
            <div className="space-y-6">
              {author.biography && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('biography')}</h4>
                  <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: author.biography }} />
                </div>
              )}

              {author.career && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('career')}</h4>
                  <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: author.career }} />
                </div>
              )}

              {author.achievements && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('achievements')}</h4>
                  <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: author.achievements }} />
                </div>
              )}

              {author.contributions && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('contributions')}</h4>
                  <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: author.contributions }} />
                </div>
              )}

              {author.works && (
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{t('works')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.works}</p>
                </div>
              )}

              {author.philosophy && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('philosophy')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.philosophy}</p>
                </div>
              )}

              {author.legacy && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('legacy')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.legacy}</p>
                </div>
              )}

              {author.quotes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('quotes')}</h4>
                  <p className="text-gray-700 leading-relaxed italic">"{author.quotes}"</p>
                </div>
              )}

              {author.anecdotes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('anecdotes')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.anecdotes}</p>
                </div>
              )}

              {author.honors && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('honors')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.honors}</p>
                </div>
              )}

              {author.memorials && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('memorials')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.memorials}</p>
                </div>
              )}

              {author.references && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('references')}</h4>
                  <p className="text-gray-700 leading-relaxed">{author.references}</p>
                </div>
              )}
            </div>
          )}
        </ComponentCard>

        {/* Thông tin bổ sung - Collapsible */}
        <ComponentCard title={t('additionalInfo')}>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <button
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <span className="text-sm text-gray-600">{showAdditionalInfo ? 'Ẩn thông tin bổ sung' : 'Xem thông tin bổ sung'}</span>
              {showAdditionalInfo ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
          
          {showAdditionalInfo && (
            <div className="space-y-6">
              {/* Tác phẩm liên quan */}
              {(author.herbals && author.herbals.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('relatedHerbals')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {author.herbals.map((herbal: any) => (
                      <div key={herbal.id} className="border rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900">{herbal.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{herbal.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(author.folkMedicines && author.folkMedicines.length > 0) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('relatedFolkMedicines')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {author.folkMedicines.map((folkMedicine: any) => (
                      <div key={folkMedicine.id} className="border rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900">{folkMedicine.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{folkMedicine.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thông tin hệ thống */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">{t('systemInfo')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{t('createdAt')}:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(author.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{t('updatedAt')}:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(author.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{t('slug')}:</span>
                    <span className="ml-2 text-gray-600">{author.slug}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">ID:</span>
                    <span className="ml-2 text-gray-600">{author.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ComponentCard>

       
      </div>
    </div>
  )
}

export default AuthorDetailPage 