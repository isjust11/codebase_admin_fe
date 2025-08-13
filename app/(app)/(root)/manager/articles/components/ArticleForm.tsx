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
import { Switch } from '@/components/ui/switch';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { useDropzone } from "react-dropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mergeImageUrl } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ArticleDto } from '@/types/dto/ArticleDto';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';

const ArticleForm = () => {
  const t = useTranslations('ArticlePage');
  const tUtils = useTranslations('Utils');
  const {user} = useAuth();
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleDto>();
  const [formData, setFormData] = useState<ArticleDto>({
    title: '',
    content: '',
    description: '',
    thumbnail: '',
    status: 'draft',
  });
  const id = params.id?.toString();

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
      });
    } catch (_error) {
      toast.error(t('messages.loadError'));
      navigateTo('/manager/articles');
    }
  };

  const handleSubmit = async () => {
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
      navigateTo('/manager/articles');
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
  };

  const handleSelectStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value,
    }));
  };

  const changeContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content,
    }));
  };

  const changeDescription = (description: string) => {
    // Kiểm tra độ dài description
    if (description.length > 500) {
      toast.error(t('messages.descriptionLengthError'));
      return;
    }

    setFormData(prev => ({
      ...prev,
      description: description,
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
                <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
                  {previewUrl || formData.thumbnail ? (
                    <div className="relative">
                      <img
                        src={previewUrl || formData.thumbnail || ''}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
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
                    <ImageUpload
                      value={formData.thumbnail}
                      onChange={(value) => handleImageChange('thumbnail', value)}
                      placeholder={t('messages.thumbnailPlaceholder')}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Phần thông tin - chiếm 7/10 */}
            <div className="w-7/10">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t('title')}</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder={t('messages.titlePlaceholder')}
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">{t('status')}</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectStatusChange(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('messages.statusPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="w-full bg-white">
                        <SelectItem value="draft">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">{t('draft')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="published">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500">{t('published')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder={t('descriptionPlaceholder')}
                    type="text"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.description?.length || 0}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('content')}</Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={article?.id || 'new'}
                      initialContent={article?.content || ''}
                      placeholder={t('contentPlaceholder')}
                      onContentChange={(content) => changeContent(content)}
                    />
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