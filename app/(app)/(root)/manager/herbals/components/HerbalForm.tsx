import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getCategories } from '@/services/manager-api';
import { Category } from '@/types/category';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { Herbal } from '@/types/herbal';
import { uploadFile } from '@/services/media-api';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mergeImageUrl } from '@/lib/utils';
import Switch from "@/components/form/switch/Switch";
import { useLoading } from '@/contexts/LoadingContext';

interface HerbalFormProps {
  initialData?: Partial<Herbal>;
  isEditing?: boolean;
  onSubmit: (data: Herbal) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const HerbalForm: React.FC<HerbalFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { navigateTo, back } = useLoading();
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const [formData, setFormData] = useState<Herbal>({
    title: '',
    summary: '',
    content: '',
    scientificName: '',
    commonNames: '',
    family: '',
    partsUsed: '',
    activeCompounds: '',
    medicinalProperties: '',
    preparationMethods: '',
    dosage: '',
    contraindications: '',
    sideEffects: '',
    thumbnail: '',
    categoryId: '',
    isActive: true,
    id: '',
    slug: '',
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialData
  });

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories({ page: 1, size: 1000, search: '' });
        setCategories(response.data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
      if (initialData.thumbnail) {
        setPreviewUrl(initialData.thumbnail);
      }
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      let thumbnail = formData.thumbnail || '';

      // Upload image if there's a new file selected
      if (selectedFile) {
        const uploadResponse = await uploadFile(selectedFile);
        thumbnail = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', '') : thumbnail,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Lỗi khi submit form:', error);
      throw error;
    }
  };

  // Expose submit function to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).herbalFormSubmit = handleSubmit;
    }
  }, [formData, selectedFile]);

  return (
    <div className="flex gap-6">
      {/* Phần upload hình ảnh - chiếm 3/10 */}
      <div className="w-3/10">
        <div className="space-y-2">
          <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
            {previewUrl || formData.thumbnail ? (
              <div className="relative">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}
                {formData.thumbnail && (
                  <img
                    src={mergeImageUrl(formData.thumbnail)}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                )}

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
              <div
                {...getRootProps()}
                className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                    ${isDragActive
                    ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                    : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                  }
                  `}
              >
                <input {...getInputProps()} />

                <div className="dz-message flex flex-col items-center m-0!">
                  {/* Icon Container */}
                  <div className="mb-[22px] flex justify-center">
                    <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      <svg
                        className="fill-current"
                        width="29"
                        height="28"
                        viewBox="0 0 29 28"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Text Content */}
                  <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90 text-center">
                    {isDragActive ? tUtils('dropFileHere') : tUtils('dragAndDropFile')}
                  </h4>

                  <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                    {tUtils('dragAndDropFile')}
                  </span>

                  <span className="font-medium underline text-theme-sm text-brand-500">
                    {tUtils('selectImage')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phần thông tin - chiếm 7/10 */}
      <div className="w-7/10">
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('title')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('title')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">{t('category')}</Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('category')} />
                </SelectTrigger>
                <SelectContent className='bg-white dark:bg-gray-900'>
                  {categories.map((category) => (
                    <SelectItem className='bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800' key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scientificName">{t('scientificName')}</Label>
              <Input
                id="scientificName"
                value={formData.scientificName}
                onChange={(e) => handleInputChange('scientificName', e.target.value)}
                placeholder={t('scientificName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commonNames">{t('commonNames')}</Label>
              <Input
                id="commonNames"
                value={formData.commonNames}
                onChange={(e) => handleInputChange('commonNames', e.target.value)}
                placeholder={t('commonNames')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="family">{t('family')}</Label>
              <Input
                id="family"
                value={formData.family}
                onChange={(e) => handleInputChange('family', e.target.value)}
                placeholder={t('family')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partsUsed">{t('partsUsed')}</Label>
              <Input
                id="partsUsed"
                value={formData.partsUsed}
                onChange={(e) => handleInputChange('partsUsed', e.target.value)}
                placeholder={t('partsUsed')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activeCompounds">{t('activeCompounds')}</Label>
            <Input
              id="activeCompounds"
              value={formData.activeCompounds}
              onChange={(e) => handleInputChange('activeCompounds', e.target.value)}
              placeholder={t('activeCompounds')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicinalProperties">{t('medicinalProperties')}</Label>
            <Textarea
              id="medicinalProperties"
              value={formData.medicinalProperties}
              onChange={(e) => handleInputChange('medicinalProperties', e.target.value)}
              placeholder={t('medicinalProperties')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparationMethods">{t('preparationMethods')}</Label>
            <Textarea
              id="preparationMethods"
              value={formData.preparationMethods}
              onChange={(e) => handleInputChange('preparationMethods', e.target.value)}
              placeholder={t('preparationMethods')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">{t('dosage')}</Label>
            <Textarea
              id="dosage"
              value={formData.dosage}
              onChange={(e) => handleInputChange('dosage', e.target.value)}
              placeholder={t('dosage')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contraindications">{t('contraindications')}</Label>
              <Textarea
                id="contraindications"
                value={formData.contraindications}
                onChange={(e) => handleInputChange('contraindications', e.target.value)}
                placeholder={t('contraindications')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sideEffects">{t('sideEffects')}</Label>
              <Textarea
                id="sideEffects"
                value={formData.sideEffects}
                onChange={(e) => handleInputChange('sideEffects', e.target.value)}
                placeholder={t('sideEffects')}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">{t('summary')}</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder={t('summary')}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t('content')} *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder={t('content')}
              rows={10}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">{t('isActive')}</Label>
            <div className="flex items-center space-x-2">
              <Switch
                label={formData.isActive ? t('active') : t('inactive')}
                key={formData.id.toString()}
                defaultChecked={formData.isActive}
                onChange={(checked: boolean) => handleInputChange('isActive', checked)}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HerbalForm; 