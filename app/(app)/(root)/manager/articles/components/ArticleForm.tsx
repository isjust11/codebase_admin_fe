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
import { Plus, PlusIcon, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ArticleDto } from '@/types/dto/ArticleDto';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppCategoryCode, AppRoutes } from '@/constants';
import { z } from 'zod';
import { Category } from '@/types/category';
import { getAllDataSources, getCategoryByCode } from '@/services/manager-api';
import { DataSource } from '@/types/data-source';
import { Textarea } from '@/components/ui/textarea';

const articleFormSchema = (t: any) => z.object({
  title: z.string().min(3, t('validation.titleMinLength'))
    .refine(val => val.trim() !== '', t('validation.titleRequired')),
  content: z.string().min(3, t('validation.contentMinLength'))
    .refine(val => val.trim() !== '', t('validation.contentRequired')),
  summary: z.string().min(3, t('validation.summaryMinLength')),
  statusId: z.string().refine(val => val.trim() !== '', t('validation.statusRequired')),
  categoryId: z.string().refine(val => val.trim() !== '', t('validation.categoryRequired')),
  dataSourceId: z.string().optional(),
  thumbnailFile: z.instanceof(File).optional(),
  thumbnailUrl: z.string().optional(),
});

const ArticleForm = () => {
  const t = useTranslations('ArticlePage');
  const tUtils = useTranslations('Utils');
  const { user } = useAuth();
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [article, setArticle] = useState<ArticleDto>();
  const articleForm = articleFormSchema(t);
  const [articleStatus, setArticleStatus] = useState<Category[]>([]);
  const [articleType, setArticleType] = useState<Category[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loadingDataSources, setLoadingDataSources] = useState(false);

  const [formData, setFormData] = useState<z.infer<typeof articleForm>>(
    article ? {
      title: article.title,
      content: article.content,
      summary: article.summary || '',
      thumbnailUrl: article.thumbnail,
      statusId: article.statusId || '',
      thumbnailFile: undefined,
      categoryId: '',
      dataSourceId: (article as any).dataSourceId || '',
    } : {
      title: '',
      content: '',
      summary: '',
      statusId: '',
      thumbnailFile: undefined,
      categoryId: '',
      dataSourceId: '',
    });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof articleForm>, string>>>({});
  const id = params.id?.toString();

  const title = id ? t('updateArticle') : t('addArticle');

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadArticle(id);
    }
    loadCategories();
    loadDataSources();
  }, []);

  const loadCategories = async () => {
    const [articleStatus, articleType] = await Promise.all([
      getCategoryByCode(AppCategoryCode.ArticleStatus.code),
      getCategoryByCode(AppCategoryCode.ArticleType.code)
    ]);
    setArticleStatus(articleStatus);
    setArticleType(articleType);
  }

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

  const loadArticle = async (id: string) => {
    try {
      const article = await getArticle(id);
      setArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        statusId: article.statusId || '',
        thumbnailFile: undefined,
        thumbnailUrl: article.thumbnail,
        categoryId: article.categoryId || '',
        dataSourceId: (article as any).dataSourceId || '',
      });
    } catch (_error) {
      toast.error(t('messages.loadError'));
      navigateTo(AppRoutes.Manager.Articles);
    }
  };

  const handleSubmit = async () => {
    const result = await articleForm.safeParseAsync(formData);
    console.log(result);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        title: fieldErrors.title?.[0],
        content: fieldErrors.content?.[0],
        summary: fieldErrors.summary?.[0],
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
      let thumbnail = formData.thumbnailUrl || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.publicRelativePath;
      }

      const submitData = {
        ...formData,
        createdBy: user?.id || '',
        statusId: formData.statusId,
        categoryId: formData.categoryId,
        updatedBy: user?.id || '',
        dataSourceId: formData.dataSourceId,
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

  const onContentChange = (e: string) => {
    setFormData(prev => ({ ...prev, content: e }));
  }

  const handleSelectStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      statusId: value,
    }));
    setFormErrors(prev => ({ ...prev, statusId: undefined }));
  };

  const handleSelectCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: value,
    }));
    setFormErrors(prev => ({ ...prev, categoryId: undefined }));
  };

  const handleSelectDataSourceChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      dataSourceId: value,
    }));
  };

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
                    <Label htmlFor="category">{t('category')}</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleSelectCategoryChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('categoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        {
                          articleType?.length > 0 ? articleType.map((item) => (
                            <SelectItem key={item.id} value={item.id} className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                              <div className="flex items-center">
                                <div className="text-sm text-gray-500">{item.name}</div>
                              </div>
                            </SelectItem>
                          ))
                            :
                            <div className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300 p-2 cursor-pointer'
                              onClick={() => navigateTo('/manager/categories?onCreate=true&code=' + AppCategoryCode.ArticleType.code)}>
                              <div className="flex items-center">
                                <PlusIcon className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-500">{tUtils('addCategory')}</span>
                              </div>
                            </div>
                        }
                      </SelectContent>
                      {formErrors.categoryId && (
                        <div className="text-red-500 text-sm">{formErrors.categoryId}</div>
                      )}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select value={formData.statusId} onValueChange={(value) => handleSelectStatusChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        {
                          articleStatus?.length > 0 ? articleStatus.map((item) => (
                            <SelectItem key={item.id} value={item.id} className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                              <div className="flex items-center">
                                <div className="text-sm text-gray-500">{item.name}</div>
                              </div>
                            </SelectItem>
                          ))
                            :
                            <div className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300 p-2 cursor-pointer'
                              onClick={() => navigateTo('/manager/categories?onCreate=true&code=' + AppCategoryCode.ArticleStatus.code)}>
                              <div className="flex items-center">
                                <PlusIcon className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-500">{tUtils('addStatus')}</span>
                              </div>
                            </div>
                        }
                      </SelectContent>
                      {formErrors.statusId && (
                        <div className="text-red-500 text-sm">{formErrors.statusId}</div>
                      )}
                    </Select>

                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSource">{t('dataSource')}</Label>
                  <Select
                    value={formData.dataSourceId?.toString() || ''}
                    onValueChange={handleSelectDataSourceChange}
                    disabled={loadingDataSources}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingDataSources ? t('loading') : t('dataSourcePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent className="w-full bg-white">
                      {dataSources.length > 0 ? (
                        dataSources.map((item: DataSource) => (
                          <SelectItem key={item.id} value={item.id.toString()} className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300'>
                            <div className="flex items-center">
                              <div className="text-sm text-gray-500">{item.name}</div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className='hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300 p-2'
                          onClick={() => navigateTo('/manager/data-sources?onCreate=true')}>
                          <div className="flex items-center">
                            <PlusIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm text-gray-500">{tUtils('addDataSource')}</span>
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="summary">{t('summary')}</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder={t('summaryPlaceholder')}
                    rows={4}
                    value={formData.summary}
                    onChange={handleChange}
                    maxLength={500}
                  />
                  <div className="flex justify-between">
                    <div className="text-xs text-gray-500">
                      {formErrors.summary && (
                        <div className="text-red-500 text-sm">{formErrors.summary}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.summary?.length || 0}/500
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('content')} <span className="text-red-500">*</span></Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={article?.id || 'new'}
                      initialContent={article?.content || ''}
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

export default ArticleForm; 