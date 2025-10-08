import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createStaticPage, updateStaticPage, getStaticPage } from '@/services/static-page-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { StaticPageDto } from '@/types/dto/StaticPageDto';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppRoutes } from '@/constants';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { StaticPage } from '@/types/static-page';

const staticPageFormSchema = (t: any) => z.object({
  title: z.string().min(3, t('validation.titleMinLength'))
    .refine(val => val.trim() !== '', t('validation.titleRequired')),
  content: z.string().min(3, t('validation.contentMinLength'))
    .refine(val => val.trim() !== '', t('validation.contentRequired')), 
  thumbnailFile: z.instanceof(File).optional(),
  thumbnailUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
});

const StaticPageForm = () => {
  const t = useTranslations('StaticPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [staticPage, setStaticPage] = useState<StaticPage>();
  const staticPageForm = staticPageFormSchema(t);

  const [formData, setFormData] = useState<z.infer<typeof staticPageForm>>({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
    thumbnailFile: undefined,
    thumbnailUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof staticPageForm>, string>>>({});
  const id = params.id?.toString();

  const title = id ? t('updateStaticPage') : t('addStaticPage');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadStaticPage(id);
    }
  }, []);


  const loadStaticPage = async (id: string) => {
    try {
      const staticPage = await getStaticPage(id);
      setStaticPage(staticPage);
      setFormData({
        title: staticPage.title,
        content: staticPage.content,
        metaTitle: staticPage.metaTitle || '',
        metaDescription: staticPage.metaDescription || '',
        isActive: staticPage.isActive || true,
        thumbnailUrl: staticPage.thumbnail || '',
        thumbnailFile: undefined,
      });
    } catch (_error) {
      toast.error(t('messages.loadError'));
      navigateTo(AppRoutes.Manager.StaticPages);
    }
  };

  const handleSubmit = async () => {
    const result = await staticPageForm.safeParseAsync(formData);
    console.log(result);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
        metaTitle: fieldErrors.metaTitle?.[0],
        metaDescription: fieldErrors.metaDescription?.[0],
        isActive: fieldErrors.isActive?.[0],
      } as Partial<Record<keyof z.infer<typeof staticPageForm>, string>>);
      toast.error(t('validation.validationError'));
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      let thumbnail = formData.thumbnailUrl || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.url;
      }

      const submitData: StaticPageDto = {
        title: formData.title,
        content: formData.content,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isActive: formData.isActive,
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : thumbnail,
      };

      if (isEditing) {
        await updateStaticPage(id, submitData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createStaticPage(submitData);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo(AppRoutes.Manager.StaticPages);
    } catch (error) {
        const message = (error as any).response.data.message;
        toast.error(message);
      // toast.error(isEditing ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
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
      const key = name as keyof z.infer<typeof staticPageForm>;
      return { ...prev, [key]: undefined } as Partial<Record<keyof z.infer<typeof staticPageForm>, string>>;
    });
  };

  const onContentChange = (e: string) => {
    setFormData(prev => ({ ...prev, content: e }));
  }

  const handleFileChange = (field: string, value: File | null) => {
    if (value instanceof File) {
      setSelectedFile(value);
    } else {
      setSelectedFile(null);
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
      <PageBreadcrumb pageTitle={t('title')} items={[
        { title: t('title'), href: '/manager/static-pages' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex gap-6">
            {/* Phần upload hình ảnh - chiếm 3/10 */}
            <div className="w-3/10">
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-sm font-medium">{t('thumbnail')}</Label>
                <ImageUpload
                  value={formData.thumbnailUrl}
                  onChange={(value) => handleFileChange('thumbnailFile', value)}
                />
              </div>
            </div>

            {/* Phần thông tin - chiếm 7/10 */}
            <div className="w-7/10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">{t('title')}</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder={t('titlePlaceholder')}
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {formErrors.title && (
                    <div className="text-red-500 text-sm">{formErrors.title}</div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">{t('metaTitle')}</Label>
                    <Input
                      id="metaTitle"
                      name="metaTitle"
                      placeholder={t('metaTitlePlaceholder')}
                      type="text"
                      value={formData.metaTitle}
                      onChange={handleChange}
                    />
                    {formErrors.metaTitle && (
                      <div className="text-red-500 text-sm">{formErrors.metaTitle}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">{t('isActive')}</Label>
                    <Select value={formData.isActive?.toString() || 'true'} onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'true' }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('isActivePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        <SelectItem value="true" className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-500">{t('active')}</div>
                          </div>
                        </SelectItem>
                        <SelectItem value="false" className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-500">{t('inactive')}</div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">{t('metaDescription')}</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    placeholder={t('metaDescriptionPlaceholder')}
                    rows={3}
                    value={formData.metaDescription}
                    onChange={handleChange}
                    maxLength={160}
                  />
                  <div className="flex justify-between">
                    <div className="text-xs text-gray-500">
                      {formErrors.metaDescription && (
                        <div className="text-red-500 text-sm">{formErrors.metaDescription}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.metaDescription?.length || 0}/160
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('content')} <span className="text-red-500">*</span></Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={staticPage?.id || 'new'}
                      initialContent={staticPage?.content || formData.content}
                      placeholder={t('contentPlaceholder')}
                      onContentChange={onContentChange}
                    />
                    {formErrors.content && (
                      <div className="text-red-500 text-sm">{formErrors.content}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default StaticPageForm; 