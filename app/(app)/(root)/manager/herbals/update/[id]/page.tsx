'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getHerbalById, updateHerbal } from '@/services/herbal-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Save, Image, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Herbal } from '@/types/herbal'
import { Action } from '@/types/actions'
import HerbalForm from '../../components/HerbalForm'
import HerbalImageUpload from '../../components/HerbalImageUpload'
import { useTranslations } from 'next-intl'
const UpdateHerbalPage = () => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [herbal, setHerbal] = useState<Herbal | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const t = useTranslations('Herbals')
  const herbalId = params.id as string

  useEffect(() => {
    const fetchHerbal = async () => {
      try {
        setInitialLoading(true)
        const data = await getHerbalById(herbalId)    
        setHerbal(data)
      } catch (error) {
        console.error(t('errorLoadingHerbal'), error)
        toast.error(t('errorLoadingHerbal'))
        router.push('/manager/herbals')
      } finally {
        setInitialLoading(false)
      }
    }

    if (herbalId) {
      fetchHerbal()
    }
  }, [herbalId, router])

  const handleSubmit = async (formData: Herbal) => {
    setLoading(true)

    try {
      await updateHerbal(herbalId, formData)
      toast.success(t('herbalUpdatedSuccess'))
      router.push('/manager/herbals')
    } catch (error) {
      console.error(t('errorUpdatingHerbal'), error)
      toast.error(t('errorUpdatingHerbal'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = () => {
    if (typeof window !== 'undefined' && (window as any).herbalFormSubmit) {
      (window as any).herbalFormSubmit();
    }
  };

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: t('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: <Save className="h-4 w-4" />,
      onClick: () => handleFormSubmit(),
      title: t('update'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  if (!herbal) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">{t('herbalNotFound')}</div>
      </div>
    )
  }

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('updateHerbal')} 
        items={[
          { title: t('herbals'), href: '/manager/herbals' },
          { title: herbal.title, href: `/manager/herbals/update/${herbalId}` }
        ]} 
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t('basicInfo')}
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t('imageManagement')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ComponentCard title={t('herbalInfo')} listAction={listAction}>
              <HerbalForm
                initialData={herbal}
                isEditing={true}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </ComponentCard>
          </TabsContent>

          <TabsContent value="images">
            <ComponentCard title={t('imageManagement')}>
              <HerbalImageUpload herbalId={herbalId} />
            </ComponentCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default UpdateHerbalPage 