'use client'
import React, { useState } from 'react'
import { createHerbal } from '@/services/herbal-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Save, Image, X, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Herbal } from '@/types/herbal'
import { Action } from '@/types/actions'
import HerbalForm from '../components/HerbalForm'
import HerbalImageUpload from '../components/HerbalImageUpload'
import { useTranslations } from 'next-intl'
import { useLoading } from '@/contexts/LoadingContext';
const CreateHerbalPage = () => {
  const { navigateTo, back } = useLoading();
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const [loading, setLoading] = useState(false)
  const [createdHerbalId, setCreatedHerbalId] = useState<string | null>(null)

  const handleSubmit = async (formData: Herbal) => {
    setLoading(true)

    try {
      const result = await createHerbal(formData)
      setCreatedHerbalId(result.id!.toString())
      toast.success(t('herbalCreatedSuccess'))
    } catch (error) {
      console.error(t('errorCreatingHerbal'), error)
      toast.error(t('errorCreatingHerbal'))
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
        back();
      },
      title: t('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: <Plus className="h-4 w-4" />,
      onClick: () => handleFormSubmit(),
      title: t('createHerbal'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('createHerbal')} 
        items={[
          { title: t('herbals'), href: '/manager/herbals' },
          { title: tUtils('create'), href: '/manager/herbals/create' }
        ]} 
      />
      
      <div className="space-y-6">
        {!createdHerbalId ? (
          <ComponentCard title={t('herbalInfo')} listAction={listAction}>
            <HerbalForm
              isEditing={false}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </ComponentCard>
        ) : (
          <Tabs defaultValue="images" className="w-full">
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
              <ComponentCard title={t('herbalInfoCreated')}>
                <div className="space-y-4">
                  <p className="text-green-600 font-medium">
                    ✅ {t('herbalCreatedSuccess', { id: createdHerbalId })}
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => navigateTo('/manager/herbals')}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('backToList')}
                    </button>
                    <button
                      onClick={() => navigateTo(`/manager/herbals/update/${createdHerbalId}`)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {t('editHerbal')}
                    </button>
                  </div>
                </div>
              </ComponentCard>
            </TabsContent>

            <TabsContent value="images">
              <ComponentCard title={t('imageManagement')}>
                <HerbalImageUpload herbalId={createdHerbalId!.toString()} />
              </ComponentCard>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

export default CreateHerbalPage 