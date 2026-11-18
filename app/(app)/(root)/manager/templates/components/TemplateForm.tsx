'use client';

import { useEffect, useMemo, useState, useRef, ChangeEvent, type ReactNode } from 'react';
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
import { ChevronLeft, ChevronRight, Save, X, Send, Upload, Check, Plus } from 'lucide-react';
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
import { cn, mergeImageUrl } from '@/lib/utils';
import LivePreviewPanel from '@/components/eventlab/LivePreviewPanel';
import { getActiveInviteEffects } from '@/services/manager-api';
import { InviteEffect } from '@/types/invite-effect';
import {
  MATERIAL_THEME_PRESETS,
  matchMaterialPresetId,
} from './material-theme-presets';

/** Label sits above control with consistent vertical gap. */
function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  compact,
  className,
  children,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn(compact ? 'space-y-1.5' : 'space-y-2', className)}>
      {label != null ? (
        <Label
          htmlFor={htmlFor}
          className={cn(
            'block w-full text-stone-700',
            compact ? 'text-xs font-medium' : 'text-sm font-medium',
          )}
        >
          {label}
          {required ? <span className="ml-0.5 text-red-500">*</span> : null}
        </Label>
      ) : null}
      {children}
      {hint ? <p className="text-xs leading-relaxed text-stone-500">{hint}</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function FormSection({
  title,
  hint,
  children,
  className,
}: {
  title?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4 rounded-xl border border-stone-200 bg-white p-5', className)}>
      {title != null || hint != null ? (
        <header className="space-y-1 border-b border-stone-100 pb-3">
          {title != null ? <h3 className="text-sm font-semibold text-stone-900">{title}</h3> : null}
          {hint != null ? <p className="text-sm text-stone-500">{hint}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function SwitchRow({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-sm text-stone-700">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span className="leading-snug">{label}</span>
    </div>
  );
}

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
  musicEnabled: true,
  musicUrl: '',
  effectConfetti: true,
  effectPetals: true,
  effectEnvelope: true,
  colorMode: 'light',
  autoScroll: false,
  autoScrollSpeed: 'normal',
};

const STEPS = [
  { id: 0, key: 'basic' },
  { id: 1, key: 'theme' },
  { id: 2, key: 'schema' },
  { id: 3, key: 'review' },
] as const;

const SCHEMA_FIELD_TYPES = ['TEXT', 'DATE', 'IMAGE', 'URL', 'TEXT_ARRAY', 'ARRAY'] as const;

function isAdminSchemaField(val: any): boolean {
  const type = String(val?.type || '');
  return type.length > 0 && type === type.toUpperCase();
}

function jsonSchemaFieldType(prop: any): string {
  const slot = String(prop?.slot || '');
  if (slot.startsWith('image.')) return 'IMAGE';
  if (prop?.format === 'date-time') return 'DATE';
  if (prop?.type === 'array') {
    return prop.items?.type === 'object' ? 'ARRAY' : 'TEXT_ARRAY';
  }
  return 'TEXT';
}

function itemSchemaFromJsonItems(items: any): Record<string, any> | undefined {
  const props = items?.properties;
  if (!props || typeof props !== 'object') return undefined;
  return Object.fromEntries(
    Object.entries(props as Record<string, any>).map(([key, prop]) => [
      key,
      { type: jsonSchemaFieldType(prop), labelVi: key, labelEn: key },
    ]),
  );
}

function variablesFromSchemaJson(raw: unknown): TemplateVariable[] {
  if (!raw || typeof raw !== 'object') return [];
  const root = raw as Record<string, any>;
  const source =
    root.data && typeof root.data === 'object'
      ? root.data
      : root.properties && typeof root.properties === 'object'
        ? root.properties
        : root;

  return Object.entries(source as Record<string, any>)
    .filter(([key]) => key !== 'theme' && !key.startsWith('$'))
    .map(([key, val]) => {
      if (!val || typeof val !== 'object' || Array.isArray(val)) {
        return { key, type: 'RAW', defaultValue: val, config: {} };
      }
      if (isAdminSchemaField(val)) {
        const enabled =
          typeof val.enabled === 'boolean'
            ? val.enabled
            : val.config?.display !== '0' && val.config?.display !== 'false';
        return {
          key,
          defaultValue: val.value !== undefined ? val.value : val.defaul,
          labelVi: val.labelVi,
          labelEn: val.labelEn,
          placeHolder: val.placeHolder,
          required: !!val.required,
          itemSchema: val.itemSchema,
          type: String(val.type),
          config: {
            ...(val.config || {}),
            display: enabled ? '1' : '0',
          },
        };
      }
      const type = jsonSchemaFieldType(val);
      return {
        key,
        type,
        labelVi: key,
        labelEn: key,
        defaultValue: type === 'ARRAY' || type === 'TEXT_ARRAY' ? [] : '',
        itemSchema: type === 'ARRAY' ? itemSchemaFromJsonItems(val.items) : undefined,
        config: {},
      };
    });
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const schema = (t: any) =>
  z.object({
    name: z.string().trim().min(2, t('validation.nameRequired')),
    slug: z
      .string()
      .trim()
      .min(2, t('validation.slugRequired'))
      .regex(SLUG_PATTERN, t('validation.slugInvalid')),
    type: z.string().trim().min(1, t('validation.typeRequired')),
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
  const musicInputRef = useRef<HTMLInputElement>(null);

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
  const [effectCatalog, setEffectCatalog] = useState<InviteEffect[] | null>(null);
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [templateData, setTemplateData] = useState<Record<string, any>>({});
  const [configOpenKey, setConfigOpenKey] = useState<string | null>(null);
  const [showAddSchema, setShowAddSchema] = useState(false);
  const [schemaDraft, setSchemaDraft] = useState({ key: '', labelVi: '', type: 'TEXT' });

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

  useEffect(() => {
    let cancelled = false;
    getActiveInviteEffects()
      .then((list) => {
        if (cancelled) return;
        setEffectCatalog(list);
        if (!id && list.length) {
          setTheme((prev) => {
            const next = { ...prev };
            list.forEach((effect) => {
              next[effect.themeKey] = effect.defaultEnabled;
            });
            return next;
          });
        }
      })
      .catch(() => {
        if (!cancelled) setEffectCatalog([]);
      });
    return () => {
      cancelled = true;
    };
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

  const failValidation = (errors: Record<string, string>, toastKey = 'validation.validationError') => {
    setFormErrors(errors);
    toast.error(t(toastKey as any));
    return false;
  };

  const validateBasic = async () => {
    const parsed = await schema(t).safeParseAsync({
      name: formData.name,
      slug: formData.slug,
      type: formData.type,
    });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      });
      return failValidation(errors);
    }
    setFormErrors({});
    return true;
  };

  const validateTheme = () => {
    const errors: Record<string, string> = {};
    if (!String(theme.accent || '').trim()) {
      errors.accent = t('validation.accentRequired');
    }
    if (Object.keys(errors).length) return failValidation(errors);
    setFormErrors({});
    return true;
  };

  const isEmptySample = (value: unknown) => {
    if (value == null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value as object).length === 0;
    return String(value).trim() === '';
  };

  const validateSchema = () => {
    if (!variables.length) {
      return failValidation({}, 'validation.schemaRequired');
    }
    const missingRequired = variables.some((variable) => {
      if (!variable.required) return false;
      if (variable.config?.display === '0' || variable.config?.display === 'false') return false;
      return isEmptySample(variable.defaultValue);
    });
    if (missingRequired) {
      return failValidation({}, 'validation.requiredFieldsEmpty');
    }
    setFormErrors({});
    return true;
  };

  const validateStep = async (stepIndex: number) => {
    if (stepIndex === 0) return validateBasic();
    if (stepIndex === 1) return validateTheme();
    if (stepIndex === 2) return validateSchema();
    return true;
  };

  const goToStep = async (target: number) => {
    const next = Math.max(0, Math.min(target, STEPS.length - 1));
    if (next === step) return;
    if (next < step) {
      setStep(next);
      return;
    }
    for (let i = step; i < next; i += 1) {
      const ok = await validateStep(i);
      if (!ok) {
        setStep(i);
        return;
      }
    }
    setFormErrors({});
    setStep(next);
  };

  const goNext = async () => {
    await goToStep(step + 1);
  };

  const goPrev = () => {
    void goToStep(step - 1);
  };

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

  const previewData = useMemo(() => buildDataPayload(), [theme, variables, templateData]);

  const handleSubmit = async () => {
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      const ok = await validateStep(i);
      if (!ok) {
        setStep(i);
        return;
      }
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
    if (!file) return;
    try {
      setLoading(true);
      if (id) {
        await importSchema(id, file);
        toast.success(t('importSchemaSuccess'));
        await loadTemplate(id);
        setStep(2);
        return;
      }
      const parsed = JSON.parse(await file.text());
      const next = variablesFromSchemaJson(parsed);
      if (!next.length) {
        toast.error(t('importSchemaError'));
        return;
      }
      const themeSource = parsed?.data?.theme ?? parsed?.theme;
      if (themeSource) setTheme(parseThemeBlob(themeSource));
      setTemplateData((prev) => ({ ...prev, ...(parsed?.data || {}) }));
      setVariables(next);
      setShowAddSchema(false);
      toast.success(t('importSchemaSuccess'));
    } catch {
      toast.error(t('importSchemaError'));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSchemaField = () => {
    const key = schemaDraft.key.trim();
    if (!key) {
      toast.error(t('schemaKeyRequired'));
      return;
    }
    if (variables.some((variable) => variable.key === key)) {
      toast.error(t('schemaKeyDuplicate'));
      return;
    }
    const type = schemaDraft.type || 'TEXT';
    const itemSchema =
      type === 'ARRAY'
        ? key === 'album'
          ? { url: { type: 'IMAGE', labelVi: 'Ảnh', labelEn: 'Photo', placeHolder: 'https://...' } }
          : {}
        : undefined;
    setVariables((prev) => [
      ...prev,
      {
        key,
        type,
        labelVi: schemaDraft.labelVi.trim() || key,
        labelEn: schemaDraft.labelVi.trim() || key,
        defaultValue: type === 'ARRAY' || type === 'TEXT_ARRAY' ? [] : '',
        itemSchema,
        required: false,
        config: {},
      },
    ]);
    setSchemaDraft({ key: '', labelVi: '', type: 'TEXT' });
    setShowAddSchema(false);
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
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
                  onClick={() => void goToStep(index)}
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
          <div className="mx-auto grid gap-6">
            <p className="text-sm text-stone-500">{t('steps.basicHint')}</p>

            <FormSection title={t('steps.basic')}>
              <div className="grid gap-5">
                <FormField label={t('name')} htmlFor="template-name" error={formErrors.name} required>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.name;
                        return next;
                      });
                    }}
                    placeholder={t('namePlaceholder')}
                  />
                </FormField>

                <FormField
                  label={t('slug')}
                  htmlFor="template-slug"
                  hint={t('slugHint')}
                  error={formErrors.slug}
                  required
                >
                  <Input
                    id="template-slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value });
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.slug;
                        return next;
                      });
                    }}
                    placeholder="wedding-basic"
                  />
                </FormField>

                <FormField label={t('description')} htmlFor="template-description">
                  <Textarea
                    id="template-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    className="min-h-24"
                  />
                </FormField>

                {id ? (
                  <FormField label={t('status')}>
                    <div>
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
                  </FormField>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField label={t('type')} error={formErrors.type} required>
                    <Select
                      options={typeOptions}
                      value={formData.type}
                      onChange={(value) => {
                        setFormData({ ...formData, type: Array.isArray(value) ? value[0] : value });
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.type;
                          return next;
                        });
                      }}
                    />
                  </FormField>
                  <FormField label={t('thumbnail')}>
                    <ImageUpload
                      value={formData.thumbnailUrl}
                      onChange={(file) => setSelectedFile(Array.isArray(file) ? file[0] : file)}
                    />
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {canPublish ? (
                    <SwitchRow
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                      label={t('published')}
                    />
                  ) : null}
                  <SwitchRow
                    checked={formData.isPremium}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                    label={t('premium')}
                  />
                </div>
              </div>
            </FormSection>
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

            <FormSection title={t('steps.theme')}>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-stone-700">{t('theme.materialPresets')}</p>
                  <p className="text-xs text-stone-500">{t('theme.materialPresetsHint')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                  {MATERIAL_THEME_PRESETS.map((preset) => {
                    const active = matchMaterialPresetId(theme) === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        title={t(`theme.presets.${preset.labelKey}` as any)}
                        onClick={() => {
                          setTheme((prev) => ({ ...prev, ...preset.colors }));
                          setFormErrors((prev) => {
                            const next = { ...prev };
                            delete next.accent;
                            return next;
                          });
                        }}
                        className={cn(
                          'flex flex-col items-stretch gap-2 rounded-lg border px-2.5 py-2.5 text-left transition-colors',
                          active
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50',
                        )}
                      >
                        <span className="flex items-center gap-1.5" aria-hidden="true">
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border border-black/10 shadow-sm"
                            style={{ background: preset.colors.accent }}
                          />
                          <span
                            className="h-5 flex-1 rounded-sm border border-black/5"
                            style={{
                              background: `linear-gradient(90deg, ${preset.colors.bg}, ${preset.colors.accentSoft}, ${preset.colors.ink})`,
                            }}
                          />
                        </span>
                        <span className="truncate text-[11px] font-medium leading-tight">
                          {t(`theme.presets.${preset.labelKey}` as any)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  <FormField
                    key={key}
                    label={label}
                    error={key === 'accent' ? formErrors.accent : undefined}
                    required={key === 'accent'}
                  >
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-10 w-14 shrink-0 cursor-pointer p-1"
                        value={theme[key] || '#000000'}
                        onChange={(e) => {
                          setTheme({ ...theme, [key]: e.target.value });
                          if (key === 'accent') {
                            setFormErrors((prev) => {
                              const next = { ...prev };
                              delete next.accent;
                              return next;
                            });
                          }
                        }}
                      />
                      <Input
                        value={theme[key] || ''}
                        onChange={(e) => {
                          setTheme({ ...theme, [key]: e.target.value });
                          if (key === 'accent') {
                            setFormErrors((prev) => {
                              const next = { ...prev };
                              delete next.accent;
                              return next;
                            });
                          }
                        }}
                        placeholder="#ef4065"
                      />
                    </div>
                  </FormField>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {(
                  [
                    ['fontDisplay', t('theme.fontDisplay')],
                    ['fontScript', t('theme.fontScript')],
                    ['fontBody', t('theme.fontBody')],
                    ['fontSans', t('theme.fontSans')],
                  ] as const
                ).map(([key, label]) => (
                  <FormField key={key} label={label}>
                    <Input
                      value={theme[key] || ''}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      placeholder='"Gloock", serif'
                    />
                  </FormField>
                ))}
              </div>
            </FormSection>

            {(!effectCatalog?.length || effectCatalog.some((effect) => effect.slug === 'music')) && (
              <FormSection
                title={
                  effectCatalog?.find((effect) => effect.slug === 'music')?.name || t('theme.musicTitle')
                }
                hint={t('theme.musicHint')}
              >
                <SwitchRow
                  checked={theme.musicEnabled !== false}
                  onCheckedChange={(checked) => setTheme({ ...theme, musicEnabled: checked })}
                  label={t('theme.musicEnabled')}
                />
                <FormField label={t('theme.musicUpload')}>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={musicInputRef}
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/aac,audio/ogg,.mp3,.wav,.m4a,.aac,.ogg"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        try {
                          toast.info(t('theme.musicUpload'), { id: 'upload-music' });
                          const uploaded = await uploadFile(file);
                          const url = uploaded.url || uploaded.publicRelativePath || '';
                          setTheme((prev) => ({ ...prev, musicUrl: url, musicEnabled: true }));
                          toast.success(t('theme.musicTitle'), { id: 'upload-music' });
                        } catch {
                          toast.error(t('theme.musicUpload'), { id: 'upload-music' });
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => musicInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      {t('theme.musicUpload')}
                    </Button>
                    {theme.musicUrl ? (
                      <Button type="button" variant="ghost" onClick={() => setTheme({ ...theme, musicUrl: '' })}>
                        {t('theme.musicClear')}
                      </Button>
                    ) : null}
                  </div>
                </FormField>
                <FormField label="URL">
                  <Input
                    value={theme.musicUrl || ''}
                    placeholder="https://.../song.mp3"
                    onChange={(e) => setTheme({ ...theme, musicUrl: e.target.value })}
                  />
                </FormField>
                {theme.musicUrl ? <audio className="w-full" controls src={mergeImageUrl(theme.musicUrl)} /> : null}
              </FormSection>
            )}

            <FormSection title={t('theme.effectsTitle')}>
              <div className="grid gap-3 sm:grid-cols-2">
                {(effectCatalog && effectCatalog.length
                  ? effectCatalog.filter(
                      (effect) =>
                        effect.kind === 'burst' || effect.kind === 'ambient' || effect.kind === 'gate',
                    )
                  : [
                      {
                        slug: 'confetti',
                        themeKey: 'effectConfetti',
                        name: t('theme.effectConfetti'),
                        defaultEnabled: true,
                      },
                      {
                        slug: 'petals',
                        themeKey: 'effectPetals',
                        name: t('theme.effectPetals'),
                        defaultEnabled: true,
                      },
                      {
                        slug: 'envelope',
                        themeKey: 'effectEnvelope',
                        name: t('theme.effectEnvelope'),
                        defaultEnabled: true,
                      },
                    ]
                ).map((effect) => (
                  <SwitchRow
                    key={effect.slug}
                    checked={
                      effect.defaultEnabled
                        ? theme[effect.themeKey] !== false
                        : theme[effect.themeKey] === true
                    }
                    onCheckedChange={(checked) => setTheme({ ...theme, [effect.themeKey]: checked })}
                    label={effect.name}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection title={t('theme.colorModeTitle')} hint={t('theme.colorModeHint')}>
              <Select
                options={[
                  { value: 'light', label: t('theme.colorLight') },
                  { value: 'dark', label: t('theme.colorDark') },
                  { value: 'system', label: t('theme.colorSystem') },
                ]}
                value={theme.colorMode || 'light'}
                onChange={(value) =>
                  setTheme({
                    ...theme,
                    colorMode: (Array.isArray(value) ? value[0] : value) as TemplateTheme['colorMode'],
                  })
                }
              />
            </FormSection>

            {(!effectCatalog?.length || effectCatalog.some((effect) => effect.slug === 'auto-scroll')) && (
              <FormSection
                title={
                  effectCatalog?.find((effect) => effect.slug === 'auto-scroll')?.name ||
                  t('theme.autoScrollTitle')
                }
                hint={t('theme.autoScrollHint')}
              >
                <SwitchRow
                  checked={theme.autoScroll === true}
                  onCheckedChange={(checked) => setTheme({ ...theme, autoScroll: checked })}
                  label={t('theme.autoScrollEnabled')}
                />
                {theme.autoScroll ? (
                  <FormField label={t('theme.autoScrollSpeed')} className="max-w-xs">
                    <Select
                      options={[
                        { value: 'slow', label: t('theme.speedSlow') },
                        { value: 'normal', label: t('theme.speedNormal') },
                        { value: 'fast', label: t('theme.speedFast') },
                      ]}
                      value={theme.autoScrollSpeed || 'normal'}
                      onChange={(value) =>
                        setTheme({
                          ...theme,
                          autoScrollSpeed: (Array.isArray(value) ? value[0] : value) as TemplateTheme['autoScrollSpeed'],
                        })
                      }
                    />
                  </FormField>
                ) : null}
              </FormSection>
            )}
          </div>
        )}

        {/* Step 3 — Schema / slots */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900">{t('variables')}</h3>
                <p className="text-sm text-stone-500">{t('steps.schemaHint')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => setShowAddSchema((open) => !open)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('addSchema')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importSchema')}
                </Button>
              </div>
            </div>

            {showAddSchema && (
              <FormSection title={t('addSchema')}>
                <div className="grid gap-5 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
                  <FormField label={t('schemaKey')} compact>
                    <Input
                      value={schemaDraft.key}
                      placeholder="album"
                      onChange={(e) => setSchemaDraft({ ...schemaDraft, key: e.target.value })}
                    />
                  </FormField>
                  <FormField label={t('schemaLabel')} compact>
                    <Input
                      value={schemaDraft.labelVi}
                      placeholder="Album ảnh"
                      onChange={(e) => setSchemaDraft({ ...schemaDraft, labelVi: e.target.value })}
                    />
                  </FormField>
                  <FormField label={t('schemaType')} compact>
                    <Select
                      options={SCHEMA_FIELD_TYPES.map((type) => ({ value: type, label: type }))}
                      value={schemaDraft.type}
                      onChange={(value) =>
                        setSchemaDraft({
                          ...schemaDraft,
                          type: Array.isArray(value) ? value[0] : value,
                        })
                      }
                    />
                  </FormField>
                  <Button type="button" onClick={addSchemaField}>
                    {t('addSchema')}
                  </Button>
                </div>
              </FormSection>
            )}

            <div className="max-h-[560px] space-y-4 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/80 p-4">
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
                  <div
                    key={`${variable.key}-${index}`}
                    className="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                      <div className="min-w-0 space-y-1">
                        <Label className="text-sm font-semibold text-stone-800">
                          {fieldLabel}
                          {variable.required ? <span className="ml-0.5 text-red-500">*</span> : null}
                        </Label>
                        <p className="truncate text-xs text-stone-400">
                          {variable.key}
                          {variable.id != null ? ` · #${variable.id}` : ''}
                          {variable.type ? ` · ${variable.type}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!variable.id && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-600"
                            onClick={() => setVariables((prev) => prev.filter((_, i) => i !== index))}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => setConfigOpenKey(configOpen ? null : variable.key)}
                        >
                          {t('fieldConfig')}
                        </Button>
                      </div>
                    </div>

                    {configOpen && (
                      <div className="grid gap-4 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        <FormField label={`${t('theme.accent')} (color)`} compact>
                          <Input
                            value={variable.config?.color || ''}
                            placeholder="#ef4065"
                            onChange={(e) => updateVariableConfig(index, { color: e.target.value })}
                          />
                        </FormField>
                        <FormField label={`${t('theme.fontDisplay')} (font)`} compact>
                          <Input
                            value={variable.config?.font || ''}
                            placeholder='"Gloock", serif'
                            onChange={(e) => updateVariableConfig(index, { font: e.target.value })}
                          />
                        </FormField>
                        <FormField label="Size" compact>
                          <Input
                            value={variable.config?.size || ''}
                            placeholder="24"
                            onChange={(e) => updateVariableConfig(index, { size: e.target.value })}
                          />
                        </FormField>
                        <FormField label="Display" compact>
                          <Select
                            options={[
                              { value: '1', label: t('visible') },
                              { value: '0', label: t('hidden') },
                            ]}
                            value={
                              variable.config?.display === '0' || variable.config?.display === 'false'
                                ? '0'
                                : '1'
                            }
                            onChange={(value) =>
                              updateVariableConfig(index, {
                                display: Array.isArray(value) ? value[0] : value,
                              })
                            }
                          />
                        </FormField>
                      </div>
                    )}

                    <div className="space-y-2">
                      {isArray ? (
                        <div className="space-y-3 rounded-lg border border-stone-200 p-3">
                          {(Array.isArray(variable.defaultValue) ? variable.defaultValue : []).map(
                            (item: any, itemIdx: number) => (
                              <div key={itemIdx} className="relative rounded-lg border bg-stone-50 p-4 pr-10">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newArr = [
                                      ...(Array.isArray(variable.defaultValue) ? variable.defaultValue : []),
                                    ];
                                    newArr.splice(itemIdx, 1);
                                    updateVariable(index, { defaultValue: newArr });
                                  }}
                                  className="absolute right-3 top-3 text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {Object.entries(variable.itemSchema || {}).map(
                                    ([subKey, subField]: [string, any]) => (
                                      <FormField
                                        key={subKey}
                                        label={subField.labelVi || subKey}
                                        compact
                                      >
                                        {subField.type?.toLowerCase() === 'image' ? (
                                          <ImageUpload
                                            value={item[subKey] || ''}
                                            onChange={(file) => {
                                              handleDynamicImageUpload(
                                                Array.isArray(file) ? file[0] : file,
                                                (url) => {
                                                  const newArr = [
                                                    ...(Array.isArray(variable.defaultValue)
                                                      ? variable.defaultValue
                                                      : []),
                                                  ];
                                                  newArr[itemIdx] = {
                                                    ...newArr[itemIdx],
                                                    [subKey]: url,
                                                  };
                                                  updateVariable(index, { defaultValue: newArr });
                                                },
                                              );
                                            }}
                                          />
                                        ) : (
                                          <Input
                                            className="h-9 text-sm"
                                            value={item[subKey] || ''}
                                            placeholder={subField.placeHolder || ''}
                                            onChange={(e) => {
                                              const newArr = [
                                                ...(Array.isArray(variable.defaultValue)
                                                  ? variable.defaultValue
                                                  : []),
                                              ];
                                              newArr[itemIdx] = {
                                                ...newArr[itemIdx],
                                                [subKey]: e.target.value,
                                              };
                                              updateVariable(index, { defaultValue: newArr });
                                            }}
                                          />
                                        )}
                                      </FormField>
                                    ),
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                          <button
                            type="button"
                            className="text-sm font-medium text-stone-700 hover:text-stone-900"
                            onClick={() => {
                              const newArr = [
                                ...(Array.isArray(variable.defaultValue) ? variable.defaultValue : []),
                              ];
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
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                        <ImageUpload
                          value={String(displayVal || '')}
                          onChange={(file) => {
                            handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                              updateVariable(index, { defaultValue: url });
                            });
                          }}
                        />
                      ) : (
                        <Input
                          type={variable.type?.toLowerCase() === 'date' ? 'datetime-local' : 'text'}
                          value={String(displayVal ?? '')}
                          placeholder={variable.placeHolder || ''}
                          onChange={(e) => updateVariable(index, { defaultValue: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              {variables.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-stone-500">{t('emptySchema')}</p>
                  <Button type="button" onClick={() => setShowAddSchema(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addSchema')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 3 && (
          <div className="mx-auto grid max-w-3xl gap-5">
            <p className="text-sm text-stone-500">{t('steps.reviewHint')}</p>
            <FormSection title={t('steps.review')}>
              <dl className="divide-y divide-stone-100 rounded-lg border border-stone-200">
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('name')}</dt>
                  <dd className="sm:col-span-2 text-sm font-medium text-stone-900">{formData.name || '—'}</dd>
                </div>
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('slug')}</dt>
                  <dd className="sm:col-span-2 font-mono text-sm text-stone-900">{formData.slug || '—'}</dd>
                </div>
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('type')}</dt>
                  <dd className="sm:col-span-2 text-sm text-stone-900">
                    {typeOptions.find((o) => o.value === formData.type)?.label || formData.type}
                  </dd>
                </div>
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('steps.theme')}</dt>
                  <dd className="sm:col-span-2 flex items-center gap-2 text-sm text-stone-900">
                    <span
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{ background: theme.accent }}
                    />
                    {theme.accent} · {theme.fontDisplay}
                  </dd>
                </div>
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('variables')}</dt>
                  <dd className="sm:col-span-2 text-sm text-stone-900">
                    {t('fieldCount', { count: variables.length })}
                  </dd>
                </div>
                <div className="grid gap-1 px-4 py-3.5 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm text-stone-500">{t('premium')}</dt>
                  <dd className="sm:col-span-2 text-sm text-stone-900">{formData.isPremium ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </FormSection>
          </div>
        )}

        {/* Nav — Save only on last step; header already has Save / Submit review anytime */}
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
            <div className="flex flex-wrap items-center gap-2">
              {canSubmitReview ? (
                <Button type="button" variant="outline" onClick={handleSubmitReview}>
                  <Send className="mr-2 h-4 w-4" />
                  {t('submitReview')}
                </Button>
              ) : null}
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {tUtils('save')}
              </Button>
            </div>
          )}
        </div>
      </ComponentCard>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <LivePreviewPanel
              templateId={formData.slug.trim() || 'wedding-basic'}
              title={formData.name || 'Live preview'}
              slug={formData.slug.trim() || 'preview'}
              data={previewData}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
