'use client';

import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  createTemplate,
  getTemplate,
  submitTemplate,
  updateTemplate,
  importSchema,
} from '@/services/template-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Plus, Save, Trash, X, Send, Upload } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppRoutes } from '@/constants';
import { z } from 'zod';
import Select, { SelectOption } from '@/components/form/Select';
import { Switch } from '@/components/ui/switch';
import { TemplateVariable } from '@/types/template';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


const schema = (t: any) =>
  z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    slug: z.string().min(2, 'Slug is required'),
  });

export default function TemplateForm() {
  const t = useTranslations('TemplatePage');
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const { hasPermission } = useAuth();
  const params = useParams();
  const id = params.id?.toString();
  const canPublish = hasPermission('TEMPLATE_PUBLISH');

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('DRAFT');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'WEDDING',
    thumbnailUrl: '',
    description: '',
    isPublished: false,
    isPremium: false,
  });

  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});

  const typeOptions: SelectOption[] = [
    { value: 'WEDDING', label: t('types.WEDDING') },
    { value: 'EVENT', label: t('types.EVENT') },
    { value: 'BIRTHDAY', label: t('types.BIRTHDAY') },
    { value: 'OTHER', label: t('types.OTHER') },
  ];

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id, navigateTo]);

  const handleDynamicImageUpload = async (file: File | null, onUploadSuccess: (url: string) => void) => {
    if (!file) {
      onUploadSuccess('');
      return;
    }
    try {
      toast.info('Uploading image...', { id: 'upload-image' });
      const uploaded = await uploadFile(file);
      const url = uploaded.url || uploaded.publicRelativePath || '';
      onUploadSuccess(url);
      toast.success('Image uploaded successfully', { id: 'upload-image' });
    } catch (error) {
      toast.error('Failed to upload image', { id: 'upload-image' });
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      const data = await getTemplate(templateId);
      setFormData({
        name: data.name,
        slug: data.slug || '',
        type: data.type || 'EVENT',
        thumbnailUrl: data.thumbnailUrl || '',
        description: data.description || '',
        isPublished: !!data.isPublished,
        isPremium: !!data.isPremium,
      });
      setStatus(data.status || (data.isPublished ? 'PUBLISHED' : 'DRAFT'));
      const schemaKeys = data.data ? Object.keys(data.data) : [];
      let mergedVars: TemplateVariable[] = [];

      if (schemaKeys.length > 0) {
        mergedVars = schemaKeys.map((key) => {
          const val = data.data![key];
          return {
            key,
            defaultValue: val.value !== undefined ? val.value : val.defaul,
            labelVi: val.labelVi,
            labelEn: val.labelEn,
            placeHolder: val.placeHolder,
            required: val.required,
            itemSchema: val.itemSchema,
            type: val.type,
          };
        });
      }
      setVariables(mergedVars);
      setTemplateData(data.data || {});
    } catch (_error) {
      toast.error(t('messages.loadError'));
    }
  };

  const listDestination = () => (canPublish ? AppRoutes.Manager.Templates : AppRoutes.Manager.TemplatesMine);

  const handleSubmit = async () => {
    const parsed = await schema(t).safeParseAsync({ name: formData.name, slug: formData.slug });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      toast.error(t('validation.validationError'));
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl = formData.thumbnailUrl;
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        thumbnailUrl = uploaded.url || uploaded.publicRelativePath || thumbnailUrl;
      }

      const updatedData = { ...templateData };
      variables.forEach((v) => {
        if (updatedData[v.key]) {
          updatedData[v.key] = {
            ...updatedData[v.key],
            labelVi: v.labelVi,
            labelEn: v.labelEn,
            placeHolder: v.placeHolder,
            value: v.defaultValue,
          };
        }
      });

      const payload = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        thumbnailUrl,
        description: formData.description,
        htmlContent: '', // Empty because we use React host now
        cssContent: '', // Empty because we use React host now
        isPremium: formData.isPremium,
        editorMode: 'code' as const,
        data: Object.keys(updatedData).length > 0 ? updatedData : undefined,
        ...(canPublish ? { isPublished: formData.isPublished } : {}),
      };

      if (id) {
        await updateTemplate(id, payload);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createTemplate(payload);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo(listDestination());
    } catch (_error) {
      toast.error(id ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id) {
      toast.error(t('messages.saveBeforeSubmit'));
      return;
    }
    try {
      await submitTemplate(id);
      setStatus('PENDING');
      toast.success(t('messages.submitSuccess'));
    } catch (_error) {
      toast.error(t('messages.submitError'));
    }
  };

  const canSubmitReview = !!id && (status === 'DRAFT' || status === 'REJECTED');

  const handleImportSchemaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      setLoading(true);
      await importSchema(id, file);
      toast.success(tUtils('success') || 'Schema imported successfully');
      await loadTemplate(id);
    } catch (_error) {
      toast.error(tUtils('error') || 'Failed to import schema');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const actions: Action[] = [
    {
      icon: <Save className="w-4 h-4 mr-2" />,
      onClick: handleSubmit,
      title: tUtils('save'),
      isLoading: loading,
    },
    ...(canSubmitReview
      ? [
        {
          icon: <Send className="w-4 h-4 mr-2" />,
          onClick: handleSubmitReview,
          title: t('submitReview'),
          variant: 'outline' as const,
        },
      ]
      : []),
    ...(id
      ? [
        {
          icon: <Upload className="w-4 h-4 mr-2" />,
          onClick: handleImportSchemaClick,
          title: 'Import Schema',
          variant: 'outline' as const,
        },
      ]
      : []),
    {
      icon: <X className="w-4 h-4 mr-2" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      variant: 'outline',
    },
  ];

  return (
    <div>
      <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      <PageBreadcrumb pageTitle={id ? t('updateTemplate') : t('addTemplate')} />
      <ComponentCard
        title={id ? t('updateTemplate') : t('addTemplate')}
        listAction={actions}
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>

            <div>
              <Label>Slug (React Package Name)</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g., wedding-basic"
              />
              {formErrors.slug && <p className="text-sm text-red-500">{formErrors.slug}</p>}
            </div>

            <div>
              <Label>{t('description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
                className="min-h-20"
              />
            </div>

            {id && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{t('status')}:</span>
                <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>
                  {status === 'PENDING'
                    ? t('pending')
                    : status === 'PUBLISHED'
                      ? t('published')
                      : status === 'REJECTED'
                        ? t('rejected')
                        : t('draft')}
                </Badge>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('type')}</Label>
                <Select
                  options={typeOptions}
                  value={formData.type}
                  onChange={(value) => setFormData({ ...formData, type: Array.isArray(value) ? value[0] : value })}
                />
              </div>
              <div>
                <Label>{t('thumbnail')}</Label>
                <ImageUpload
                  value={formData.thumbnailUrl}
                  onChange={(file) => setSelectedFile(Array.isArray(file) ? file[0] : file)}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {canPublish && (
                <label className="flex items-center gap-2">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  {t('published')}
                </label>
              )}
              <label className="flex items-center gap-2">
                <Switch
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                />
                {t('premium')}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between">
              <Label>
                {t('variables')}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (Được tải tự động từ schema)
                </span>
              </Label>
            </div>

            <div className="space-y-3 border rounded-xl p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
              {variables.map((variable, index) => {
                const isArray = variable.type?.toLowerCase() === 'array';
                const isJson = !isArray && (variable.type?.toLowerCase() === 'json' || variable.type?.toLowerCase() === 'textarea' || variable.type?.toLowerCase() === 'text_array');
                const fieldLabel = variable.labelVi || variable.labelEn || variable.key;
                const displayVal = (isJson && typeof variable.defaultValue === 'object') ? JSON.stringify(variable.defaultValue, null, 2) : (variable.defaultValue || '');

                return (
                  <div key={`${variable.key}-${index}`} className="flex flex-col gap-2 p-3 bg-white border rounded-md">
                    <Label className="flex items-center gap-1 font-semibold text-blue-600">
                      {fieldLabel}
                      {variable.required && <span className="text-red-500" title="Bắt buộc">*</span>}
                      <span className="text-gray-400 font-normal text-xs ml-2">({variable.key})</span>
                    </Label>
                    
                    {isArray ? (
                      <div className="space-y-4 border rounded-md p-4 bg-white shadow-sm mt-2">
                        {(Array.isArray(variable.defaultValue) ? variable.defaultValue : []).map((item: any, itemIdx: number) => (
                          <div key={itemIdx} className="p-3 bg-stone-50 border rounded-md relative group">
                            <button
                              type="button"
                              onClick={() => {
                                const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                                newArr.splice(itemIdx, 1);
                                const next = [...variables];
                                next[index] = { ...variable, defaultValue: newArr };
                                setVariables(next);
                              }}
                              className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {Object.entries(variable.itemSchema || {}).map(([subKey, subField]: [string, any]) => (
                                <div key={subKey}>
                                  <Label className="text-xs mb-1 block">{subField.labelVi || subKey}</Label>
                                  {subField.type?.toLowerCase() === 'image' ? (
                                    <ImageUpload
                                      value={item[subKey] || ''}
                                      onChange={(file) => {
                                        handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                                          const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                                          newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: url };
                                          const next = [...variables];
                                          next[index] = { ...variable, defaultValue: newArr };
                                          setVariables(next);
                                        });
                                      }}
                                    />
                                  ) : (
                                    <Input
                                      className="h-8 text-sm"
                                      value={item[subKey] || ''}
                                      placeholder={subField.placeHolder || ''}
                                      onChange={(e) => {
                                        const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                                        newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: e.target.value };
                                        const next = [...variables];
                                        next[index] = { ...variable, defaultValue: newArr };
                                        setVariables(next);
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="text-sm text-blue-600 font-medium"
                          onClick={() => {
                            const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                            const emptyItem: Record<string, any> = {};
                            Object.keys(variable.itemSchema || {}).forEach(k => emptyItem[k] = '');
                            newArr.push(emptyItem);
                            const next = [...variables];
                            next[index] = { ...variable, defaultValue: newArr };
                            setVariables(next);
                          }}
                        >
                          + Thêm mục mới
                        </button>
                      </div>
                    ) : isJson ? (
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={displayVal}
                        placeholder={variable.placeHolder || ''}
                        onChange={(e) => {
                          let newVal: any = e.target.value;
                          if (variable.type?.toLowerCase() === 'json' || variable.type?.toLowerCase() === 'text_array') {
                            try { newVal = JSON.parse(newVal); } catch (err) { /* keep as string */ }
                          }
                          const next = [...variables];
                          next[index] = { ...variable, defaultValue: newVal };
                          setVariables(next);
                        }}
                      />
                    ) : variable.type?.toLowerCase() === 'image' ? (
                      <div className="mt-1">
                        <ImageUpload
                          value={displayVal}
                          onChange={(file) => {
                            handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                              const next = [...variables];
                              next[index] = { ...variable, defaultValue: url };
                              setVariables(next);
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        type={variable.type?.toLowerCase() === 'date' ? 'datetime-local' : 'text'}
                        value={displayVal}
                        placeholder={variable.placeHolder || ''}
                        onChange={(e) => {
                          const next = [...variables];
                          next[index] = { ...variable, defaultValue: e.target.value };
                          setVariables(next);
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {variables.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có dữ liệu schema (Vui lòng Import Schema)</p>
              )}
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
