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
    birthDate: '',
    deathDate: '',
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
    dataSourceId: '',
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
        formData.avatar = uploadResponse.publicRelativePath;
        formData.avatarFile = undefined;
      }
      if (formData.coverImageFile) {
        const uploadResponse = await uploadFile(formData.coverImageFile);
        formData.coverImage = uploadResponse.publicRelativePath;
        formData.coverImageFile = undefined;
      }
      if (formData.portraitFile) {
        const uploadResponse = await uploadFile(formData.portraitFile);
        formData.portrait = uploadResponse.publicRelativePath;
        formData.portraitFile = undefined;
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
    <div className='h-full'>
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