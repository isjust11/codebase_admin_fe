'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
      .max(255, { message: t('validation.slugMaxLength') })
      .optional()
      .or(z.literal('')),
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
  const url =
    disease && (disease as Disease & { thumbnailUrl?: string }).thumbnailUrl;
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

    if (selectedFiles.length) {
      try {
        const uploads = await Promise.all(
          selectedFiles.map(async (file) => {
            const uploadResponse = await uploadFile(file);
            let path = uploadResponse.publicRelativePath;
            if (path.startsWith('http')) {
              path = path.replace(
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
                ''
              );
            }
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
      slug: values.slug?.trim() || undefined,
      summary: (values as any).summary?.trim() ? (values as any).summary.trim() : undefined,
      description: values.description?.trim() ? values.description.trim() : undefined,
      symptoms: values.symptoms?.trim() ? values.symptoms.trim() : undefined,
      causes: values.causes?.trim() ? values.causes.trim() : undefined,
      prevention: values.prevention?.trim() ? values.prevention.trim() : undefined,
      treatment: (values as any).treatment?.trim() ? (values as any).treatment.trim() : undefined,
      authorId: (values as any).authorId ? parseInt((values as any).authorId) : undefined,
      categoryId: (values as any).categoryId ? parseInt((values as any).categoryId) : undefined,
      dataSourceId: (values as any).dataSourceId ? parseInt((values as any).dataSourceId) : undefined,
      videoUrl: (values as any).videoUrl?.trim() ? (values as any).videoUrl.trim() : undefined,
      isActive: values.isActive,
    };

    // TODO: Handle uploadedImagePaths with MultiImage API if needed.

    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormItem>
          <FormLabel>{t('thumbnail') || 'Hình ảnh'}</FormLabel>
          <FormControl>
            <ImageUpload
              multiple
              value={initialImages}
              onChange={handleFileChange}
              placeholder={t('uploadImage') || 'Kéo & thả file vào đây'}
            />
          </FormControl>
        </FormItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('name')} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder={t('enterName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('slug')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterSlug')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('summary') || 'Tóm tắt'}</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder={t('enterSummary') || 'Nhập tóm tắt'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={t('enterDescription')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('symptoms')}</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder={t('enterSymptoms')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="causes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('causes')}</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder={t('enterCauses')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="prevention"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('prevention')}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={t('enterPrevention')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('treatment') || 'Phương pháp điều trị'}</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder={t('enterTreatment') || 'Nhập phương pháp điều trị'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="authorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('author') || 'Tác giả'}</FormLabel>
                <FormControl>
                  <Select
                    options={authorsOptions}
                    placeholder={t('selectAuthor') || 'Chọn tác giả'}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    searchable
                    disabled={loadingOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('category') || 'Danh mục'}</FormLabel>
                <FormControl>
                  <Select
                    options={categoriesOptions}
                    placeholder={t('selectCategory') || 'Chọn danh mục'}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value)}
                    searchable
                    disabled={loadingOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataSourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('dataSource') || 'Nguồn dữ liệu'}</FormLabel>
                <FormControl>
                  <Select
                    options={dataSourcesOptions}
                    placeholder={t('selectDataSource') || 'Chọn nguồn dữ liệu'}
                    value={field.value || ''}
                    onChange={(value) => field.onChange(Array.isArray(value) ? value[0] : value || '')}
                    searchable
                    disabled={loadingOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('videoUrl') || 'URL Video'}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterVideoUrl') || 'Nhập URL video'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <Switch
                label={field.value ? tUtils('active') : tUtils('inactive')}
                defaultChecked={field.value}
                onChange={(checked) => field.onChange(checked)}
              />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {tUtils('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? tUtils('loading') : submitLabel ?? tUtils('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

