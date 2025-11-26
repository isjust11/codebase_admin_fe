import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getAllDataSources, getCategoryByCode } from '@/services/manager-api';
import { DataSource } from '@/types/data-source';
import { Category } from '@/types/category';
import { Herbal } from '@/types/herbal';
import { uploadFile } from '@/services/media-api';
import { useTranslations } from 'next-intl';
import Switch from "@/components/form/switch/Switch";
import { AppCategoryCode } from '@/constants';
import { z } from 'zod';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/ImageUpload';
import Select, { SelectOption } from '@/components/form/Select';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

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
  categoryId: z.string().refine(val => val.trim() !== '', t('validation.categoryRequired')).optional(),
  dataSourceId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  id: z.string().optional(),
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
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [partsUsedOptions, setPartsUsedOptions] = useState<SelectOption[]>([]);
  const [dataSourcesOptions, setDataSourcesOptions] = useState<SelectOption[]>([]);
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
    partsUsedId: '',
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

  useEffect(() => {
    fetchCategories();
    loadDataSources();
    fetchPartsUsed();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategoryByCode(AppCategoryCode.Herbal.code);
      setCategoriesOptions(data.map((category: Category) => ({
        value: category.id.toString(),
        label: category.name,
      })));
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const fetchPartsUsed = async () => {
    try {
      const data = await getCategoryByCode(AppCategoryCode.PartsUsed.code);
      setPartsUsedOptions(data.map((category: Category) => ({
        value: category.id.toString(),
        label: category.name,
      })));
    } catch (error) {
      console.error('Error fetching parts used:', error);
    }
  };

  const loadDataSources = async () => {
    setLoadingDataSources(true);
    try {
      const response = await getAllDataSources();
      setDataSourcesOptions(response.map((dataSource: DataSource) => ({
        value: dataSource.id.toString(),
        label: dataSource.name,
      })));
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleFileChange = (value: File | null) => {
    if (value instanceof File) {
      setSelectedFile(value);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    const result = await herbalForm.safeParseAsync(formData);
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
        thumbnail = uploadResponse.publicRelativePath;
      }

      const submitData = {
        ...formData,
        thumbnail: thumbnail,
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
            <ImageUpload
              multiple={false}
              value={formData.thumbnail}
              onChange={(value: File | null) => handleFileChange(value)}
            />
            {formErrors.thumbnail && (
              <div className="text-red-500 text-sm">{formErrors.thumbnail}</div>
            )}
          </div>
        </div>
      </div>

      {/* Phần thông tin - chiếm 7/10 */}
      <div className="w-7/10">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')} <span className="text-red-500">(*)</span></Label>
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
              <Label htmlFor="scientificName">{t('scientificName')}</Label>
              <Input
                id="scientificName"
                value={formData.scientificName}
                onChange={(e) => handleInputChange('scientificName', e.target.value)}
                placeholder={t('scientificName')}
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
              <Label htmlFor="categoryId">{t('category')} <span className="text-red-500">(*)</span></Label>
              <Select
                options={categoriesOptions}
                placeholder={tUtils('selectCategory')}
                value={formData.categoryId || ''}
                onChange={(value) => handleInputChange('categoryId', value as string)}
              />
              {formErrors.categoryId && (
                <div className="text-red-500 text-sm">{formErrors.categoryId}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="partsUsedId">{t('partsUsed')}</Label>
              <Select
                multiple={true}
                options={partsUsedOptions}
                placeholder={t('selectPartsUsed')}
                value={formData.partsUsedId || ''}
                onChange={(value) => handleInputChange('partsUsedId', value as string)}
              />
              {formErrors.partsUsedId && (
                <div className="text-red-500 text-sm">{formErrors.partsUsedId}</div>
              )}
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
            <Label htmlFor="content">{t('content')} <span className="text-red-500">(*)</span></Label>
            <SimpleEditor
              key={formData.id || 'new'}
              initialContent={formData.content}
              onContentChange={(content) => handleChangeContent('content', content)}
              placeholder={t('content')}
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
              options={dataSourcesOptions}
              placeholder={t('selectDataSource')}
              value={formData.dataSourceId?.toString() || ''}
              onChange={(value) => handleInputChange('dataSourceId', value as string)}
            />  
            {formErrors.dataSourceId && (
              <div className="text-red-500 text-sm">{formErrors.dataSourceId}</div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default HerbalForm; 