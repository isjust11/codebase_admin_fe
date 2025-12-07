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
import { Loader2, Plus, Save, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';
import { useAuth } from '@/contexts/AuthContext';
import { createDisease, getDiseaseById, updateDisease } from '@/services/disease-api';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { Action } from '@/types/actions';

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
    slug: z.string().optional(),
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
    thumbnailFile: z.instanceof(File).optional(),
    imagePaths: z.array(z.string()).optional(),
  });

const DiseaseForm = () => {
  const t = useTranslations('DiseasesPage');
  const tUtils = useTranslations('Utils');
  const { user } = useAuth();
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const formSchema = diseaseFormSchema(t);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [authorsOptions, setAuthorsOptions] = useState<SelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [dataSourcesOptions, setDataSourcesOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [disease, setDisease] = useState<any>();
  const [formData, setFormData] = useState<z.infer<typeof formSchema>>({
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
    thumbnailFile: undefined,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof formSchema>, string>>>({});

  const id = params.id?.toString();
  const title = id ? t('updateDisease') : t('createDisease');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadDisease(id);
    }
    fetchOptions();
  }, []);

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

  const loadDisease = async (id: string) => {
    try {
      const disease = await getDiseaseById(id);
      setDisease(disease);
      setFormData({
        name: disease.name || '',
        slug: disease.slug || '',
        summary: disease.summary || '',
        description: disease.description || '',
        symptoms: disease.symptoms || '',
        causes: disease.causes || '',
        prevention: disease.prevention || '',
        treatment: disease.treatment || '',
        authorId: disease.authorId?.toString() || '',
        categoryId: disease.categoryId?.toString() || '',
        dataSourceId: disease.dataSourceId?.toString() || '',
        videoUrl: disease.videoUrl || '',
        isActive: disease.isActive ?? true,
        imagePaths: disease.imagePaths || [],
        thumbnailFile: undefined,
      });
    } catch (_error) {
      toast.error(t('messages.loadError'));
      navigateTo('/manager/diseases');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors(prev => {
      const key = name as keyof z.infer<typeof formSchema>;
      return { ...prev, [key]: undefined };
    });
  };

  const handleSubmit = async () => {
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
      } as Partial<Record<keyof z.infer<typeof formSchema>, string>>);
      toast.error(t('validation.validationError'));
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      let uploadedImagePaths: string[] = [];
      
      // Upload images if there are new files selected
      if (selectedFiles !=null && selectedFiles.length) {
        try {
          const uploads = await Promise.all(
            selectedFiles.map(async (file) => {
              const uploadResponse = await uploadFile(file);
              return uploadResponse.publicRelativePath;
            })
          );
          uploadedImagePaths = uploads;
        } catch (error) {
          console.error('Error uploading images:', error);
          toast.error(t('validation.imageUploadError') || 'Lỗi khi tải ảnh lên');
          setLoading(false);
          return;
        }
      }

      // Merge uploaded images with existing images
      const existingImages = formData.imagePaths || [];
      const allImagePaths = [...existingImages, ...uploadedImagePaths];

      const submitData = {
        ...formData,
        imagePaths: allImagePaths,
        createdBy: user?.id || '',
        updatedBy: user?.id || '',
      };

      if (isEditing && id) {
        await updateDisease(id, submitData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createDisease(submitData);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo('/manager/diseases');
    } catch (_error) {
      toast.error(isEditing ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        back();
      },
      title: tUtils('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? tUtils('update') : tUtils('create'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb 
        pageTitle={t('title')} 
        items={[
          { title: t('title'), href: '/manager/diseases' },
          { title: title, href: '#' }
        ]} 
      />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="space-y-6">
            <div className="space-y-2">
              <ImageUpload
                multiple
                value={formData.imagePaths}
                onChange={(files) => {
                  setSelectedFiles(files as File[]);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} <span className="text-red-500">(*)</span></Label>
              <Input 
                id="name" 
                name="name" 
                className="input-focus" 
                value={formData.name || ''}
                onChange={handleChange} 
                placeholder={t('enterName')} 
              />
              {formErrors.name && (
                <div className="text-red-500 text-sm">{formErrors.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">{t('summary')}</Label>
              <Textarea 
                id="summary" 
                name="summary" 
                className="input-focus" 
                rows={5} 
                placeholder={t('enterSummary')}
                value={formData.summary || ''}
                onChange={handleChange}
              />
              {formErrors.summary && (
                <div className="text-red-500 text-sm">{formErrors.summary}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <SimpleEditor
                key={disease?.id ? `description-${disease.id}` : 'new-description'}
                initialContent={formData.description || ''}
                placeholder={t('enterDescription')}
                onContentChange={(content) => {
                  setFormData(prev => ({ ...prev, description: content as string }));
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                />
                {formErrors.causes && (
                  <div className="text-red-500 text-sm">{formErrors.causes}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prevention">{t('prevention')}</Label>
              <SimpleEditor
                key={disease?.id ? `prevention-${disease.id}` : 'new-prevention'}
                initialContent={formData.prevention || ''}
                placeholder={t('enterPrevention')}
                onContentChange={(content) => {
                  setFormData(prev => ({ ...prev, prevention: content as string }));
                }}
              />
              {formErrors.prevention && (
                <div className="text-red-500 text-sm">{formErrors.prevention}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">{t('treatment')}</Label>
              <SimpleEditor
                key={disease?.id ? `treatment-${disease.id}` : 'new-treatment'}
                initialContent={formData.treatment || ''}
                placeholder={t('enterTreatment')}
                onContentChange={(content) => {
                  setFormData(prev => ({ ...prev, treatment: content as string }));
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
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, authorId: Array.isArray(value) ? value[0] : value as string }));
                  }}
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
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, categoryId: Array.isArray(value) ? value[0] : value as string }));
                  }}
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
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, dataSourceId: Array.isArray(value) ? value[0] : value as string || '' }));
                  }}
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
              <Input 
                className="input-focus" 
                id="videoUrl"
                name="videoUrl"
                placeholder={t('enterVideoUrl')}
                value={formData.videoUrl || ''}
                onChange={handleChange}
              />
              {formErrors.videoUrl && (
                <div className="text-red-500 text-sm">{formErrors.videoUrl}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">{t('isActive')}</Label>
              <Switch
                defaultChecked={formData.isActive || true}
                onChange={(checked: boolean) => {
                  setFormData(prev => ({ ...prev, isActive: checked }));
                }}
                label={formData.isActive || true ? tUtils('active') : tUtils('inactive')}
              />
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
};

export default DiseaseForm;

