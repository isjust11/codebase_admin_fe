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
    description: z.string().optional().or(z.literal('')),
    symptoms: z.string().optional().or(z.literal('')),
    causes: z.string().optional().or(z.literal('')),
    prevention: z.string().optional().or(z.literal('')),
    isActive: z.boolean().default(true),
  });

export interface DiseaseFormValues extends DiseaseDto {
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

  const form = useForm<DiseaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name ?? '',
          slug: initialData.slug ?? '',
          description: initialData.description ?? '',
          symptoms: initialData.symptoms ?? '',
          causes: initialData.causes ?? '',
          prevention: initialData.prevention ?? '',
          isActive: initialData.isActive ?? true,
        }
      : {
          name: '',
          slug: '',
          description: '',
          symptoms: '',
          causes: '',
          prevention: '',
          isActive: true,
        },
  });

  useEffect(() => {
    if (initialData) {
      // Load thumbnail from MultiImage API if needed
      // For now, we'll just reset the form without thumbnail
      form.reset({
        name: initialData.name ?? '',
        slug: initialData.slug ?? '',
        description: initialData.description ?? '',
        symptoms: initialData.symptoms ?? '',
        causes: initialData.causes ?? '',
        prevention: initialData.prevention ?? '',
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
      description: values.description?.trim() ? values.description.trim() : undefined,
      symptoms: values.symptoms?.trim() ? values.symptoms.trim() : undefined,
      causes: values.causes?.trim() ? values.causes.trim() : undefined,
      prevention: values.prevention?.trim() ? values.prevention.trim() : undefined,
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

