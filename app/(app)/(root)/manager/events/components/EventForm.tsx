'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createEvent, getEvent, updateEvent, EventDto } from '@/services/event-api';
import { reactInviteUrl } from '@/services/event-guest-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  Save,
  Share2,
  Users,
  X,
} from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppRoutes } from '@/constants';
import Select, { SelectOption } from '@/components/form/Select';
import { getTemplates } from '@/services/template-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, mergeImageUrl } from '@/lib/utils';
import LivePreviewPanel from '@/components/eventlab/LivePreviewPanel';
import Image from 'next/image';
import slugify from 'slugify';

const STEPS = [
  { id: 0, key: 'basic' },
  { id: 1, key: 'template' },
  { id: 2, key: 'content' },
  { id: 3, key: 'review' },
] as const;

type TemplateItem = {
  id: string | number;
  name: string;
  slug?: string;
  thumbnailUrl?: string;
  description?: string;
  type?: string;
  data?: Record<string, any> | any[];
};

function getFieldEntries(data: TemplateItem['data']): Array<[string, any]> {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((d: any) => [
      d.fieldKey,
      {
        type: d.fieldType || d.type,
        labelVi: d.labelVi,
        labelEn: d.labelEn,
        placeHolder: d.placeHolder,
        required: d.required,
        itemSchema: d.itemSchema,
        value: d.value ?? d.defaul,
        config: d.config,
      },
    ]);
  }
  return Object.entries(data).filter(([key]) => key !== 'theme');
}

function fieldValue(schemaField: any, eventVal: any) {
  if (eventVal !== undefined && eventVal !== null) {
    if (typeof eventVal === 'object' && !Array.isArray(eventVal) && ('value' in eventVal || 'defaul' in eventVal)) {
      return eventVal.value ?? eventVal.defaul;
    }
    return eventVal;
  }
  return schemaField?.value ?? schemaField?.defaul ?? '';
}

/** Flatten eventData for Host live preview (ConfigurableField shape). */
function toPreviewData(
  eventData: Record<string, any> | undefined,
  templateData: TemplateItem['data'],
  coverImageUrl?: string,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...(eventData || {}) };
  if (coverImageUrl) out.coverImage = coverImageUrl;

  for (const [key, schemaField] of getFieldEntries(templateData)) {
    const raw = eventData?.[key];
    const val = fieldValue(schemaField, raw);
    if (schemaField && typeof schemaField === 'object' && schemaField.type) {
      out[key] = {
        type: schemaField.type,
        labelVi: schemaField.labelVi,
        labelEn: schemaField.labelEn,
        value: val,
        config: schemaField.config || {},
      };
    } else {
      out[key] = val;
    }
  }

  if (eventData?.theme) out.theme = eventData.theme;
  return out;
}

export default function EventForm() {
  const t = useTranslations('EventPage');
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const id = params.id?.toString();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [allTemplates, setAllTemplates] = useState<TemplateItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EventDto>({
    title: '',
    slug: '',
    type: 'WEDDING',
    templateId: '',
    eventDate: '',
    venue: '',
    coverImageUrl: '',
    status: 'DRAFT',
    eventData: {},
  });

  const typeOptions: SelectOption[] = [
    { value: 'WEDDING', label: t('types.WEDDING') },
    { value: 'EVENT', label: t('types.EVENT') },
    { value: 'BIRTHDAY', label: t('types.BIRTHDAY') },
    { value: 'OTHER', label: t('types.OTHER') },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'DRAFT', label: t('statuses.DRAFT') },
    { value: 'PUBLISHED', label: t('statuses.PUBLISHED') },
    { value: 'CANCELLED', label: t('statuses.CANCELLED') },
    { value: 'COMPLETED', label: t('statuses.COMPLETED') },
  ];

  const stepLabels = [t('steps.basic'), t('steps.template'), t('steps.content'), t('steps.review')];

  useEffect(() => {
    getTemplates({ size: 100 })
      .then((res) => {
        const items = (res.data || []) as TemplateItem[];
        setAllTemplates(items);
      })
      .catch(console.error);

    if (id) loadEvent(id);
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      const data = await getEvent(eventId);
      setFormData({
        title: data.title,
        slug: data.slug || '',
        type: data.type || 'EVENT',
        templateId: data.templateId?.id || data.templateId || data.template?.id || '',
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : '',
        venue: data.venue || '',
        coverImageUrl: data.coverImageUrl || '',
        status: data.status || 'DRAFT',
        eventData: data.eventData || {},
      });
    } catch {
      toast.error(t('messages.loadError'));
    }
  };

  const selectedTemplate = allTemplates.find((tpl) => String(tpl.id) === String(formData.templateId));

  const previewData = useMemo(
    () =>
      toPreviewData(
        formData.eventData,
        selectedTemplate?.data,
        formData.coverImageUrl || undefined,
      ),
    [formData.eventData, formData.coverImageUrl, selectedTemplate],
  );

  const inviteUrl = reactInviteUrl(formData.slug);

  const handleDynamicImageUpload = async (file: File | null, onUploadSuccess: (url: string) => void) => {
    if (!file) {
      onUploadSuccess('');
      return;
    }
    try {
      toast.info(t('messages.uploading'), { id: 'upload-image' });
      const uploaded = await uploadFile(file);
      const url = uploaded.url || uploaded.publicRelativePath || '';
      onUploadSuccess(url);
      toast.success(t('messages.uploadSuccess'), { id: 'upload-image' });
    } catch {
      toast.error(t('messages.uploadError'), { id: 'upload-image' });
    }
  };

  const ensureSlug = () => {
    if (!formData.slug?.trim() && formData.title) {
      const next = slugify(formData.title, { lower: true, strict: true });
      setFormData((prev) => ({ ...prev, slug: next }));
      return next;
    }
    return formData.slug?.trim() || '';
  };

  const validateBasic = () => {
    const errors: Record<string, string> = {};
    if (!formData.title?.trim()) errors.title = t('validation.titleRequired');
    const slug = formData.slug?.trim() || slugify(formData.title || '', { lower: true, strict: true });
    if (!slug) errors.slug = t('validation.slugRequired');
    setFormErrors(errors);
    if (Object.keys(errors).length) {
      toast.error(t('validation.validationError'));
      return false;
    }
    if (!formData.slug?.trim() && slug) {
      setFormData((prev) => ({ ...prev, slug }));
    }
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateBasic()) return;
    if (step === 1 && !formData.templateId) {
      toast.error(t('validation.templateRequired'));
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const applyTemplate = (templateId: string) => {
    const template = allTemplates.find((tpl) => String(tpl.id) === templateId);
    const initialData = { ...(formData.eventData || {}) };

    getFieldEntries(template?.data).forEach(([fieldKey, d]) => {
      if (initialData[fieldKey] === undefined && d?.value !== undefined && d?.value !== null) {
        let val = d.value;
        if (d.type === 'json' || d.type === 'textarea' || d.type === 'RAW') {
          if (typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {
              /* keep */
            }
          }
        }
        initialData[fieldKey] = val;
      }
    });

    if (template?.data && typeof template.data === 'object' && !Array.isArray(template.data) && (template.data as any).theme) {
      initialData.theme = (template.data as any).theme;
    }

    setFormData({
      ...formData,
      templateId,
      type: (template?.type as EventDto['type']) || formData.type,
      eventData: initialData,
    });
  };

  const setEventField = (fieldKey: string, value: unknown) => {
    setFormData({
      ...formData,
      eventData: { ...(formData.eventData || {}), [fieldKey]: value },
    });
  };

  const handleSubmit = async () => {
    if (!validateBasic()) {
      setStep(0);
      return;
    }
    if (!formData.templateId) {
      toast.error(t('validation.templateRequired'));
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      let coverImageUrl = formData.coverImageUrl;
      if (selectedFile) {
        const uploaded = await uploadFile(selectedFile);
        coverImageUrl = uploaded.url || uploaded.publicRelativePath || coverImageUrl;
      }

      const payload = {
        ...formData,
        slug: formData.slug?.trim() || ensureSlug(),
        coverImageUrl,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
      };

      if (id) {
        await updateEvent(id, payload);
        toast.success(t('messages.updateSuccess'));
      } else {
        await createEvent(payload);
        toast.success(t('messages.createSuccess'));
      }
      navigateTo(AppRoutes.Manager.Events);
    } catch {
      toast.error(id ? t('messages.updateError') : t('messages.createError'));
    } finally {
      setLoading(false);
    }
  };

  const actions: Action[] = [
    {
      icon: <Save className="mr-2 h-4 w-4" />,
      onClick: handleSubmit,
      title: tUtils('save'),
      isLoading: loading,
    },
    {
      icon: <X className="mr-2 h-4 w-4" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      variant: 'outline',
    },
  ];

  const fieldEntries = getFieldEntries(selectedTemplate?.data);

  return (
    <div>
      <PageBreadcrumb pageTitle={id ? t('updateEvent') : t('addEvent')} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ComponentCard title={id ? t('updateEvent') : t('addEvent')} listAction={actions}>
          {/* Steps */}
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

          {/* Step 1 — Basics */}
          {step === 0 && (
            <div className="grid max-w-3xl gap-5">
              <p className="text-sm text-stone-500">{t('steps.basicHint')}</p>
              <div>
                <Label>{t('title')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  onBlur={() => ensureSlug()}
                  placeholder={t('titlePlaceholder')}
                />
                {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('slug')}</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="minh-anh-hoang-nam"
                  />
                  <p className="mt-1 text-xs text-stone-500">{t('slugHint')}</p>
                  {formErrors.slug && <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>}
                </div>
                <div>
                  <Label>{t('eventDate')}</Label>
                  <Input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t('venue')}</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder={t('venuePlaceholder')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('type')}</Label>
                  <Select
                    options={typeOptions}
                    value={formData.type as string}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        type: (Array.isArray(value) ? value[0] : value) as EventDto['type'],
                      })
                    }
                  />
                </div>
                <div>
                  <Label>{t('status')}</Label>
                  <Select
                    options={statusOptions}
                    value={formData.status as string}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        status: (Array.isArray(value) ? value[0] : value) as EventDto['status'],
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>{t('cover')}</Label>
                <ImageUpload
                  value={formData.coverImageUrl}
                  onChange={(file) => setSelectedFile(Array.isArray(file) ? file[0] : file)}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Template */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-500">{t('steps.templateHint')}</p>
              {allTemplates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-sm text-stone-500">
                  {t('emptyTemplates')}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {allTemplates.map((tpl) => {
                    const active = String(tpl.id) === String(formData.templateId);
                    return (
                      <button
                        key={String(tpl.id)}
                        type="button"
                        onClick={() => applyTemplate(String(tpl.id))}
                        className={cn(
                          'overflow-hidden rounded-xl border text-left transition',
                          active
                            ? 'border-stone-900 ring-2 ring-stone-900/20'
                            : 'border-stone-200 hover:border-stone-400',
                        )}
                      >
                        <div className="relative aspect-[4/3] bg-stone-100">
                          {tpl.thumbnailUrl ? (
                            <Image
                              src={mergeImageUrl(tpl.thumbnailUrl)}
                              alt={tpl.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-stone-400">
                              <ImageOff className="h-8 w-8" />
                            </div>
                          )}
                          {active && (
                            <span className="absolute right-2 top-2 rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-medium text-white">
                              {t('selected')}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="font-medium text-stone-900">{tpl.name}</div>
                          <code className="text-[11px] text-stone-500">{tpl.slug || '—'}</code>
                          {tpl.description ? (
                            <p className="line-clamp-2 text-xs text-stone-500">{tpl.description}</p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Content slots */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-stone-500">{t('steps.contentHint')}</p>
              {!selectedTemplate ? (
                <p className="text-sm text-amber-700">{t('pickTemplateFirst')}</p>
              ) : fieldEntries.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                  {t('emptySlots')}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {fieldEntries.map(([fieldKey, schemaField]) => {
                    const isJson =
                      schemaField.type?.toLowerCase() === 'json' ||
                      schemaField.type?.toLowerCase() === 'textarea' ||
                      schemaField.type?.toLowerCase() === 'text_array' ||
                      schemaField.type?.toLowerCase() === 'raw';
                    const isArray = schemaField.type?.toLowerCase() === 'array';
                    const val = fieldValue(schemaField, formData.eventData?.[fieldKey]);
                    const fieldLabel =
                      schemaField.labelVi || schemaField.labelEn || schemaField.config?.display || fieldKey;

                    if (isArray) {
                      const arrayItems = Array.isArray(val) ? val : [];
                      return (
                        <div
                          key={fieldKey}
                          className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:col-span-2"
                        >
                          <Label className="text-base font-semibold text-stone-800">{fieldLabel}</Label>
                          {arrayItems.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="relative rounded-lg border bg-white p-4 shadow-sm">
                              <button
                                type="button"
                                className="absolute right-2 top-2 text-red-500"
                                onClick={() => {
                                  const next = [...arrayItems];
                                  next.splice(itemIdx, 1);
                                  setEventField(fieldKey, next);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {Object.entries(schemaField.itemSchema || {}).map(
                                  ([subKey, subField]: [string, any]) => (
                                    <div key={subKey}>
                                      <Label className="mb-1 block text-xs">
                                        {subField.labelVi || subField.labelEn || subKey}
                                      </Label>
                                      {subField.type?.toLowerCase() === 'image' ? (
                                        <ImageUpload
                                          value={item[subKey] || ''}
                                          onChange={(file) => {
                                            handleDynamicImageUpload(
                                              Array.isArray(file) ? file[0] : file,
                                              (url) => {
                                                const next = [...arrayItems];
                                                next[itemIdx] = { ...next[itemIdx], [subKey]: url };
                                                setEventField(fieldKey, next);
                                              },
                                            );
                                          }}
                                        />
                                      ) : (
                                        <Input
                                          className="h-9 text-sm"
                                          value={item[subKey] || ''}
                                          onChange={(e) => {
                                            const next = [...arrayItems];
                                            next[itemIdx] = {
                                              ...next[itemIdx],
                                              [subKey]: e.target.value,
                                            };
                                            setEventField(fieldKey, next);
                                          }}
                                        />
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="text-sm font-medium text-stone-700"
                            onClick={() => {
                              const empty: Record<string, any> = {};
                              Object.keys(schemaField.itemSchema || {}).forEach((k) => {
                                empty[k] = '';
                              });
                              setEventField(fieldKey, [...arrayItems, empty]);
                            }}
                          >
                            + {t('addItem')} {fieldLabel}
                          </button>
                        </div>
                      );
                    }

                    const displayVal =
                      isJson && typeof val === 'object' ? JSON.stringify(val, null, 2) : val ?? '';

                    return (
                      <div key={fieldKey} className={isJson ? 'sm:col-span-2' : ''}>
                        <Label className="flex items-center gap-1">
                          {fieldLabel}
                          {schemaField.required ? <span className="text-red-500">*</span> : null}
                        </Label>
                        {isJson ? (
                          <Textarea
                            className="mt-1 min-h-[120px]"
                            value={String(displayVal)}
                            placeholder={schemaField.placeHolder || ''}
                            onChange={(e) => {
                              let newVal: any = e.target.value;
                              try {
                                newVal = JSON.parse(e.target.value);
                              } catch {
                                /* keep string */
                              }
                              setEventField(fieldKey, newVal);
                            }}
                          />
                        ) : schemaField.type?.toLowerCase() === 'image' ? (
                          <div className="mt-1">
                            <ImageUpload
                              value={String(displayVal || '')}
                              onChange={(file) => {
                                handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                                  setEventField(fieldKey, url);
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <Input
                            className="mt-1"
                            type={
                              String(schemaField.type || '').toLowerCase() === 'date'
                                ? 'datetime-local'
                                : 'text'
                            }
                            value={String(displayVal ?? '')}
                            placeholder={schemaField.placeHolder || ''}
                            onChange={(e) => setEventField(fieldKey, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 3 && (
            <div className="grid max-w-3xl gap-4">
              <p className="text-sm text-stone-500">{t('steps.reviewHint')}</p>
              <div className="divide-y rounded-xl border border-stone-200">
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="text-sm text-stone-500">{t('title')}</span>
                  <span className="text-sm font-medium sm:col-span-2">{formData.title || '—'}</span>
                </div>
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="text-sm text-stone-500">{t('slug')}</span>
                  <span className="font-mono text-sm sm:col-span-2">{formData.slug || '—'}</span>
                </div>
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="flex items-center gap-1 text-sm text-stone-500">
                    <Calendar className="h-3.5 w-3.5" /> {t('eventDate')}
                  </span>
                  <span className="text-sm sm:col-span-2">
                    {formData.eventDate
                      ? new Date(formData.eventDate).toLocaleString()
                      : '—'}
                  </span>
                </div>
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="flex items-center gap-1 text-sm text-stone-500">
                    <MapPin className="h-3.5 w-3.5" /> {t('venue')}
                  </span>
                  <span className="text-sm sm:col-span-2">{formData.venue || '—'}</span>
                </div>
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="text-sm text-stone-500">{t('template')}</span>
                  <span className="text-sm sm:col-span-2">
                    {selectedTemplate?.name || '—'}{' '}
                    {selectedTemplate?.slug ? (
                      <code className="text-xs text-stone-500">({selectedTemplate.slug})</code>
                    ) : null}
                  </span>
                </div>
                <div className="grid gap-1 px-4 py-3 sm:grid-cols-3">
                  <span className="text-sm text-stone-500">{t('status')}</span>
                  <span className="sm:col-span-2">
                    <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {statusOptions.find((o) => o.value === formData.status)?.label || formData.status}
                    </Badge>
                  </span>
                </div>
              </div>

              {inviteUrl ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
                  <div className="mb-1 flex items-center gap-1.5 font-medium text-stone-800">
                    <Share2 className="h-4 w-4" /> {t('publicInvite')}
                  </div>
                  <a
                    href={inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-stone-600 underline"
                  >
                    {inviteUrl}
                  </a>
                </div>
              ) : null}

              {id ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigateTo(`${AppRoutes.Manager.Events}/${id}/guests`)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  {t('manageGuests')}
                </Button>
              ) : null}
            </div>
          )}

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

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <LivePreviewPanel
              templateId={selectedTemplate?.slug || 'wedding-basic'}
              title={formData.title || 'Event preview'}
              slug={formData.slug || 'preview'}
              data={previewData}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
