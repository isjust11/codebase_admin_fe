'use client';

import { useEffect, useMemo, useState, useRef, ChangeEvent } from 'react';
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
import { ChevronLeft, ChevronRight, Save, X, Send, Upload, Check } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppRoutes } from '@/constants';
import { z } from 'zod';
import Select, { SelectOption } from '@/components/form/Select';
import { Switch } from '@/components/ui/switch';
import { TemplateTheme, TemplateVariable } from '@/types/template';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DEFAULT_THEME: TemplateTheme = {
  accent: '#ef4065',
  accentSoft: '#ffb3c3',
  ink: '#a82046',
  muted: '#c9244d',
  bg: '#fff5f7',
  bgSoft: '#fff0f4',
  onAccent: '#ffffff',
  fontDisplay: '"Gloock", "Lora", serif',
  fontScript: '"Pinyon Script", cursive',
  fontBody: '"Lora", Georgia, serif',
  fontSans: '"DM Sans", system-ui, sans-serif',
};

const STEPS = [
  { id: 0, key: 'basic' },
  { id: 1, key: 'theme' },
  { id: 2, key: 'schema' },
  { id: 3, key: 'review' },
] as const;

const schema = (t: any) =>
  z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    slug: z.string().min(2, t('validation.slugRequired')),
  });

function parseThemeBlob(raw: unknown): TemplateTheme {
  if (!raw) return { ...DEFAULT_THEME };
  if (typeof raw === 'string') {
    try {
      return { ...DEFAULT_THEME, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_THEME };
    }
  }
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, any>;
    if (obj.type === 'RAW' || obj.type === 'THEME') {
      const value = obj.value ?? obj.defaul;
      if (value && typeof value === 'object') return { ...DEFAULT_THEME, ...value };
      return { ...DEFAULT_THEME };
    }
    return { ...DEFAULT_THEME, ...obj };
  }
  return { ...DEFAULT_THEME };
}

export default function TemplateForm() {
  const t = useTranslations('TemplatePage');
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const { hasPermission } = useAuth();
  const params = useParams();
  const id = params.id?.toString();
  const canPublish = hasPermission('TEMPLATE_PUBLISH');

  const [step, setStep] = useState(0);
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

  const [theme, setTheme] = useState<TemplateTheme>({ ...DEFAULT_THEME });
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});
  const [configOpenKey, setConfigOpenKey] = useState<string | null>(null);

  const typeOptions: SelectOption[] = [
    { value: 'WEDDING', label: t('types.WEDDING') },
    { value: 'EVENT', label: t('types.EVENT') },
    { value: 'BIRTHDAY', label: t('types.BIRTHDAY') },
    { value: 'OTHER', label: t('types.OTHER') },
  ];

  const stepLabels = useMemo(
    () => [
      t('steps.basic'),
      t('steps.theme'),
      t('steps.schema'),
      t('steps.review'),
    ],
    [t],
  );

  useEffect(() => {
    if (id) loadTemplate(id);
  }, [id]);

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
    } catch {
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

      const rawData = data.data || {};
      setTemplateData(rawData);
      setTheme(parseThemeBlob(rawData.theme));

      const mergedVars: TemplateVariable[] = Object.keys(rawData)
        .filter((key) => key !== 'theme')
        .map((key) => {
          const val = rawData[key];
          if (val && typeof val === 'object' && !Array.isArray(val) && val.type) {
            return {
              key,
              id: val.id,
              defaultValue: val.value !== undefined ? val.value : val.defaul,
              labelVi: val.labelVi,
              labelEn: val.labelEn,
              placeHolder: val.placeHolder,
              required: val.required,
              itemSchema: val.itemSchema,
              type: val.type,
              config: val.config || {},
            };
          }
          return {
            key,
            defaultValue: val,
            type: 'RAW',
            config: {},
          };
        });
      setVariables(mergedVars);
    } catch {
      toast.error(t('messages.loadError'));
    }
  };

  const listDestination = () => (canPublish ? AppRoutes.Manager.Templates : AppRoutes.Manager.TemplatesMine);

  const validateBasic = async () => {
    const parsed = await schema(t).safeParseAsync({ name: formData.name, slug: formData.slug });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
      });
      setFormErrors(errors);
      toast.error(t('validation.validationError'));
      return false;
    }
    setFormErrors({});
    return true;
  };

  const goNext = async () => {
    if (step === 0) {
      const ok = await validateBasic();
      if (!ok) return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const buildDataPayload = () => {
    const updatedData: Record<string, any> = { ...templateData };

    variables.forEach((v) => {
      const prev = updatedData[v.key];
      if (v.type === 'RAW' || (prev && typeof prev !== 'object') || (prev && !prev.type && v.type === 'RAW')) {
        updatedData[v.key] = v.defaultValue;
        return;
      }
      updatedData[v.key] = {
        ...(typeof prev === 'object' && prev ? prev : {}),
        id: v.id ?? prev?.id,
        type: v.type || prev?.type || 'TEXT',
        labelVi: v.labelVi,
        labelEn: v.labelEn,
        placeHolder: v.placeHolder,
        required: !!v.required,
        itemSchema: v.itemSchema,
        value: v.defaultValue,
        config: {
          ...(prev?.config || {}),
          ...(v.config || {}),
        },
      };
    });

    updatedData.theme = theme;
    return updatedData;
  };

  const handleSubmit = async () => {
    const ok = await validateBasic();
    if (!ok) {
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl = formData.thumbnailUrl;
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        thumbnailUrl = uploaded.url || uploaded.publicRelativePath || thumbnailUrl;
      }

      const dataPayload = buildDataPayload();

      const payload = {
        name: formData.name,
        slug: formData.slug.trim(),
        type: formData.type,
        thumbnailUrl,
        description: formData.description,
        isPremium: formData.isPremium,
        data: Object.keys(dataPayload).length > 0 ? dataPayload : undefined,
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
    } catch {
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
    } catch {
      toast.error(t('messages.submitError'));
    }
  };

  const canSubmitReview = !!id && (status === 'DRAFT' || status === 'REJECTED');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      setLoading(true);
      await importSchema(id, file);
      toast.success(t('importSchemaSuccess'));
      await loadTemplate(id);
      setStep(2);
    } catch {
      toast.error(t('importSchemaError'));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updateVariable = (index: number, patch: Partial<TemplateVariable>) => {
    setVariables((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const updateVariableConfig = (index: number, patch: Record<string, string>) => {
    setVariables((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        config: { ...(next[index].config || {}), ...patch },
      };
      return next;
    });
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
            onClick: () => fileInputRef.current?.click(),
            title: t('importSchema'),
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
      <ComponentCard title={id ? t('updateTemplate') : t('addTemplate')} listAction={actions}>
        {/* Step indicator */}
        <ol className="mb-8 grid gap-2 sm:grid-cols-4">
          {STEPS.map((s, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                    active && 'border-stone-900 bg-stone-900 text-white',
                    done && !active && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                    !active && !done && 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      active && 'bg-white text-stone-900',
                      done && !active && 'bg-emerald-600 text-white',
                      !active && !done && 'bg-stone-100 text-stone-500',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider opacity-70">
                      {t('step')} {index + 1}
                    </span>
                    <span className="block truncate text-sm font-medium">{stepLabels[index]}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Step 1 — Basic */}
        {step === 0 && (
          <div className="grid max-w-3xl gap-5">
            <p className="text-sm text-stone-500">{t('steps.basicHint')}</p>
            <div>
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('namePlaceholder')}
              />
              {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div>
              <Label>{t('slug')}</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="wedding-basic"
              />
              <p className="mt-1 text-xs text-stone-500">{t('slugHint')}</p>
              {formErrors.slug && <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>}
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
                className="min-h-24"
              />
            </div>
            {id && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-500">{t('status')}:</span>
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
            <div className="flex flex-wrap items-center gap-6">
              {canPublish && (
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  {t('published')}
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={formData.isPremium}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                />
                {t('premium')}
              </label>
            </div>
          </div>
        )}

        {/* Step 2 — Theme tokens */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-stone-500">{t('steps.themeHint')}</p>
            <div
              className="rounded-xl border border-stone-200 p-5"
              style={{
                background: `linear-gradient(135deg, ${theme.bgSoft || '#fff0f4'}, ${theme.bg || '#fff5f7'})`,
                color: theme.ink || '#a82046',
              }}
            >
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">{t('themePreview')}</p>
              <p className="mt-2 font-serif text-3xl" style={{ fontFamily: theme.fontDisplay, color: theme.ink }}>
                Groom & Bride
              </p>
              <button
                type="button"
                className="mt-4 rounded-full px-5 py-2 text-sm text-white"
                style={{ background: theme.accent || '#ef4065' }}
              >
                RSVP
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ['accent', t('theme.accent')],
                  ['accentSoft', t('theme.accentSoft')],
                  ['ink', t('theme.ink')],
                  ['muted', t('theme.muted')],
                  ['bg', t('theme.bg')],
                  ['bgSoft', t('theme.bgSoft')],
                  ['onAccent', t('theme.onAccent')],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label className="mb-1.5 block">{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="h-10 w-14 cursor-pointer p-1"
                      value={theme[key] || '#000000'}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    />
                    <Input
                      value={theme[key] || ''}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      placeholder="#ef4065"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['fontDisplay', t('theme.fontDisplay')],
                  ['fontScript', t('theme.fontScript')],
                  ['fontBody', t('theme.fontBody')],
                  ['fontSans', t('theme.fontSans')],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label className="mb-1.5 block">{label}</Label>
                  <Input
                    value={theme[key] || ''}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    placeholder='"Gloock", serif'
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Schema / slots */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label className="text-base">{t('variables')}</Label>
                <p className="mt-1 text-sm text-stone-500">{t('steps.schemaHint')}</p>
              </div>
              {id && (
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importSchema')}
                </Button>
              )}
            </div>

            <div className="max-h-[560px] space-y-3 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-4">
              {variables.map((variable, index) => {
                const isArray = variable.type?.toLowerCase() === 'array';
                const isJson =
                  !isArray &&
                  (variable.type?.toLowerCase() === 'json' ||
                    variable.type?.toLowerCase() === 'textarea' ||
                    variable.type?.toLowerCase() === 'text_array' ||
                    variable.type?.toLowerCase() === 'raw');
                const fieldLabel = variable.labelVi || variable.labelEn || variable.key;
                const displayVal =
                  isJson && typeof variable.defaultValue === 'object'
                    ? JSON.stringify(variable.defaultValue, null, 2)
                    : variable.defaultValue ?? '';
                const configOpen = configOpenKey === variable.key;

                return (
                  <div key={`${variable.key}-${index}`} className="rounded-lg border border-stone-200 bg-white p-3">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <Label className="flex items-center gap-1 font-semibold text-stone-800">
                        {fieldLabel}
                        {variable.required && <span className="text-red-500">*</span>}
                        <span className="ml-2 text-xs font-normal text-stone-400">
                          {variable.key}
                          {variable.id != null ? ` · #${variable.id}` : ''}
                          {variable.type ? ` · ${variable.type}` : ''}
                        </span>
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setConfigOpenKey(configOpen ? null : variable.key)}
                      >
                        {t('fieldConfig')}
                      </Button>
                    </div>

                    {configOpen && (
                      <div className="mb-3 grid gap-3 rounded-md border border-dashed border-stone-200 bg-stone-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label className="text-xs">{t('theme.accent')} (color)</Label>
                          <Input
                            value={variable.config?.color || ''}
                            placeholder="#ef4065"
                            onChange={(e) => updateVariableConfig(index, { color: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t('theme.fontDisplay')} (font)</Label>
                          <Input
                            value={variable.config?.font || ''}
                            placeholder='"Gloock", serif'
                            onChange={(e) => updateVariableConfig(index, { font: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Size</Label>
                          <Input
                            value={variable.config?.size || ''}
                            placeholder="24"
                            onChange={(e) => updateVariableConfig(index, { size: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Display</Label>
                          <Select
                            options={[
                              { value: '1', label: t('visible') },
                              { value: '0', label: t('hidden') },
                            ]}
                            value={variable.config?.display === '0' || variable.config?.display === 'false' ? '0' : '1'}
                            onChange={(value) =>
                              updateVariableConfig(index, {
                                display: Array.isArray(value) ? value[0] : value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {isArray ? (
                      <div className="mt-2 space-y-3 rounded-md border p-3">
                        {(Array.isArray(variable.defaultValue) ? variable.defaultValue : []).map(
                          (item: any, itemIdx: number) => (
                            <div key={itemIdx} className="relative rounded-md border bg-stone-50 p-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                                  newArr.splice(itemIdx, 1);
                                  updateVariable(index, { defaultValue: newArr });
                                }}
                                className="absolute right-2 top-2 text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {Object.entries(variable.itemSchema || {}).map(([subKey, subField]: [string, any]) => (
                                  <div key={subKey}>
                                    <Label className="mb-1 block text-xs">{subField.labelVi || subKey}</Label>
                                    {subField.type?.toLowerCase() === 'image' ? (
                                      <ImageUpload
                                        value={item[subKey] || ''}
                                        onChange={(file) => {
                                          handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                                            const newArr = [
                                              ...(Array.isArray(variable.defaultValue) ? variable.defaultValue : []),
                                            ];
                                            newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: url };
                                            updateVariable(index, { defaultValue: newArr });
                                          });
                                        }}
                                      />
                                    ) : (
                                      <Input
                                        className="h-8 text-sm"
                                        value={item[subKey] || ''}
                                        placeholder={subField.placeHolder || ''}
                                        onChange={(e) => {
                                          const newArr = [
                                            ...(Array.isArray(variable.defaultValue) ? variable.defaultValue : []),
                                          ];
                                          newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: e.target.value };
                                          updateVariable(index, { defaultValue: newArr });
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                        <button
                          type="button"
                          className="text-sm font-medium text-stone-700"
                          onClick={() => {
                            const newArr = [...(Array.isArray(variable.defaultValue) ? variable.defaultValue : [])];
                            const emptyItem: Record<string, any> = {};
                            Object.keys(variable.itemSchema || {}).forEach((k) => {
                              emptyItem[k] = '';
                            });
                            newArr.push(emptyItem);
                            updateVariable(index, { defaultValue: newArr });
                          }}
                        >
                          + {t('addItem')}
                        </button>
                      </div>
                    ) : isJson ? (
                      <textarea
                        className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={displayVal}
                        placeholder={variable.placeHolder || ''}
                        onChange={(e) => {
                          let newVal: any = e.target.value;
                          if (
                            variable.type?.toLowerCase() === 'json' ||
                            variable.type?.toLowerCase() === 'text_array' ||
                            variable.type?.toLowerCase() === 'raw'
                          ) {
                            try {
                              newVal = JSON.parse(newVal);
                            } catch {
                              /* keep string while typing */
                            }
                          }
                          updateVariable(index, { defaultValue: newVal });
                        }}
                      />
                    ) : variable.type?.toLowerCase() === 'image' ? (
                      <div className="mt-1">
                        <ImageUpload
                          value={String(displayVal || '')}
                          onChange={(file) => {
                            handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                              updateVariable(index, { defaultValue: url });
                            });
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        type={variable.type?.toLowerCase() === 'date' ? 'datetime-local' : 'text'}
                        value={String(displayVal ?? '')}
                        placeholder={variable.placeHolder || ''}
                        onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
              {variables.length === 0 && (
                <p className="py-8 text-center text-sm text-stone-500">{t('emptySchema')}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <div className="grid max-w-3xl gap-4">
            <p className="text-sm text-stone-500">{t('steps.reviewHint')}</p>
            <div className="rounded-xl border border-stone-200 divide-y">
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('name')}</span>
                <span className="sm:col-span-2 text-sm font-medium">{formData.name || '—'}</span>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('slug')}</span>
                <span className="sm:col-span-2 font-mono text-sm">{formData.slug || '—'}</span>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('type')}</span>
                <span className="sm:col-span-2 text-sm">
                  {typeOptions.find((o) => o.value === formData.type)?.label || formData.type}
                </span>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('steps.theme')}</span>
                <span className="sm:col-span-2 flex items-center gap-2 text-sm">
                  <span
                    className="inline-block h-4 w-4 rounded-full border"
                    style={{ background: theme.accent }}
                  />
                  {theme.accent} · {theme.fontDisplay}
                </span>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('variables')}</span>
                <span className="sm:col-span-2 text-sm">
                  {t('fieldCount', { count: variables.length })}
                </span>
              </div>
              <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                <span className="text-sm text-stone-500">{t('premium')}</span>
                <span className="sm:col-span-2 text-sm">{formData.isPremium ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {tUtils('save')}
              </Button>
              {canSubmitReview && (
                <Button type="button" variant="outline" onClick={handleSubmitReview}>
                  <Send className="mr-2 h-4 w-4" />
                  {t('submitReview')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-4">
          <Button type="button" variant="outline" disabled={step === 0} onClick={goPrev}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {t('prevStep')}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              {t('nextStep')}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {tUtils('save')}
            </Button>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
