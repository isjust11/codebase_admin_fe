'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useRouter, useParams } from 'next/navigation'
import { getAuthorById, updateAuthor } from '@/services/author-api'
import { toast } from 'sonner'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ComponentCard from '@/components/common/ComponentCard'
import { ArrowLeft, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ImageUpload from '@/components/ui/ImageUpload';
import MultipleImageUpload from '@/components/ui/MultipleImageUpload';

interface AuthorFormData {
  name: string
  alias: string
  biography: string
  career: string
  achievements: string
  contributions: string
  works: string
  philosophy: string
  legacy: string
  birthDate: Date
  deathDate: Date
  birthPlace: string
  deathPlace: string
  era: string
  dynasty: string
  specialty: string
  teacher: string
  students: string
  portrait: string
  avatar: string
  coverImage: string
  galleryImages: string[]
  quotes: string
  anecdotes: string
  honors: string
  memorials: string
  references: string
  isActive: boolean
}

const UpdateAuthorPage = () => {
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const router = useRouter()
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
    isActive: true
  })

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await getAuthorById(parseInt(authorId))
        
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
            isActive: response.isActive ?? true
          })
        }
      } catch (error) {
        console.error(t('errorLoadAuthor'), error)
        toast.error(t('messages.errorLoadAuthor'))
      } finally {
        setInitialLoading(false)
      }
    }
    
    if (authorId) {
      fetchAuthor()
    }
  }, [authorId])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
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
      await updateAuthor(parseInt(authorId), updateData)
      toast.success(t('messages.updateSuccess'))
      router.push('/manager/authors')
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
        pageTitle={t('update')} 
        items={[
          { title: t('title'), href: '/manager/authors' },
          { title: t('update'), href: `/manager/authors/update/${authorId}` }
        ]} 
      />
      
      <div className="space-y-6">
        <ComponentCard title={t('title')}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên tác giả */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('placeholderName')}
                  required
                />
              </div>

              {/* Bút danh */}
              <div className="space-y-2">
                <Label htmlFor="alias">{t('alias')}</Label>
                <Input
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => handleInputChange('alias', e.target.value)}
                  placeholder={t('placeholderAlias')}
                />
              </div>

              {/* Nơi sinh */}
              <div className="space-y-2">
                <Label htmlFor="birthPlace">{t('birthPlace')}</Label>
                <Input
                  id="birthPlace"
                  value={formData.birthPlace}
                  onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  placeholder={t('placeholderBirthPlace')}
                />
              </div>

              {/* Nơi mất */}
              <div className="space-y-2">
                <Label htmlFor="deathPlace">{t('deathPlace')}</Label>
                <Input
                  id="deathPlace"
                  value={formData.deathPlace}
                  onChange={(e) => handleInputChange('deathPlace', e.target.value)}
                  placeholder={t('placeholderDeathPlace')}
                />
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">{t('birthDate')}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>

              {/* Ngày mất */}
              <div className="space-y-2">
                <Label htmlFor="deathDate">{t('deathDate')}</Label>
                <Input
                  id="deathDate"
                  type="date"
                  value={formData.deathDate.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('deathDate', e.target.value)}
                />
              </div>

              {/* Thời kỳ */}
              <div className="space-y-2">
                <Label htmlFor="era">{t('era')}</Label>
                <Input
                  id="era"
                  value={formData.era}
                  onChange={(e) => handleInputChange('era', e.target.value)}
                  placeholder={t('placeholderEra')}
                />
              </div>

              {/* Triều đại */}
              <div className="space-y-2">
                <Label htmlFor="dynasty">{t('dynasty')}</Label>
                <Input
                  id="dynasty"
                  value={formData.dynasty}
                  onChange={(e) => handleInputChange('dynasty', e.target.value)}
                  placeholder={t('placeholderDynasty')}
                />
              </div>

              {/* Chuyên môn */}
              <div className="space-y-2">
                <Label htmlFor="specialty">{t('specialty')}</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder={t('placeholderSpecialty')}
                />
              </div>

              {/* Thầy dạy */}
              <div className="space-y-2">
                <Label htmlFor="teacher">{t('teacher')}</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleInputChange('teacher', e.target.value)}
                  placeholder={t('placeholderTeacher')}
                />
              </div>

              {/* Học trò */}
              <div className="space-y-2">
                <Label htmlFor="students">{t('students')}</Label>
                <Input
                  id="students"
                  value={formData.students}
                  onChange={(e) => handleInputChange('students', e.target.value)}
                  placeholder={t('placeholderStudents')}
                />
              </div>

              {/* Hình ảnh */}
              <div className="space-y-2">
                <Label htmlFor="portrait">{t('portrait')}</Label>
                <ImageUpload
                  value={formData.portrait}
                  onChange={(value) => handleInputChange('portrait', value)}
                  placeholder="Upload ảnh chân dung chính"
                />
              </div>

              {/* Hình đại diện */}
              <div className="space-y-2">
                <Label htmlFor="avatar">Hình đại diện</Label>
                <ImageUpload
                  value={formData.avatar}
                  onChange={(value) => handleInputChange('avatar', value)}
                  placeholder="Upload ảnh đại diện"
                />
              </div>

              {/* Hình bìa */}
              <div className="space-y-2">
                <Label htmlFor="coverImage">Hình bìa</Label>
                <ImageUpload
                  value={formData.coverImage}
                  onChange={(value) => handleInputChange('coverImage', value)}
                  placeholder="Upload ảnh bìa"
                />
              </div>

              {/* Bộ sưu tập hình ảnh */}
              <div className="space-y-2">
                <Label htmlFor="galleryImages">Bộ sưu tập hình ảnh</Label>
                <MultipleImageUpload
                  value={formData.galleryImages}
                  onChange={(value) => handleInputChange('galleryImages', value)}
                  placeholder="Upload thư viện ảnh"
                  maxImages={10}
                />
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label htmlFor="isActive">{t('isActive')}</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">{formData.isActive ? tUtils('active') : tUtils('inactive')}</Label>
                </div>
              </div>
            </div>

            {/* Tiểu sử */}
            <div className="space-y-2">
              <Label htmlFor="biography">{t('biography')}</Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => handleInputChange('biography', e.target.value)}
                placeholder={t('placeholderBiography')}
                rows={4}
              />
            </div>

            {/* Sự nghiệp */}
            <div className="space-y-2">
              <Label htmlFor="career">{t('career')}</Label>
              <Textarea
                id="career"
                value={formData.career}
                onChange={(e) => handleInputChange('career', e.target.value)}
                placeholder={t('placeholderCareer')}
                rows={4}
              />
            </div>

            {/* Thành tựu */}
            <div className="space-y-2">
              <Label htmlFor="achievements">{t('achievements')}</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                placeholder={t('placeholderAchievements')}
                rows={4}
              />
            </div>

            {/* Đóng góp */}
            <div className="space-y-2">
              <Label htmlFor="contributions">{t('contributions')}</Label>
              <Textarea
                id="contributions"
                value={formData.contributions}
                onChange={(e) => handleInputChange('contributions', e.target.value)}
                placeholder={t('placeholderContributions')}
                rows={4}
              />
            </div>

            {/* Tác phẩm */}
            <div className="space-y-2">
              <Label htmlFor="works">{t('works')}</Label>
              <Textarea
                id="works"
                value={formData.works}
                onChange={(e) => handleInputChange('works', e.target.value)}
                placeholder={t('placeholderWorks')}
                rows={4}
              />
            </div>

            {/* Triết lý */}
            <div className="space-y-2">
              <Label htmlFor="philosophy">{t('philosophy')}</Label>
              <Textarea
                id="philosophy"
                value={formData.philosophy}
                onChange={(e) => handleInputChange('philosophy', e.target.value)}
                placeholder={t('placeholderPhilosophy')}
                rows={4}
              />
            </div>

            {/* Di sản */}
            <div className="space-y-2">
              <Label htmlFor="legacy">{t('legacy')}</Label>
              <Textarea
                id="legacy"
                value={formData.legacy}
                onChange={(e) => handleInputChange('legacy', e.target.value)}
                placeholder={t('placeholderLegacy')}
                rows={4}
              />
            </div>

            {/* Trích dẫn */}
            <div className="space-y-2">
              <Label htmlFor="quotes">{t('quotes')}</Label>
              <Textarea
                id="quotes"
                value={formData.quotes}
                onChange={(e) => handleInputChange('quotes', e.target.value)}
                placeholder={t('placeholderQuotes')}
                rows={4}
              />
            </div>

            {/* Giai thoại */}
            <div className="space-y-2">
              <Label htmlFor="anecdotes">{t('anecdotes')}</Label>
              <Textarea
                id="anecdotes"
                value={formData.anecdotes}
                onChange={(e) => handleInputChange('anecdotes', e.target.value)}
                placeholder={t('placeholderAnecdotes')}
                rows={4}
              />
            </div>

            {/* Danh hiệu */}
            <div className="space-y-2">
              <Label htmlFor="honors">{t('honors')}</Label>
              <Textarea
                id="honors"
                value={formData.honors}
                onChange={(e) => handleInputChange('honors', e.target.value)}
                placeholder={t('placeholderHonors')}
                rows={4}
              />
            </div>

            {/* Tưởng niệm */}
            <div className="space-y-2">
              <Label htmlFor="memorials">{t('memorials')}</Label>
              <Textarea
                id="memorials"
                value={formData.memorials}
                onChange={(e) => handleInputChange('memorials', e.target.value)}
                placeholder={t('placeholderMemorials')}
                rows={4}
              />
            </div>

            {/* Tài liệu tham khảo */}
            <div className="space-y-2">
              <Label htmlFor="references">{t('references')}</Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder={t('placeholderReferences')}
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/manager/authors')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {tUtils('back')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? tUtils('loading') : t('update')}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </div>
  )
}

export default UpdateAuthorPage 