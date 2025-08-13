'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getAuthorById, updateAuthor } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { useTranslations } from 'next-intl'
import AuthorForm, { AuthorFormData } from '@/app/(app)/(root)/manager/authors/components/AuthorForm'
import { uploadFile } from '@/services/media-api'
import { useLoading } from '@/contexts/LoadingContext';

const UpdateAuthorPage = () => {
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const { navigateTo } = useLoading();
  const params = useParams()
  const authorId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<AuthorFormData>({
    name: '',
    alias: '',
    biography: '',
    career: '',
    achievements: '',
    contributions: '',
    works: '',
    philosophy: '',
    legacy: '',
    birthDate: new Date(),
    deathDate: new Date(),
    birthPlace: '',
    deathPlace: '',
    era: '',
    dynasty: '',
    specialty: '',
    teacher: '',
    students: '',
    portrait: '',
    avatar: '',
    coverImage: '',
    galleryImages: [],
    quotes: '',
    anecdotes: '',
    honors: '',
    memorials: '',
    references: '',
    isActive: true,
    avatarFile: undefined,
    portraitFile: undefined,
    coverImageFile: undefined,
    galleryImagesFile: undefined
  })

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await getAuthorById(authorId)
        
        if (response) {
          setFormData({
            name: response.name || '',
            alias: response.alias || '',
            biography: response.biography || '',
            career: response.career || '',
            achievements: response.achievements || '',
            contributions: response.contributions || '',
            works: response.works || '',
            philosophy: response.philosophy || '',
            legacy: response.legacy || '',
            birthDate: response.birthDate ? new Date(response.birthDate) : new Date(),
            deathDate: response.deathDate ? new Date(response.deathDate) : new Date(),
            birthPlace: response.birthPlace || '',
            deathPlace: response.deathPlace || '',
            era: response.era || '',
            dynasty: response.dynasty || '',
            specialty: response.specialty || '',
            teacher: response.teacher || '',
            students: response.students || '',
            portrait: response.portrait || '',
            avatar: (response as any).avatar || '',
            coverImage: (response as any).coverImage || '',
            galleryImages: (response as any).galleryImages || [],
            quotes: response.quotes || '',
            anecdotes: response.anecdotes || '',
            honors: response.honors || '',
            memorials: response.memorials || '',
            references: response.references || '',
            isActive: response.isActive ?? true,
            avatarFile: undefined,
            portraitFile: undefined,
            coverImageFile: undefined,
            galleryImagesFile: undefined
          })
        }
      } catch (error) {
        console.error(t('errorFetchAuthor'), error)
        toast.error(t('messages.errorFetchAuthor'))
      } finally {
        setInitialLoading(false)
      }
    }

    if (authorId) {
      fetchAuthor()
    }
  }, [authorId])

  const handleInputChange = (field: string, value: string | boolean | string[] | Date | File | File[] | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : new Date(),
        deathDate: formData.deathDate ? new Date(formData.deathDate) : new Date()
      }
      if(formData.portraitFile){
        const uploadResponse = await uploadFile(formData.portraitFile);
        updateData.portrait = uploadResponse.url;
        updateData.portrait = updateData.portrait.startsWith('http') ? updateData.portrait.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : updateData.portrait;
      }
      if (formData.avatarFile) {
        const uploadResponse = await uploadFile(formData.avatarFile);
        updateData.avatar = uploadResponse.url;
        updateData.avatar = updateData.avatar.startsWith('http') ? updateData.avatar.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : updateData.avatar;
      }
      if (formData.coverImageFile) {
        const uploadResponse = await uploadFile(formData.coverImageFile);
        updateData.coverImage = uploadResponse.url;
        updateData.coverImage = updateData.coverImage.startsWith('http') ? updateData.coverImage.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : updateData.coverImage;
      }
      if (formData.galleryImagesFile) {
        updateData.galleryImages = await Promise.all(formData.galleryImagesFile.map(async (image) => {
          const uploadResponse = await uploadFile(image);
          return uploadResponse.url.startsWith('http') ? uploadResponse.url.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : uploadResponse.url;
        }));
      }
      await updateAuthor(authorId, updateData)
      toast.success(t('messages.updateSuccess'))
      navigateTo('/manager/authors')
    } catch (error) {
      console.error(t('errorUpdateAuthor'), error)
      toast.error(t('messages.errorUpdateAuthor'))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">{tUtils('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('updateAuthor')} 
        items={[
          { title: t('authors'), href: '/manager/authors' },
          { title: t('updateAuthor'), href: `/manager/authors/update/${authorId}` }
        ]} 
      />
      
      <div className="space-y-6">
        <ComponentCard title={t('authorInfo')}>
          <AuthorForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={() => navigateTo('/manager/authors')}
            loading={loading}
            isEdit={true}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default UpdateAuthorPage 