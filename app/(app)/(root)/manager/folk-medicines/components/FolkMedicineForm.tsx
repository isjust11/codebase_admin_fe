import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createFolkMedicine, updateFolkMedicine, getFolkMedicine } from '@/services/folk-medicine-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Action } from '@/types/actions';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { useDropzone } from "react-dropzone";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types/category';
import { FolkMedicine, CreateFolkMedicineDto, FolkMedicineComponentDto } from '@/types/folk-medicine';
import { useTranslations } from 'next-intl';
import { getAllDataSources, getCategoryByCode } from '@/services/manager-api';
import { DataSource } from '@/types/data-source';
import { AppCategoryCode } from '@/constants';
import Switch from '@/components/form/switch/Switch';
import { useLoading } from '@/contexts/LoadingContext';
import { getAllAuthors } from '@/services/author-api';
import { Author } from '@/types/author';
import { mergeImageUrl } from '@/lib/utils';
import { z } from 'zod';
import Select, { SelectOption } from '@/components/form/Select';
import { getAllHerbal } from '@/services/herbal-api';
import TextArea from '@/components/form/input/TextArea';

const folkMedicineFormSchema = (t: any) => z.object({
  title: z.string().min(3, t('validation.titleMinLength'))
    .refine(val => val.trim() !== '', t('validation.titleRequired')),
  summary: z.string().optional(),
  content: z.string().min(10, t('validation.contentMinLength'))
    .refine(val => val.trim() !== '', t('validation.contentRequired')),
  ingredients: z.string().optional(),
  preparation: z.string().optional(),
  usage: z.string().optional(),
  notes: z.string().optional(),
  thumbnail: z.string().optional(),
  authorId: z.string().refine(val => val.trim() !== '', t('validation.authorRequired')),
  categoryId: z.string().refine(val => val.trim() !== '', t('validation.categoryRequired')),
  dataSourceId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  id: z.string().optional(),
  slug: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  components: z.array(z.object({
    herbalId: z.string().min(1),
    quantity: z.number().nonnegative(),
    unitCategoryId: z.string().optional(),
    note: z.string().optional(),
    sortOrder: z.number().optional(),
  })).optional()
});

const FolkMedicineForm = () => {
  const t = useTranslations('FolkMedicinesPage');
  const [isPending, startTransition] = useTransition();
  const tAuthor = useTranslations('AuthorsPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [folkMedicine, setFolkMedicine] = useState<FolkMedicine | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataSourcesOptions, setDataSourcesOptions] = useState<SelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<SelectOption[]>([]);
  const [authorsOptions, setAuthorsOptions] = useState<SelectOption[]>([]);
  const [herbalOptions, setHerbalOptions] = useState<SelectOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<SelectOption[]>([]);
  const [loadingDataSources, setLoadingDataSources] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FolkMedicine, string>>>({});
  const folkMedicineForm = folkMedicineFormSchema(t);
  const [formData, setFormData] = useState<FolkMedicine>({
    id: '',
    slug: '',
    title: '',
    summary: '',
    content: '',
    ingredients: '',
    preparation: '',
    usage: '',
    notes: '',
    thumbnail: '',
    authorId: '',
    categoryId: '',
    dataSourceId: null,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    components: [],
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

  const title = id ? t('updateFolkMedicine') : t('addFolkMedicine');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, authorsData, herbalsData, unitCats] = await Promise.all([
          getCategoryByCode(AppCategoryCode.FolkMedicine.code),
          getAllAuthors(),
          getAllHerbal(),
          getCategoryByCode(AppCategoryCode.UnitOfMeasure.code),
        ]);
        setCategories(categoriesData || []);
        setAuthors(authorsData || []);
        const categoriesOptions = categoriesData.map((category: Category) => ({
          value: category.id.toString(),
          label: category.name,
        }));

        setCategoriesOptions(categoriesOptions);
        const authorsOptions = authorsData.map((author: Author) => ({
          avatar: author.avatar,
          value: author.id.toString(),
          label: author.name,
        }));
        setAuthorsOptions(authorsOptions);
        const herOptions = (herbalsData || []).map((h: any) => ({
          value: h.id?.toString?.() || '',
          label: h.title,
        }));
        setHerbalOptions(herOptions);
        const unitOpts = (unitCats || []).map((c: Category) => ({
          value: c.id.toString(),
          label: c.name,
        }));
        setUnitOptions(unitOpts);
      } catch (error) {
        toast.error(t('messages.error'));
      }
    };

    fetchData();
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setLoadingDataSources(true);
    try {
      const response = await getAllDataSources();
      setDataSources(response);
      const options = response.map((dataSource: DataSource) => ({
        value: dataSource.id.toString(),
        label: dataSource.name,
      }));
      setDataSourcesOptions(options);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    } finally {
      setLoadingDataSources(false);
    }
  }

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadFolkMedicine(id);
    }
  }, [id]);

  // Thêm useEffect để theo dõi formData
  useEffect(() => {
    if (isEditing && formData.id) {
      console.log('formData updated:', formData);
    }
  }, [formData, isEditing]);

  const loadFolkMedicine = async (id: string) => {
    try {
      const data = await getFolkMedicine(id);
      setFolkMedicine(data);
      console.log('data values:', data);
      setFormData(prev => ({
        ...prev,
        ...data,
        dataSourceId: (data as any).dataSourceId || null,
        components: (data as any)?.ingredientsDetail?.map((ing: any, index: number) => ({
          herbalId: ing.herbal?.id?.toString?.() || ing.herbalId?.toString?.() || '',
          quantity: Number(ing.quantity) || 0,
          unitCategoryId: ing.unitCategory?.id?.toString?.() || ing.unitCategoryId?.toString?.(),
          note: ing.note || '',
          sortOrder: typeof ing.sortOrder === 'number' ? ing.sortOrder : index,
        })) || [],
      }));
      if (data.thumbnail) {
        data.thumbnail = mergeImageUrl(data.thumbnail);
      }
      // Không log formData ở đây vì nó chưa được cập nhật
    } catch (_error) {
      toast.error(t('messages.error'));
      navigateTo('/manager/folk-medicines');
    }
  };

  const handleCreateAuthor = () => {
    startTransition(() => {
      navigateTo('/manager/authors/create');
    });
  }

  const handleSubmit = async () => {
    const result = await folkMedicineForm.safeParseAsync({
      ...formData,
      components: formData.components?.map((c) => ({
        ...c,
        quantity: Number(c.quantity),
      })),
    });
    console.log(result);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>;
      setFormErrors({
        title: fieldErrors.title?.[0],
        summary: fieldErrors.summary?.[0],
        content: fieldErrors.content?.[0],
        ingredients: fieldErrors.ingredients?.[0],
        preparation: fieldErrors.preparation?.[0],
        usage: fieldErrors.usage?.[0],
        notes: fieldErrors.notes?.[0],
        thumbnail: fieldErrors.thumbnail?.[0],
        authorId: fieldErrors.authorId?.[0],
        categoryId: fieldErrors.categoryId?.[0],
        dataSourceId: fieldErrors.dataSourceId?.[0],
        isActive: fieldErrors.isActive?.[0],
      } as Partial<Record<keyof FolkMedicine, string>>);
      toast.error(t('validation.validationError'))
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
        authorId: formData.authorId || '',
        components: (formData.components || []).map((c, index) => ({
          herbalId: c.herbalId,
          quantity: Number(c.quantity),
          unitCategoryId: c.unitCategoryId,
          note: c.note,
          sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : index,
        } as FolkMedicineComponentDto)),
        // Nếu là URL đầy đủ, chuyển về đường dẫn tương đối trước khi lưu
        thumbnail: thumbnail.startsWith('http') ? thumbnail.replace(process.env.STORAGE_API_URL || 'http://localhost:3005', '') : thumbnail,
      };

      if (isEditing) {
        await updateFolkMedicine(id || '', submitData);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createFolkMedicine(submitData);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo('/manager/folk-medicines');
    } catch (_error) {
      toast.error(isEditing ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleComponentChange = (index: number, field: keyof FolkMedicineComponentDto, value: any) => {
    setFormData(prev => {
      const next = { ...(prev as any) };
      const components = [...(next.components || [])];
      const item = { ...(components[index] || {}) };
      (item as any)[field] = field === 'quantity' ? Number(value) : value;
      components[index] = item as FolkMedicineComponentDto;
      next.components = components;
      return next;
    });
  };

  const addComponentRow = () => {
    setFormData(prev => ({
      ...prev,
      components: [
        ...(prev.components || []),
        { herbalId: '', quantity: 0, unitCategoryId: undefined, note: '', sortOrder: (prev.components?.length || 0) } as FolkMedicineComponentDto,
      ],
    }));
  };

  const removeComponentRow = (index: number) => {
    setFormData(prev => {
      const next = { ...(prev as any) };
      next.components = (next.components || []).filter((_: any, i: number) => i !== index);
      return next;
    });
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

  const handleChangeTitle = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value.length < 3) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.titleMinLength') }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleChangeContent = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value.length < 10) {
      setFormErrors(prev => ({ ...prev, [field]: t('validation.contentMinLength') }));
    } else {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof CreateFolkMedicineDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const changeContent = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content: content,
    }));
  };

  const listAction: Action[] = [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        back();
      },
      title: "Hủy",
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? "Cập nhật" : "Thêm mới",
      className: "bg-blue-500 hover:bg-blue-600 rounded-md transition-colors text-white",
      isLoading: loading
    },
  ];

  const handleCreateCategory = () => {
    startTransition(() => {
      navigateTo('/manager/categories?onCreate=true&code=' + AppCategoryCode.FolkMedicine.code);
    });
  }

  return (
    <div>
      <PageBreadcrumb pageTitle={title} items={[
        { title: 'Danh sách bài thuốc dân gian', href: '/manager/folk-medicines' },
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
                        title={tUtils('delete')}
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
                    <form
                      {...getRootProps()}
                      className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                          ${isDragActive
                          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
                        }
                        `}
                      id="demo-upload"
                    >
                      {/* Hidden Input */}
                      <input {...getInputProps()} />

                      <div className="dz-message flex flex-col items-center m-0!">
                        {/* Icon Container */}
                        <div className="mb-[22px] flex justify-center">
                          <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
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
                        <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                          {isDragActive ? tUtils('dropFile') : tUtils('dragAndDropFile')}
                        </h4>

                        <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                          {tUtils('dragAndDropFile')}
                        </span>

                        <span className="font-medium underline text-theme-sm text-brand-500">
                          {tUtils('selectImage')}
                        </span>
                      </div>
                    </form>
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
                      name="title"
                      placeholder={t('enterTitle')}
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChangeTitle('title', e.target.value)}
                    />
                    {formErrors.title && (
                      <div className="text-red-500 text-sm">{formErrors.title}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">{t('category')}</Label>
                    <Select
                      options={categoriesOptions}
                      placeholder={t('selectCategory')}
                      onChange={(values) => handleSelectChange('categoryId', Array.isArray(values) ? values : values)}
                      value={formData.categoryId || ''}
                      multiple={false}
                    />
                    {formErrors.categoryId && (
                      <div className="text-red-500 text-sm">{formErrors.categoryId}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorId">{t('author')}</Label>
                    <Select
                      options={authorsOptions}
                      placeholder={t('selectAuthor')}
                      onChange={(values) => handleSelectChange('authorId', Array.isArray(values) ? values : values)}
                      value={formData.authorId || ''}
                      multiple={false}
                    />
                    {formErrors.authorId && (
                      <div className="text-red-500 text-sm">{formErrors.authorId}</div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="isActive">{t('isActive')}</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          onChange={(checked: boolean) => handleSelectChange('isActive', checked)}
                          defaultChecked={formData.isActive}
                          label={formData.isActive ? t('active') : t('inactive')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataSourceId">{t('dataSource')}</Label>
                  <Select
                    options={dataSourcesOptions}
                    placeholder={t('selectDataSource')}
                    onChange={(values) => handleSelectChange('dataSourceId', Array.isArray(values) ? values : values)}
                    value={formData.dataSourceId || ''}
                    multiple={false}
                    searchable={true}
                    searchPlaceholder={t('searchDataSource')}
                    emptyMessage={t('noDataSource')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">{t('summary')}</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder={t('enterSummary')}
                    value={formData.summary}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.summary?.length || 0}/500
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">{t('content')} *</Label>
                  <div className="ring-1 ring-gray-100/5 rounded-md shadow-sm p-2">
                    <SimpleEditor
                      key={folkMedicine?.id || 'new'}
                      initialContent={folkMedicine?.content || ''}
                      placeholder={t('enterContent')}
                      onContentChange={(content) => {
                        changeContent(content);
                        handleChangeContent('content', content);
                      }}
                    />
                  </div>
                  {formErrors.content && (
                    <div className="text-red-500 text-sm">{formErrors.content}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t('components')} <span className="text-gray-500 text-sm">({t('herbal')} + {t('quantity')} + {t('unit')})</span></Label>
                      <button
                        type="button"
                        onClick={addComponentRow}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> <span className="text-white text-sm py-1">{t('addRow')}</span>
                      </button>
                    </div>
                    <div className="space-y-2 space-x-2">
                      {formData.components && formData.components.length > 0 ? formData.components.map((comp, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end border rounded-md p-2">
                          <div className="col-span-4">
                            <Label className="mb-2">{t('herbal')} <span className="text-gray-500 text-sm">*</span></Label>
                            <Select
                              options={herbalOptions}
                              placeholder={t('selectHerbal')}
                              value={comp.herbalId || ''}
                              multiple={false}
                              onChange={(val) => handleComponentChange(idx, 'herbalId', Array.isArray(val) ? '' : val)}
                              searchable
                              searchPlaceholder={t('searchHerbal')}
                            />
                          </div>
                          <div className="col-span-3 space-x-2">
                            <Label className="mb-2">{t('quantity')} <span className="text-gray-500 text-sm">*</span></Label>
                            <Input
                              type="number"
                              step="0.001"
                              value={comp.quantity ?? 0}
                              onChange={(e) => handleComponentChange(idx, 'quantity', e.target.value)}
                            />
                          </div>
                          <div className="col-span-3 space-x-2">
                            <Label className="mb-2">{t('unit')} <span className="text-gray-500 text-sm">*</span></Label>
                            <Select
                              options={unitOptions}
                              placeholder={t('selectUnit')}
                              value={comp.unitCategoryId || ''}
                              multiple={false}
                              onChange={(val) => handleComponentChange(idx, 'unitCategoryId', Array.isArray(val) ? '' : val)}
                            />
                          </div>
                          <div className="flex gap-2 justify-center items-center">

                            <button
                              title={t('deleteRow')}
                              onClick={() => removeComponentRow(idx)}
                              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                            >
                              <X className="h-4 w-4 text-white" /> Xóa
                            </button>
                          </div>
                          <div className="col-span-12">
                            <Label className="mb-2">{t('note')} <span className="text-gray-500 text-sm">*</span></Label>
                            <TextArea
                              value={comp.note || ''}
                              onChange={(value) => handleComponentChange(idx, 'note', value)}
                              placeholder={t('enterNote')}
                              rows={3}
                            />
                          </div>
                        </div>
                      )):
                      <div className="text-gray-500 text-sm text-center">
                        <div className="flex items-center justify-center py-5 bg-gray-200 rounded-md">
                          <span className="text-gray-500 text-sm">{tUtils('noData')}</span>
                        </div>
                      </div>
                      }
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preparation">{t('preparation')}</Label>
                    <Textarea
                      id="preparation"
                      name="preparation"
                      placeholder={t('enterPreparation')}
                      value={formData.preparation}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usage">{t('usage')}</Label>
                    <Textarea
                      id="usage"
                      name="usage"
                      placeholder={t('enterUsage')}
                      value={formData.usage}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('notes')}</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={t('enterNotes')}
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
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

export default FolkMedicineForm; 