'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Switch from '@/components/form/switch/Switch';
import { Disease } from '@/types/disease';
import { DiseaseDto } from '@/types/dto/DiseaseDto';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  });

export interface DiseaseFormValues {
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
}

interface DiseaseFormProps {
  initialData?: Disease | null;
  onSubmit: (values: DiseaseDto) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const getInitialImageUrls = (disease?: Disease | null) => {
  if (!disease) return [];

  if (disease.imagePaths && disease.imagePaths.length > 0) {
    return disease.imagePaths;
  }

  const url =
    (disease as Disease & { thumbnailUrl?: string }).thumbnailUrl ||
    disease.thumbnail;

  return url ? [url] : [];
};

export const DiseaseForm: React.FC<DiseaseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel,
}) => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const formSchema = diseaseFormSchema(t);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [initialImages, setInitialImages] = useState<string[]>(getInitialImageUrls(initialData));
  const [authorsOptions, setAuthorsOptions] = useState<SelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [dataSourcesOptions, setDataSourcesOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const form = useForm<DiseaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        summary: (initialData as any).summary ?? '',
        description: initialData.description ?? '',
        symptoms: initialData.symptoms ?? '',
        causes: initialData.causes ?? '',
        prevention: initialData.prevention ?? '',
        treatment: (initialData as any).treatment ?? '',
        authorId: (initialData as any).authorId?.toString() ?? '',
        categoryId: (initialData as any).categoryId?.toString() ?? '',
        dataSourceId: (initialData as any).dataSourceId?.toString() ?? '',
        videoUrl: (initialData as any).videoUrl ?? '',
        isActive: initialData.isActive ?? true,
      }
      : {
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
      },
  });

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

  useEffect(() => {
    if (initialData) {
      // Load thumbnail from MultiImage API if needed
      // For now, we'll just reset the form without thumbnail
      form.reset({
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        summary: (initialData as any).summary ?? '',
        description: initialData.description ?? '',
        symptoms: initialData.symptoms ?? '',
        causes: initialData.causes ?? '',
        prevention: initialData.prevention ?? '',
        treatment: (initialData as any).treatment ?? '',
        authorId: (initialData as any).authorId?.toString() ?? '',
        categoryId: (initialData as any).categoryId?.toString() ?? '',
        dataSourceId: (initialData as any).dataSourceId?.toString() ?? '',
        videoUrl: (initialData as any).videoUrl ?? '',
        isActive: initialData.isActive ?? true,
      });
      setInitialImages(getInitialImageUrls(initialData));
      setSelectedFiles([]);
    }
  }, [form, initialData]);

  const handleFileChange = (files: File[] | null) => {
    const nextFiles = files ?? [];
    setSelectedFiles(nextFiles);
    if (nextFiles.length) {
      setInitialImages([]);
    }
  };

  const handleSubmit = async (values: DiseaseFormValues) => {
    let uploadedImagePaths: string[] = [];
    const result = await formSchema.safeParseAsync(values);
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
      } as Partial<Record<keyof DiseaseFormValues, string>>);
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

    const payload: DiseaseDto = {
      name: values.name.trim(),
      slug: values.slug?.trim() || '',
      summary: (values as any).summary?.trim() ? (values as any).summary.trim() : undefined,
      description: values.description?.trim() ? values.description.trim() : '',
      symptoms: values.symptoms?.trim() ? values.symptoms.trim() : '',
      causes: values.causes?.trim() ? values.causes.trim() : '',
      prevention: values.prevention?.trim() ? values.prevention.trim() : undefined,
      treatment: (values as any).treatment?.trim() ? (values as any).treatment.trim() : undefined,
      authorId: (values as any).authorId ? (values as any).authorId : '',
      categoryId: (values as any).categoryId ? (values as any).categoryId : '',
      dataSourceId: (values as any).dataSourceId ? (values as any).dataSourceId : '',
      videoUrl: (values as any).videoUrl?.trim() ? (values as any).videoUrl.trim() : '',
      isActive: values.isActive,
      imagePaths: uploadedImagePaths,
    };

    // TODO: Handle uploadedImagePaths with MultiImage API if needed.

    onSubmit(payload);
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="space-y-2">
          <ImageUpload
            multiple
            value={initialImages}
            onChange={handleFileChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')} <span className="text-red-500">(*)</span></Label>
          <Input id="name" name="name" className="input-focus" value={form.getValues('name') || ''} 
          onChange={(e) => form.setValue('name', e.target.value)} placeholder={t('enterName')} />
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
            key={initialData?.description || 'new'}
            initialContent={form.getValues('description') || ''}
            placeholder={t('enterDescription')}
            onContentChange={(content) => {
              form.setValue('description', content);
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
              value={form.getValues('symptoms') || ''}
              onChange={(e) => form.setValue('symptoms', e.target.value)}
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
              value={form.getValues('causes') || ''}
              onChange={(e) => form.setValue('causes', e.target.value)}
            />
            {formErrors.causes && (
              <div className="text-red-500 text-sm">{formErrors.causes}</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prevention">{t('prevention')}</Label>
          <SimpleEditor
            key={initialData?.prevention || 'new-prevention'}
            initialContent={initialData?.prevention || ''}
            placeholder={t('enterPrevention')}
            onContentChange={(content) => {
              form.setValue('prevention', content);
            }}
          />
          {formErrors.prevention && (
            <div className="text-red-500 text-sm">{formErrors.prevention}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="treatment">{t('treatment')}</Label>
          <SimpleEditor
            key={initialData?.treatment || 'new-treatment'}
            initialContent={initialData?.treatment || ''}
            placeholder={t('enterTreatment')}
            onContentChange={(content) => {
              form.setValue('treatment', content);
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
              value={form.getValues('authorId') || ''}
              onChange={(value) => form.setValue('authorId', Array.isArray(value) ? value[0] : value)}
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
              value={form.getValues('categoryId') || ''}
              onChange={(value) => form.setValue('categoryId', Array.isArray(value) ? value[0] : value)}
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
              value={form.getValues('dataSourceId') || ''}
              onChange={(value) => form.setValue('dataSourceId', Array.isArray(value) ? value[0] : value || '')}
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
            defaultChecked={form.getValues('isActive') || true}
            onChange={(checked: boolean) => form.setValue('isActive', checked)}
            label={form.getValues('isActive') || true ? tUtils('active') : tUtils('inactive')}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {tUtils('cancel')}
          </Button>
          <Button onClick={() => handleSubmit(form.getValues())} disabled={loading}>
            {loading ? tUtils('loading') : submitLabel ?? tUtils('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

