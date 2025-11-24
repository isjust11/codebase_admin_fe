'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import ImageUpload from '@/components/ui/ImageUpload'
import Switch from '@/components/form/switch/Switch'
import { ArrowLeft, Save, ChevronDown, ChevronRight } from 'lucide-react'
import { DataSource } from '@/types/data-source'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAllDataSources, getDataSources } from '@/services/manager-api'
import { z } from 'zod'
import { toast } from 'sonner'

export interface AuthorFormData {
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
  dataSourceId: number | null
  isActive: boolean
  avatarFile?: File | null
  portraitFile?: File | null
  coverImageFile?: File | null
  galleryImagesFile?: File[]
}

const authorFormSchema = (t: any) => z.object({
  name: z.string().min(3, t('validation.nameMinLength'))
    .refine(val => val.trim() !== '', t('validation.nameRequired')),
  alias: z.string().optional(),
  biography: z.string().min(10, t('validation.biographyMinLength'))
    .refine(val => val.trim() !== '', t('validation.biographyRequired')),
  career: z.string().optional(),
  achievements: z.string().optional(),
  contributions: z.string().optional(),
  works: z.string().optional(),
  philosophy: z.string().optional(),
  legacy: z.string().optional(),
  birthDate: z.date().optional(),
  deathDate: z.date().optional(),
  birthPlace: z.string().optional(),
  deathPlace: z.string().optional(),
  era: z.string().optional(),
  dynasty: z.string().optional(),
  specialty: z.string().optional(),
  teacher: z.string().optional(),
  students: z.string().optional(),
  portrait: z.string().optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  quotes: z.string().optional(),
  anecdotes: z.string().optional(),
  honors: z.string().optional(),
  memorials: z.string().optional(),
  references: z.string().optional(),
  dataSourceId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  avatarFile: z.instanceof(File).optional(),
  portraitFile: z.instanceof(File).optional(),
  coverImageFile: z.instanceof(File).optional(),
  galleryImagesFile: z.array(z.instanceof(File)).optional(),
});

interface AuthorFormProps {
  formData: AuthorFormData
  onInputChange: (field: string, value: string | boolean | string[] | File | File[] | number | null) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  loading: boolean
  isEdit?: boolean
}

const AuthorForm: React.FC<AuthorFormProps> = ({
  formData = {
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
    isActive: true,
    avatar: '',
    portrait: '',
    coverImage: '',
    galleryImages: [],
    quotes: '',
    anecdotes: '',
    honors: '',
    memorials: '',
    references: '',
    dataSourceId: null,
    birthPlace: '',
    deathPlace: '',
    era: '',
    dynasty: '',
    specialty: '',
    teacher: '',
    students: '',
    avatarFile: null,
    portraitFile: null,
    coverImageFile: null,
    galleryImagesFile: [],
    dataSource: null,
  },
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  isEdit = false
}) => {
  const t = useTranslations('AuthorsPage')
  const tUtils = useTranslations('Utils')
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false)
  const [isCareerInfoOpen, setIsCareerInfoOpen] = useState(false)
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loadingDataSources, setLoadingDataSources] = useState(false)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AuthorFormData, string>>>({})
  const authorForm = authorFormSchema(t)
  const handleDateChange = (field: string, value: string) => {
    onInputChange(field, value)
  }

  const handleImageChange = (field: string, value: File | null) => {
    onInputChange(field, value)
  }

  const handleMultipleImageChange = (field: string, value: File[] | null) => {
    onInputChange(field, value)
  }

  // Fetch data sources on component mount
  useEffect(() => {
    const fetchDataSources = async () => {
      setLoadingDataSources(true)
      try {
        const response = await getAllDataSources()
        setDataSources(response)
      } catch (error) {
        console.error('Error fetching data sources:', error)
      } finally {
        setLoadingDataSources(false)
      }
    }

    fetchDataSources()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await authorForm.safeParseAsync(formData)
    console.log(result)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        name: fieldErrors.name?.[0],
        alias: fieldErrors.alias?.[0],
        biography: fieldErrors.biography?.[0],
        career: fieldErrors.career?.[0],
        achievements: fieldErrors.achievements?.[0],
        contributions: fieldErrors.contributions?.[0],
        works: fieldErrors.works?.[0],
        philosophy: fieldErrors.philosophy?.[0],
        legacy: fieldErrors.legacy?.[0],
        birthDate: fieldErrors.birthDate?.[0],
        deathDate: fieldErrors.deathDate?.[0],
        birthPlace: fieldErrors.birthPlace?.[0],
        deathPlace: fieldErrors.deathPlace?.[0],
        era: fieldErrors.era?.[0],
        dynasty: fieldErrors.dynasty?.[0],
        specialty: fieldErrors.specialty?.[0],
        teacher: fieldErrors.teacher?.[0],
        students: fieldErrors.students?.[0],
        portrait: fieldErrors.portrait?.[0],
        avatar: fieldErrors.avatar?.[0],
        coverImage: fieldErrors.coverImage?.[0],
        galleryImages: fieldErrors.galleryImages?.[0],
        quotes: fieldErrors.quotes?.[0],
        anecdotes: fieldErrors.anecdotes?.[0],
        honors: fieldErrors.honors?.[0],
        memorials: fieldErrors.memorials?.[0],
        references: fieldErrors.references?.[0],
        dataSourceId: fieldErrors.dataSourceId?.[0],
        isActive: fieldErrors.isActive?.[0],
        avatarFile: fieldErrors.avatarFile?.[0],
        portraitFile: fieldErrors.portraitFile?.[0],
        coverImageFile: fieldErrors.coverImageFile?.[0],
        galleryImagesFile: fieldErrors.galleryImagesFile?.[0],
      } as Partial<Record<keyof AuthorFormData, string>>);
      toast.error(t('validation.validationError'))
      return
    }
    setFormErrors({})
    onSubmit(e)
  }

  const handleChangeTitle = (field: string, value: string) => {
    onInputChange(field, value)
    if (value.length < 3) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.nameMinLength') }))
    }else{
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleChangeBiography = (field: string, value: string) => {
    onInputChange(field, value)
    if (value.length < 10) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.biographyMinLength') }))
    }else{
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái - Phần ảnh (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('images')}</h3>
            
            {/* Hình ảnh chính */}
            <div className="space-y-4">
              {/* Hình đại diện */}
              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-sm font-medium">{t('avatar')} *</Label>
                <ImageUpload
                  value={formData.avatar ? formData.avatar : undefined}
                  onChange={(value) => handleImageChange('avatarFile', value)}
                  placeholder={t('uploadAvatar')}
                />
              </div>

              {/* Hình chân dung */}
              <div className="space-y-2">
                <Label htmlFor="portrait" className="text-sm font-medium">{t('portrait')}</Label>
                <ImageUpload
                  value={formData.portrait ? formData.portrait : undefined}
                  onChange={(value) => handleImageChange('portraitFile', value)}
                  placeholder={t('uploadPortrait')}
                />
              </div>

              {/* Hình bìa */}
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-sm font-medium">{t('coverImage')}</Label>
                <ImageUpload
                  value={formData.coverImage ? formData.coverImage : undefined}
                  onChange={(value) => handleImageChange('coverImageFile', value)}
                  placeholder={t('uploadCoverImage')}
                />
              </div>

              {/* Bộ sưu tập hình ảnh */}
              <div className="space-y-2">
                <Label htmlFor="galleryImages" className="text-sm font-medium">{t('galleryImages')}</Label>
                <ImageUpload
                  multiple={true}
                  value={formData.galleryImages}
                  onChange={(value: File[] | null) => handleMultipleImageChange('galleryImagesFile', value)}
                  placeholder={t('uploadGalleryImages')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Phần nội dung (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin cơ bản - Luôn mở */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t('basicInformation')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tên tác giả */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChangeTitle('name', e.target.value)}
                  placeholder={t('enterName')}
                />
                {formErrors.name && (
                  <div className="text-red-500 text-sm">{formErrors.name}</div>
                )}
              </div>

              {/* Bút danh */}
              <div className="space-y-2">
                <Label htmlFor="alias">{t('alias')}</Label>
                <Input
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => onInputChange('alias', e.target.value)}
                  placeholder={t('enterAlias')}
                />
              </div>
            </div>

            {/* Tiểu sử */}
            <div className="space-y-2 mt-4">
              <Label htmlFor="biography">{t('biography')} *</Label>
              <Textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => handleChangeBiography('biography', e.target.value)}
                placeholder={t('enterBiography')}
                rows={4}
                
              />
              {formErrors.biography && (
                <div className="text-red-500 text-sm">{formErrors.biography}</div>
              )}
            </div>
          </div>
          {/* Trạng thái */}
            <div className="pt-4 border-t border-gray-200">
              <Label htmlFor="isActive" className="text-sm font-medium">{t('isActive')}</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  onChange={(checked: boolean) => onInputChange('isActive', checked)}
                  label={formData.isActive ? t('active') : t('inactive')}
                />
              </div>
            </div>

          {/* Thông tin cá nhân - Có thể collapse */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-6 h-auto hover:bg-gray-50"
              onClick={() => setIsPersonalInfoOpen(!isPersonalInfoOpen)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('personalInformation')}</h3>
              {isPersonalInfoOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            {isPersonalInfoOpen && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nơi sinh */}
                  <div className="space-y-2">
                    <Label htmlFor="birthPlace">{t('birthPlace')}</Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => onInputChange('birthPlace', e.target.value)}
                      placeholder={t('enterBirthPlace')}
                    />
                  </div>

                  {/* Nơi mất */}
                  <div className="space-y-2">
                    <Label htmlFor="deathPlace">{t('deathPlace')}</Label>
                    <Input
                      id="deathPlace"
                      value={formData.deathPlace}
                      onChange={(e) => onInputChange('deathPlace', e.target.value)}
                      placeholder={t('enterDeathPlace')}
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">{t('birthDate')}</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate.toISOString().split('T')[0]}
                      onChange={(e) => handleDateChange('birthDate', e.target.value)}
                    />
                  </div>

                  {/* Ngày mất */}
                  <div className="space-y-2">
                    <Label htmlFor="deathDate">{t('deathDate')}</Label>
                    <Input
                      id="deathDate"
                      type="date"
                      value={formData.deathDate.toISOString().split('T')[0]}
                      onChange={(e) => handleDateChange('deathDate', e.target.value)}
                    />
                  </div>

                  {/* Thời kỳ */}
                  <div className="space-y-2">
                    <Label htmlFor="era">{t('era')}</Label>
                    <Input
                      id="era"
                      value={formData.era}
                      onChange={(e) => onInputChange('era', e.target.value)}
                      placeholder={t('enterEra')}
                    />
                  </div>

                  {/* Triều đại */}
                  <div className="space-y-2">
                    <Label htmlFor="dynasty">{t('dynasty')}</Label>
                    <Input
                      id="dynasty"
                      value={formData.dynasty}
                      onChange={(e) => onInputChange('dynasty', e.target.value)}
                      placeholder={t('enterDynasty')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin sự nghiệp - Có thể collapse */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-6 h-auto hover:bg-gray-50"
              onClick={() => setIsCareerInfoOpen(!isCareerInfoOpen)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('careerInformation')}</h3>
              {isCareerInfoOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            {isCareerInfoOpen && (
              <div className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Chuyên môn */}
                  <div className="space-y-2">
                    <Label htmlFor="specialty">{t('specialty')}</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => onInputChange('specialty', e.target.value)}
                      placeholder={t('enterSpecialty')}
                    />
                  </div>

                  {/* Thầy dạy */}
                  <div className="space-y-2">
                    <Label htmlFor="teacher">{t('teacher')}</Label>
                    <Input
                      id="teacher"
                      value={formData.teacher}
                      onChange={(e) => onInputChange('teacher', e.target.value)}
                      placeholder={t('enterTeacher')}
                    />
                  </div>

                  {/* Học trò */}
                  <div className="space-y-2">
                    <Label htmlFor="students">{t('students')}</Label>
                    <Input
                      id="students"
                      value={formData.students}
                      onChange={(e) => onInputChange('students', e.target.value)}
                      placeholder={t('enterStudents')}
                    />
                  </div>
                </div>

                {/* Sự nghiệp */}
                <div className="space-y-2">
                  <Label htmlFor="career">{t('career')}</Label>
                  <Textarea
                    id="career"
                    value={formData.career}
                    onChange={(e) => onInputChange('career', e.target.value)}
                    placeholder={t('enterCareer')}
                    rows={4}
                  />
                </div>

                {/* Thành tựu */}
                <div className="space-y-2">
                  <Label htmlFor="achievements">{t('achievements')}</Label>
                  <Textarea
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) => onInputChange('achievements', e.target.value)}
                    placeholder={t('enterAchievements')}
                    rows={4}
                  />
                </div>

                {/* Đóng góp */}
                <div className="space-y-2">
                  <Label htmlFor="contributions">{t('contributions')}</Label>
                  <Textarea
                    id="contributions"
                    value={formData.contributions}
                    onChange={(e) => onInputChange('contributions', e.target.value)}
                    placeholder={t('enterContributions')}
                    rows={4}
                  />
                </div>

                {/* Tác phẩm */}
                <div className="space-y-2">
                  <Label htmlFor="works">{t('works')}</Label>
                  <Textarea
                    id="works"
                    value={formData.works}
                    onChange={(e) => onInputChange('works', e.target.value)}
                    placeholder={t('enterWorks')}
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Thông tin bổ sung - Có thể collapse */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-between p-6 h-auto hover:bg-gray-50"
              onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{t('additionalInformation')}</h3>
              {isAdditionalInfoOpen ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
            {isAdditionalInfoOpen && (
              <div className="px-6 pb-6 space-y-4">
                {/* Triết lý */}
                <div className="space-y-2">
                  <Label htmlFor="philosophy">{t('philosophy')}</Label>
                  <Textarea
                    id="philosophy"
                    value={formData.philosophy}
                    onChange={(e) => onInputChange('philosophy', e.target.value)}
                    placeholder={t('enterPhilosophy')}
                    rows={4}
                  />
                </div>

                {/* Di sản */}
                <div className="space-y-2">
                  <Label htmlFor="legacy">{t('legacy')}</Label>
                  <Textarea
                    id="legacy"
                    value={formData.legacy}
                    onChange={(e) => onInputChange('legacy', e.target.value)}
                    placeholder={t('enterLegacy')}
                    rows={4}
                  />
                </div>

                {/* Trích dẫn */}
                <div className="space-y-2">
                  <Label htmlFor="quotes">{t('quotes')}</Label>
                  <Textarea
                    id="quotes"
                    value={formData.quotes}
                    onChange={(e) => onInputChange('quotes', e.target.value)}
                    placeholder={t('enterQuotes')}
                    rows={4}
                  />
                </div>

                {/* Giai thoại */}
                <div className="space-y-2">
                  <Label htmlFor="anecdotes">{t('anecdotes')}</Label>
                  <Textarea
                    id="anecdotes"
                    value={formData.anecdotes}
                    onChange={(e) => onInputChange('anecdotes', e.target.value)}
                    placeholder={t('enterAnecdotes')}
                    rows={4}
                  />
                </div>

                {/* Danh hiệu */}
                <div className="space-y-2">
                  <Label htmlFor="honors">{t('honors')}</Label>
                  <Textarea
                    id="honors"
                    value={formData.honors}
                    onChange={(e) => onInputChange('honors', e.target.value)}
                    placeholder={t('enterHonors')}
                    rows={4}
                  />
                </div>

                {/* Tưởng niệm */}
                <div className="space-y-2">
                  <Label htmlFor="memorials">{t('memorials')}</Label>
                  <Textarea
                    id="memorials"
                    value={formData.memorials}
                    onChange={(e) => onInputChange('memorials', e.target.value)}
                    placeholder={t('enterMemorials')}
                    rows={4}
                  />
                </div>

                {/* Chọn nguồn dữ liệu */}
                <div className="space-y-2">
                  <Label htmlFor="dataSourceId">{t('dataSource')}</Label>
                  <Select
                    value={formData.dataSourceId?.toString() || ''}
                    onValueChange={(value) => onInputChange('dataSourceId', value ? parseInt(value) : null)}
                    disabled={loadingDataSources}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingDataSources ? t('loading') : t('selectDataSource')} />
                    </SelectTrigger>
                    <SelectContent className="w-full bg-white">
                      {dataSources.length > 0 ?
                      (dataSources.map((dataSource) => (
                        <SelectItem key={dataSource.id} value={dataSource.id.toString()} className='hover:bg-gray-50'>
                          <div className="flex flex-col">
                            <span className="font-medium">{dataSource.name}</span>
                            {dataSource.title && (
                              <span className="text-sm text-gray-500">{dataSource.title}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))) :
                      (
                        <div className="flex flex-col items-start gap-2 justify-between p-4">
                          <div>{t('noDataSource')}</div>
                        </div>
                      )
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('back')}
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? (isEdit ? t('updating') : t('creating')) : (isEdit ? t('updateAuthor') : t('createAuthor'))}
        </Button>
      </div>
    </form>
  )
}

export default AuthorForm 