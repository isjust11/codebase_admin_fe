import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAllDataSources, getCategories, getCategoryByCode, getDataSources } from '@/services/manager-api';
import { DataSource } from '@/types/data-source';
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { Herbal } from '@/types/herbal';
import { uploadFile } from '@/services/media-api';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mergeImageUrl } from '@/lib/utils';
import Switch from "@/components/form/switch/Switch";
import { AppCategoryCode } from '@/constants';
import { z } from 'zod';
import { toast } from 'sonner';

interface HerbalFormProps {
  initialData?: Partial<Herbal>;
  isEditing?: boolean;
  onSubmit: (data: Herbal) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const herbalFormSchema = (t: any) => z.object({
  title: z.string().min(3, t('validation.titleMinLength'))
    .refine(val => val.trim() !== '', t('validation.titleRequired')),
  summary: z.string().optional(),
  content: z.string().min(10, t('validation.contentMinLength'))
    .refine(val => val.trim() !== '', t('validation.contentRequired')),
  scientificName: z.string().optional(),
  commonNames: z.string().optional(),
  family: z.string().optional(),
  partsUsed: z.string().optional(),
  activeCompounds: z.string().optional(),
  medicinalProperties: z.string().optional(),
  preparationMethods: z.string().optional(),
  dosage: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  thumbnail: z.string().optional(),
  categoryId: z.string().optional(),
  dataSourceId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
  id: z.string().optional(),
  slug: z.string().optional(),
  viewCount: z.number().optional(),
  likeCount: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const HerbalForm: React.FC<HerbalFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loadingDataSources, setLoadingDataSources] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Herbal, string>>>({});
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const herbalForm = herbalFormSchema(t)
  const [formData, setFormData] = useState<Herbal>({
    title: '',
    summary: '',
    content: '',
    scientificName: '',
    commonNames: '',
    family: '',
    partsUsed: '',
    activeCompounds: '',
    medicinalProperties: '',
    preparationMethods: '',
    dosage: '',
    contraindications: '',
    sideEffects: '',
    thumbnail: '',
    categoryId: '',
    dataSourceId: null,
    isActive: true,
    id: '',
    slug: '',
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialData
  });

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoryByCode(AppCategoryCode.Herbal.code);
        setCategories(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      }
    };
    fetchCategories();
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setLoadingDataSources(true);
    try {
      const response = await getAllDataSources();
      setDataSources(response);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    } finally {
      setLoadingDataSources(false);
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        dataSourceId: (initialData as any).dataSourceId || null,
      }));
      if (initialData.thumbnail) {
        setPreviewUrl(initialData.thumbnail);
      }
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangeTitle = (field: string, value: string) => {
    handleInputChange(field, value);
    if (value.length < 3) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.titleMinLength') }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChangeContent = (field: string, value: string) => {
    handleInputChange(field, value);
    if (value.length < 10) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.contentMinLength') }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const result = await herbalForm.safeParseAsync(formData);
    console.log(result);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        title: fieldErrors.title?.[0],
        summary: fieldErrors.summary?.[0],
        content: fieldErrors.content?.[0],
        scientificName: fieldErrors.scientificName?.[0],
        commonNames: fieldErrors.commonNames?.[0],
        family: fieldErrors.family?.[0],
        partsUsed: fieldErrors.partsUsed?.[0],
        activeCompounds: fieldErrors.activeCompounds?.[0],
        medicinalProperties: fieldErrors.medicinalProperties?.[0],
        preparationMethods: fieldErrors.preparationMethods?.[0],
        dosage: fieldErrors.dosage?.[0],
        contraindications: fieldErrors.contraindications?.[0],
        sideEffects: fieldErrors.sideEffects?.[0],
        thumbnail: fieldErrors.thumbnail?.[0],
        categoryId: fieldErrors.categoryId?.[0],
        dataSourceId: fieldErrors.dataSourceId?.[0],
        isActive: fieldErrors.isActive?.[0],
      } as Partial<Record<keyof Herbal, string>>);
      toast.error(t('validation.validationError'))
      return;
    }
    setFormErrors({});
    
    try {
      let thumbnail = formData.thumbnail || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : thumbnail,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
      throw error;
    }
  };

  // Expose submit function to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).herbalFormSubmit = handleSubmit;
    }
  }, [formData, selectedFile]);

  return (
    <div className="flex gap-6">
      {/* Phần upload hình ảnh - chiếm 3/10 */}
      <div className="w-3/10">
        <div className="space-y-2">
          <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
            {previewUrl || formData.thumbnail ? (
              <div className="relative">
                {(previewUrl || formData.thumbnail) && (
                  <img
                    src={mergeImageUrl(formData.thumbnail || '') || previewUrl || ''}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}

                <button
                  type="button"
                  title={tUtils('deleteImage')}
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setFormData(prev => ({ ...prev, thumbnail: '' }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${isDragActive
                    ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                  }
                  `}
              >
                <input {...getInputProps()} />

                <div className="dz-message flex flex-col items-center m-0!">
                  {/* Icon Container */}
                  <div className="mb-[22px] flex justify-center">
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      <svg
                        className="fill-current"
                        width="29"
                        height="28"
                        viewBox="0 0 29 28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Text Content */}
                  <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90 text-center">
                    {isDragActive ? tUtils('dropFileHere') : tUtils('dragAndDropFile')}
                  </h4>

                  <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                    {tUtils('dragAndDropFile')}
                  </span>

                  <span className="font-medium underline text-theme-sm text-brand-500">
                    {tUtils('selectImage')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phần thông tin - chiếm 7/10 */}
      <div className="w-7/10">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChangeTitle('title', e.target.value)}
                placeholder={t('title')}
              />
              {formErrors.title && (
                <div className="text-red-500 text-sm">{formErrors.title}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">{t('category')}</Label>
              <Select value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className='bg-white dark:bg-gray-900'>
                  {categories.map((category) => (
                    <SelectItem
                      className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                      key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scientificName">{t('scientificName')}</Label>
              <Input
                id="scientificName"
                value={formData.scientificName}
                onChange={(e) => handleInputChange('scientificName', e.target.value)}
                placeholder={t('scientificName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commonNames">{t('commonNames')}</Label>
              <Input
                id="commonNames"
                value={formData.commonNames}
                onChange={(e) => handleInputChange('commonNames', e.target.value)}
                placeholder={t('commonNames')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family">{t('family')}</Label>
              <Input
                id="family"
                value={formData.family}
                onChange={(e) => handleInputChange('family', e.target.value)}
                placeholder={t('family')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partsUsed">{t('partsUsed')}</Label>
              <Input
                id="partsUsed"
                value={formData.partsUsed}
                onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                placeholder={t('partsUsed')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activeCompounds">{t('activeCompounds')}</Label>
            <Input
              id="activeCompounds"
              value={formData.activeCompounds}
              onChange={(e) => handleInputChange('activeCompounds', e.target.value)}
              placeholder={t('activeCompounds')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicinalProperties">{t('medicinalProperties')}</Label>
            <Textarea
              id="medicinalProperties"
              value={formData.medicinalProperties}
              onChange={(e) => handleInputChange('medicinalProperties', e.target.value)}
              placeholder={t('medicinalProperties')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparationMethods">{t('preparationMethods')}</Label>
            <Textarea
              id="preparationMethods"
              value={formData.preparationMethods}
              onChange={(e) => handleInputChange('preparationMethods', e.target.value)}
              placeholder={t('preparationMethods')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">{t('dosage')}</Label>
            <Textarea
              id="dosage"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
              placeholder={t('dosage')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contraindications">{t('contraindications')}</Label>
              <Textarea
                id="contraindications"
                value={formData.contraindications}
                onChange={(e) => handleInputChange('contraindications', e.target.value)}
                placeholder={t('contraindications')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sideEffects">{t('sideEffects')}</Label>
              <Textarea
                id="sideEffects"
                value={formData.sideEffects}
                onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                placeholder={t('sideEffects')}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">{t('summary')}</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder={t('summary')}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('content')} *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChangeContent('content', e.target.value)}
              placeholder={t('content')}
              rows={10}
            />
            {formErrors.content && (
              <div className="text-red-500 text-sm">{formErrors.content}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">{t('isActive')}</Label>
            <div className="flex items-center space-x-2">
              <Switch
                label={formData.isActive ? t('active') : t('inactive')}
                key={formData.id.toString()}
                defaultChecked={formData.isActive}
                onChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataSourceId">{t('dataSource')}</Label>
            <Select
              value={formData.dataSourceId?.toString() || ''}
              onValueChange={(value) => handleInputChange('dataSourceId', value ? parseInt(value) : null)}
              disabled={loadingDataSources}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingDataSources ? t('loading') : t('selectDataSource')} />
              </SelectTrigger>
              <SelectContent className='bg-white dark:bg-gray-900'>
                {
                  dataSources.length > 0 ?
                    (
                      dataSources.map((dataSource) => (
                        <SelectItem
                          className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                          key={dataSource.id}
                          value={dataSource.id.toString()}
                        >
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
        </form>
      </div>
    </div>
  );
};

export default HerbalForm; 