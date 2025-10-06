'use client'
import React, { useState } from 'react'
import { createAuthor } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { useTranslations } from 'next-intl'
import AuthorForm, { AuthorFormData } from '@/app/(app)/(root)/manager/authors/components/AuthorForm'
import { uploadFile } from '@/services/media-api'
import { useLoading } from '@/contexts/LoadingContext';

const CreateAuthorPage = () => {
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const { navigateTo } = useLoading();
  const [loading, setLoading] = useState(false)
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
    dataSourceId: null,
    isActive: true,
    avatarFile: undefined,
    portraitFile: undefined,
    coverImageFile: undefined,
    galleryImagesFile: undefined
  })

  const handleInputChange = (field: string, value: string | boolean | string[] | Date | File | File[] | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.avatarFile) {
        const uploadResponse = await uploadFile(formData.avatarFile);
        formData.avatar = uploadResponse.url;
        formData.avatar = formData.avatar.startsWith('http') ? formData.avatar.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : formData.avatar;
      }
      if (formData.coverImageFile) {
        const uploadResponse = await uploadFile(formData.coverImageFile);
        formData.coverImage = uploadResponse.url;
        formData.coverImage = formData.coverImage.startsWith('http') ? formData.coverImage.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : formData.coverImage;
      }
      if (formData.galleryImagesFile) {
        formData.galleryImages = await Promise.all(formData.galleryImagesFile.map(async (image) => {
          const uploadResponse = await uploadFile(image);
          return uploadResponse.url.startsWith('http') ? uploadResponse.url.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : uploadResponse.url;
        }));
      }
      await createAuthor(formData)
      toast.success(tUtils('createSuccess'))
      navigateTo('/manager/authors')
    } catch (error) {
      console.error(tUtils('createError'), error)
      toast.error(tUtils('createError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('createAuthor')} 
        items={[
          { title: t('authors'), href: '/manager/authors' },
          { title: t('createAuthor'), href: '/manager/authors/create' }
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
            isEdit={false}
          />
        </ComponentCard>
      </div>
    </div>
  )
}

export default CreateAuthorPage 