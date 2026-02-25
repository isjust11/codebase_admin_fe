import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCategoryByCode } from '@/services/manager-api';
import { Category } from '@/types/category';
import { Book } from '@/types/book';
import { uploadFile } from '@/services/media-api';
import { useTranslations } from 'next-intl';
import Switch from "@/components/form/switch/Switch";
import { AppCategoryCode } from '@/constants';
import { z } from 'zod';
import { toast } from 'sonner';
import ImageUpload from '@/components/ui/ImageUpload';
import Select, { SelectOption } from '@/components/form/Select';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

interface BookFormProps {
  initialData?: Partial<Book>;
  isEditing?: boolean;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const bookFormSchema = (t: any) => z.object({
  title: z.string().min(1, t('validation.titleRequired')),
  author: z.string().min(1, t('validation.authorRequired')),
  description: z.string().optional(),
  fileUrl: z.string().min(1, t('validation.fileUrlRequired')),
  coverImageUrl: z.string().optional(),
  totalPages: z.number().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  language: z.string().optional(),
  isPublic: z.boolean().optional(),
  category: z.string().optional(),
});

const BookForm: React.FC<BookFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  loading = false
}) => {
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const t = useTranslations('Ebooks');
  const tUtils = useTranslations('Utils');
  const schema = bookFormSchema(t);

  const [formData, setFormData] = useState<Record<string, any>>({
    title: '',
    author: '',
    description: '',
    coverImageUrl: '',
    fileUrl: '',
    totalPages: undefined,
    isbn: '',
    publisher: '',
    publishedDate: '',
    language: 'vi',
    isPublic: true,
    category: '',
    ...initialData,
    category: initialData?.category?.id?.toString() || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategoryByCode(AppCategoryCode.BookCategory.code);
      setCategoriesOptions(data.map((cat: Category) => ({
        value: cat.id.toString(),
        label: cat.name,
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        category: initialData?.category?.id?.toString() || '',
      }));
      if (initialData.coverImageUrl) {
        setPreviewUrl(initialData.coverImageUrl);
      }
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCoverFileChange = (value: File | null) => {
    setSelectedCoverFile(value instanceof File ? value : null);
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error(t('validation.pdfOnly'));
      return;
    }

    setSelectedPdfFile(file);
    setUploadingPdf(true);
    try {
      const result = await uploadFile(file);
      setFormData(prev => ({ ...prev, fileUrl: result.publicRelativePath }));
      toast.success(t('pdfUploadSuccess'));
    } catch (error) {
      toast.error(t('pdfUploadError'));
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async () => {
    const result = await schema.safeParseAsync(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      const errors: Record<string, string | undefined> = {};
      Object.entries(fieldErrors).forEach(([key, val]) => {
        errors[key] = val?.[0];
      });
      setFormErrors(errors);
      toast.error(t('validation.validationError'));
      return;
    }
    setFormErrors({});

    try {
      let coverImageUrl = formData.coverImageUrl || '';
      if (selectedCoverFile) {
        const uploadResponse = await uploadFile(selectedCoverFile);
        coverImageUrl = uploadResponse.publicRelativePath;
      }

      const submitData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        coverImageUrl,
        fileUrl: formData.fileUrl,
        totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
        isbn: formData.isbn,
        publisher: formData.publisher,
        publishedDate: formData.publishedDate,
        language: formData.language,
        isPublic: formData.isPublic,
        category: formData.category || undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).bookFormSubmit = handleSubmit;
    }
  }, [formData, selectedCoverFile]);

  const languageOptions: SelectOption[] = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
    { value: 'fr', label: 'Français' },
  ];

  return (
    <div className="flex gap-6">
      <div className="w-3/10">
        <div className="space-y-4">
          <Label>{t('coverImage')}</Label>
          <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
            <ImageUpload
              multiple={false}
              value={formData.coverImageUrl}
              onChange={(value: File | null) => handleCoverFileChange(value)}
            />
          </div>

          <div className="mt-4">
            <Label>{t('pdfFile')} <span className="text-red-500">(*)</span></Label>
            <div className="mt-2">
              {formData.fileUrl ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-600 text-sm font-medium">
                    {selectedPdfFile?.name || t('fileUploaded')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, fileUrl: '' }));
                      setSelectedPdfFile(null);
                    }}
                    className="text-red-500 text-xs hover:underline ml-auto"
                  >
                    {t('removeFile')}
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-2 pb-2">
                    {uploadingPdf ? (
                      <span className="text-sm text-gray-500">{t('uploading')}</span>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">{t('clickToUploadPdf')}</span>
                        <span className="text-xs text-gray-400">PDF (max 50MB)</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handlePdfFileChange}
                    disabled={uploadingPdf}
                  />
                </label>
              )}
              {formErrors.fileUrl && (
                <div className="text-red-500 text-sm mt-1">{formErrors.fileUrl}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-7/10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')} <span className="text-red-500">(*)</span></Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('titlePlaceholder')}
              />
              {formErrors.title && <div className="text-red-500 text-sm">{formErrors.title}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">{t('author')} <span className="text-red-500">(*)</span></Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                placeholder={t('authorPlaceholder')}
              />
              {formErrors.author && <div className="text-red-500 text-sm">{formErrors.author}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('category')}</Label>
              <Select
                options={categoriesOptions}
                placeholder={tUtils('selectCategory')}
                value={formData.category || ''}
                onChange={(value) => handleInputChange('category', value as string)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select
                options={languageOptions}
                placeholder={t('selectLanguage')}
                value={formData.language || 'vi'}
                onChange={(value) => handleInputChange('language', value as string)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => handleInputChange('isbn', e.target.value)}
                placeholder="978-..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">{t('publisher')}</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => handleInputChange('publisher', e.target.value)}
                placeholder={t('publisherPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPages">{t('totalPages')}</Label>
              <Input
                id="totalPages"
                type="number"
                value={formData.totalPages || ''}
                onChange={(e) => handleInputChange('totalPages', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publishedDate">{t('publishedDate')}</Label>
            <Input
              id="publishedDate"
              type="date"
              value={formData.publishedDate ? formData.publishedDate.split('T')[0] : ''}
              onChange={(e) => handleInputChange('publishedDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <SimpleEditor
              key={formData.id || 'new'}
              initialContent={formData.description || ''}
              onContentChange={(content) => handleInputChange('description', content)}
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isPublic">{t('status')}</Label>
            <div className="flex items-center space-x-2">
              <Switch
                label={formData.isPublic ? t('public') : t('private')}
                defaultChecked={formData.isPublic}
                onChange={(checked: boolean) => handleInputChange('isPublic', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookForm;
