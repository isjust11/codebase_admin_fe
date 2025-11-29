'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Switch from '@/components/form/switch/Switch';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadFile } from '@/services/media-api';
import Select, { SelectOption } from '@/components/form/Select';
import { getAllAuthors } from '@/services/author-api';
import { getAllDataSources } from '@/services/manager-api';
import { getCategoryByCode } from '@/services/manager-api';
import { Author } from '@/types/author';
import { Category } from '@/types/category';
import { DataSource } from '@/types/data-source';
import { AppCategoryCode } from '@/constants';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const diseaseFormSchema = (t: ReturnType<typeof useTranslations>) =>
  z.object({
    name: z
      .string({
        required_error: t('validation.nameRequired'),
      })
      .min(1, {
        message: t('validation.nameRequired'),
      })
      .max(255, {
        message: t('validation.nameMaxLength'),
      }),
    slug: z
      .string()
      .optional(),
    summary: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    symptoms: z.string().optional().or(z.literal('')),
    causes: z.string().optional().or(z.literal('')),
    prevention: z.string().optional().or(z.literal('')),
    treatment: z.string().optional().or(z.literal('')),
    authorId: z.string().optional().or(z.literal('')),
    categoryId: z.string().optional().or(z.literal('')),
    dataSourceId: z.string().optional().or(z.literal('')),
    videoUrl: z.string().optional().or(z.literal('')),
    isActive: z.boolean().default(true),
    imagePaths: z.array(z.string()).optional().or(z.literal('')),
  });

export interface DiseaseFormData {
  name: string;
  slug?: string;
  summary?: string;
  description?: string;
  symptoms?: string;
  causes?: string;
  prevention?: string;
  treatment?: string;
  authorId?: string;
  categoryId?: string;
  dataSourceId?: string;
  videoUrl?: string;
  isActive: boolean;
  imagePaths?: string[];
}

interface DiseaseFormProps {
  formData: DiseaseFormData;
  onInputChange: (field: string, value: string | boolean | string[] | File | File[] | number | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isEdit?: boolean;
}

export const DiseaseForm: React.FC<DiseaseFormProps> = ({
  formData = {
    name: '',
    slug: '',
    summary: '',
    description: '',
    symptoms: '',
    causes: '',
    prevention: '',
    treatment: '',
    authorId: '',
    categoryId: '',
    dataSourceId: '',
    videoUrl: '',
    isActive: true,
    imagePaths: [],
  },
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
}) => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const formSchema = diseaseFormSchema(t);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [authorsOptions, setAuthorsOptions] = useState<SelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [dataSourcesOptions, setDataSourcesOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [authorsData, dataSourcesData] = await Promise.all([
          getAllAuthors(),
          getAllDataSources(),
        ]);

        const authorsOpts = (authorsData || []).map((author: Author) => ({
          avatar: author.avatar,
          value: author.id.toString(),
          label: author.name,
        }));
        setAuthorsOptions(authorsOpts);

        const dataSourcesOpts = (dataSourcesData || []).map((ds: DataSource) => ({
          value: ds.id.toString(),
          label: ds.name,
        }));
        setDataSourcesOptions(dataSourcesOpts);

        // Try to get categories for disease, if category code exists
        try {
          const categoriesData = await getCategoryByCode(AppCategoryCode.Disease.code);
          const categoriesOpts = (categoriesData || []).map((cat: Category) => ({
            value: cat.id.toString(),
            label: cat.name,
          }));
          setCategoriesOptions(categoriesOpts);
        } catch (error) {
          // Category code might not exist, that's okay
          console.log('Disease category not found, skipping');
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let uploadedImagePaths: string[] = [];
    const result = await formSchema.safeParseAsync(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        name: fieldErrors.name?.[0],
        summary: fieldErrors.summary?.[0],
        description: fieldErrors.description?.[0],
        symptoms: fieldErrors.symptoms?.[0],
        causes: fieldErrors.causes?.[0],
        prevention: fieldErrors.prevention?.[0],
        treatment: fieldErrors.treatment?.[0],
        authorId: fieldErrors.authorId?.[0],
        categoryId: fieldErrors.categoryId?.[0],
        dataSourceId: fieldErrors.dataSourceId?.[0],
        videoUrl: fieldErrors.videoUrl?.[0],
        isActive: fieldErrors.isActive?.[0],
      } as Partial<Record<keyof DiseaseFormData, string>>);
      toast.error(t('validation.validationError'));
      return;
    }
    if (selectedFiles.length) {
      try {
        const uploads = await Promise.all(
          selectedFiles.map(async (file) => {
            const uploadResponse = await uploadFile(file);
            let path = uploadResponse.publicRelativePath;
            return path;
          })
        );
        uploadedImagePaths = uploads;
      } catch (error) {
        console.error('Error uploading images:', error);
      }
    }

    onSubmit(e);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ImageUpload
          multiple
          value={formData.imagePaths}
          onChange={() => { }}
        // onChange={(files) => onInputChange('imagePaths', files)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{t('name')} <span className="text-red-500">(*)</span></Label>
        <Input id="name" name="name" className="input-focus" value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)} placeholder={t('enterName')} />
        {formErrors.name && (
          <div className="text-red-500 text-sm">{formErrors.name}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">{t('summary')}</Label>
        <Textarea id="summary" name="summary" className="input-focus" rows={5} placeholder={t('enterSummary')} />
        {formErrors.summary && (
          <div className="text-red-500 text-sm">{formErrors.summary}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <SimpleEditor
          key={formData.description || 'new'}
          initialContent={formData.description || ''}
          placeholder={t('enterDescription')}
          onContentChange={(content) => {
            onInputChange('description', content);
          }}
        />
        {formErrors.description && (
          <div className="text-red-500 text-sm">{formErrors.description}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">

          <Label htmlFor="symptoms">{t('symptoms')}</Label>
          <Textarea
            name="symptoms"
            rows={5}
            placeholder={t('enterSymptoms')}
            value={formData.symptoms || ''}
            onChange={(e) => onInputChange('symptoms', e.target.value)}
          />
          {formErrors.symptoms && (
            <div className="text-red-500 text-sm">{formErrors.symptoms}</div>
          )}
        </div>
        <div className="space-y-2">

          <Label htmlFor="causes">{t('causes')}</Label>
          <Textarea
            name="causes"
            rows={5}
            placeholder={t('enterCauses')}
            value={formData.causes || ''}
            onChange={(e) => onInputChange('causes', e.target.value)}
          />
          {formErrors.causes && (
            <div className="text-red-500 text-sm">{formErrors.causes}</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prevention">{t('prevention')}</Label>
        <SimpleEditor
          key={formData.prevention || 'new-prevention'}
          initialContent={formData.prevention || ''}
          placeholder={t('enterPrevention')}
          onContentChange={(content) => {
            onInputChange('prevention', content);
          }}
        />
        {formErrors.prevention && (
          <div className="text-red-500 text-sm">{formErrors.prevention}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">{t('treatment')}</Label>
        <SimpleEditor
          key={formData.treatment || 'new-treatment'}
          initialContent={formData.treatment || ''}
          placeholder={t('enterTreatment')}
          onContentChange={(content) => {
            onInputChange('treatment', content);
          }}
        />
        {formErrors.treatment && (
          <div className="text-red-500 text-sm">{formErrors.treatment}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="authorId">{t('author')}</Label>
          <Select
            options={authorsOptions}
            placeholder={t('selectAuthor') || 'Chọn tác giả'}
            value={formData.authorId || ''}
            onChange={(value) => onInputChange('authorId', Array.isArray(value) ? value[0] : value)}
            searchable
            disabled={loadingOptions}
          />
          {formErrors.authorId && (
            <div className="text-red-500 text-sm">{formErrors.authorId}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">{t('category')}</Label>
          <Select
            options={categoriesOptions}
            placeholder={t('selectCategory') || 'Chọn danh mục'}
            value={formData.categoryId || ''}
            onChange={(value) => onInputChange('categoryId', Array.isArray(value) ? value[0] : value)}
            searchable
            disabled={loadingOptions}
          />
          {formErrors.categoryId && (
            <div className="text-red-500 text-sm">{formErrors.categoryId}</div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataSourceId">{t('dataSource')}</Label>
          <Select
            options={dataSourcesOptions}
            placeholder={t('selectDataSource') || 'Chọn nguồn dữ liệu'}
            value={formData.dataSourceId || ''}
            onChange={(value) => onInputChange('dataSourceId', Array.isArray(value) ? value[0] : value || '')}
            searchable
            disabled={loadingOptions}
          />
          {formErrors.dataSourceId && (
            <div className="text-red-500 text-sm">{formErrors.dataSourceId}</div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">{t('videoUrl')}</Label>
        <Input className="input-focus" id="videoUrl" placeholder={t('enterVideoUrl')} />
        {formErrors.videoUrl && (
          <div className="text-red-500 text-sm">{formErrors.videoUrl}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">{t('isActive')}</Label>
        <Switch
          defaultChecked={formData.isActive || true}
          onChange={(checked: boolean) => onInputChange('isActive', checked)}
          label={formData.isActive || true ? tUtils('active') : tUtils('inactive')}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tUtils('cancel')}
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? tUtils('update') : tUtils('save')}
        </Button>
      </div>
    </div>
  );
};

