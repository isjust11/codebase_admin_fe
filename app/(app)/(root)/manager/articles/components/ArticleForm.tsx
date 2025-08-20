import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createArticle, updateArticle, getArticle } from '@/services/article-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mergeImageUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ArticleDto } from '@/types/dto/ArticleDto';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppCategoryCode, AppRoutes } from '@/constants';
import { z } from 'zod';

const articleFormSchema = (t: any) => z.object({
  title: z.string().min(3, t('validation.titleMinLength'))
    .refine(val => val.trim() !== '', t('validation.titleRequired')),
  content: z.string().min(3, t('validation.contentMinLength'))
    .refine(val => val.trim() !== '', t('validation.contentRequired')),
  description: z.string().min(3, t('validation.descriptionMinLength'))
    .refine(val => val.trim() !== '', t('validation.descriptionRequired')),
  thumbnail: z.string().min(3, t('validation.thumbnailMinLength'))
    .refine(val => val.trim() !== '', t('validation.thumbnailRequired')),
  status: z.string().min(3, t('validation.statusMinLength'))
    .refine(val => val.trim() !== '', t('validation.statusRequired')),
  thumbnailFile: z.instanceof(File).optional(),
  thumbnailUrl: z.string().optional(),
});

const ArticleForm = () => {
  const t = useTranslations('ArticlePage');
  const tUtils = useTranslations('Utils');
  const {user} = useAuth();
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [article, setArticle] = useState<ArticleDto>();
  const articleForm = articleFormSchema(t);
  const [formData, setFormData] = useState<z.infer<typeof articleForm>>(
    article ? {
      title: article.title,
      content: article.content,
      description: article.description || '',
      thumbnail: article.thumbnail ? mergeImageUrl(article.thumbnail) : '',
      status: article.status || 'draft',
      thumbnailFile: undefined,
      thumbnailUrl: '',
    } : {
    title: '',
    content: '',
    description: '',
    thumbnail: '',
    status: 'draft',
    thumbnailFile: undefined,
    thumbnailUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof articleForm>, string>>>({});
  const id = params.id?.toString();

  const title = id ? t('updateArticle') : t('addArticle');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadArticle(id);
    }
  }, []);

  const loadArticle = async (id: string) => {
    try {
      const article = await getArticle(id);
      setArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        description: article.description || '',
        thumbnail: article.thumbnail ? mergeImageUrl(article.thumbnail) : '',
        status: article.status || 'draft',
        thumbnailFile: undefined,
        thumbnailUrl: '',
      });
    } catch (_error) {
      toast.error(t('messages.loadError'));
      navigateTo(AppRoutes.Manager.Articles);
    }
  };

  const handleSubmit = async () => {
    const result = await articleForm.safeParseAsync(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
        description: fieldErrors.description?.[0],
        thumbnail: fieldErrors.thumbnail?.[0],
        status: fieldErrors.status?.[0],
        thumbnailFile: fieldErrors.thumbnailFile?.[0],
      } as Partial<Record<keyof z.infer<typeof articleForm>, string>>);
      toast.error(t('validation.validationError'));
      return;
    }
    setFormErrors({});
    setLoading(true);
    try {
      let thumbnail = formData.thumbnail || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        authorId: user?.id || '', // Sử dụng ID của người dùng hiện tại
        // Nếu là URL đầy đủ, chuyển về đường dẫn tương đối trước khi lưu
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : thumbnail,
      };

      if (isEditing) {
        await updateArticle(id, submitData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createArticle(submitData);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo(AppRoutes.Manager.Articles);
    } catch (_error) {
      toast.error(isEditing ? t('messages.updateError') : t('messages.createError'));
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
      const key = name as keyof z.infer<typeof articleForm>;
      return { ...prev, [key]: undefined } as Partial<Record<keyof z.infer<typeof articleForm>, string>>;
    });
  };

  const handleSelectStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value,
    }));
    setFormErrors(prev => ({ ...prev, status: undefined }));
  };

  const changeContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content,
    }));
  };

  const handleImageChange = (field: string, value: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
        { title: t('title'), href: '/manager/articles' },
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
                  onChange={(value) => handleImageChange('thumbnail', value)}
                />
              </div>
            </div>

            {/* Phần thông tin - chiếm 7/10 */}
            <div className="w-7/10">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('title')} <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder={t('messages.titlePlaceholder')}
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                    {formErrors.title && (
                      <div className="text-red-500 text-sm">{formErrors.title}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">{t('status')} <span className="text-red-500">*</span></Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectStatusChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('messages.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        <SelectItem value="draft" className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">{t('draft')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={AppCategoryCode.ArticleStatus} className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">{t('published')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder={t('descriptionPlaceholder')}
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                  />
                  {formErrors.description && (
                    <div className="text-red-500 text-sm">{formErrors.description}</div>
                  )}
                  <div className="text-xs text-gray-500 text-right">
                    {formData.description?.length || 0}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('content')} <span className="text-red-500">*</span></Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={article?.id || 'new'}
                      initialContent={article?.content || ''}
                      placeholder={t('contentPlaceholder')}
                      onContentChange={(content) => {
                        setFormData(prev => ({
                          ...prev,
                          content: content,
                        }));
                      }}
                    />
                    {formErrors.content && (
                      <div className="text-red-500 text-sm">{formErrors.content}</div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default ArticleForm; 