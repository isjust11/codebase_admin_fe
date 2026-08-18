'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createTemplate, getTemplate, previewTemplate, submitTemplate, updateTemplate } from '@/services/template-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Plus, Save, Trash, X, Send } from 'lucide-react';
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
import PhoneFrame from '@/components/eventlab/PhoneFrame';
import { Badge } from '@/components/ui/badge';

const DEFAULT_HTML = `<div class="card">
  <h1>{{eventTitle}}</h1>
  <p class="names">{{brideName}} &amp; {{groomName}}</p>
  <p>{{eventDate}}</p>
  <p>{{venue}}</p>
  <p class="guest">Kính mời {{guestName}}</p>
  <p>{{personalMessage}}</p>
</div>`;

const DEFAULT_CSS = `.card { max-width: 420px; margin: 24px auto; padding: 32px; text-align: center; background: #fff8f0; border: 1px solid #e8d5c4; font-family: "Times New Roman", serif; }
.names { font-size: 22px; margin: 12px 0; }
.guest { margin-top: 24px; font-weight: 600; }`;

const DEFAULT_VARS: TemplateVariable[] = [
  { key: 'brideName', label: 'Tên cô dâu', type: 'text', scope: 'event', required: true },
  { key: 'groomName', label: 'Tên chú rể', type: 'text', scope: 'event', required: true },
  { key: 'eventDate', label: 'Ngày sự kiện', type: 'date', scope: 'event', required: true },
  { key: 'venue', label: 'Địa điểm', type: 'text', scope: 'event' },
  { key: 'guestName', label: 'Tên khách', type: 'text', scope: 'guest', required: true },
  { key: 'tableNumber', label: 'Số bàn', type: 'text', scope: 'guest' },
  { key: 'personalMessage', label: 'Lời nhắn', type: 'text', scope: 'guest' },
];

const schema = (t: any) =>
  z.object({
    name: z.string().min(2, t('validation.nameRequired')),
    htmlContent: z.string().min(3, t('validation.htmlRequired')),
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
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('DRAFT');
  const [formData, setFormData] = useState({
    name: '',
    type: 'WEDDING',
    thumbnailUrl: '',
    description: '',
    htmlContent: DEFAULT_HTML,
    cssContent: DEFAULT_CSS,
    isPublished: false,
    isPremium: false,
  });
  const [variables, setVariables] = useState<TemplateVariable[]>(DEFAULT_VARS);

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
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    try {
      const data = await getTemplate(templateId);
      setFormData({
        name: data.name,
        type: data.type || 'EVENT',
        thumbnailUrl: data.thumbnailUrl || '',
        description: data.description || '',
        htmlContent: data.htmlContent,
        cssContent: data.cssContent || '',
        isPublished: !!data.isPublished,
        isPremium: !!data.isPremium,
      });
      setStatus(data.status || (data.isPublished ? 'PUBLISHED' : 'DRAFT'));
      setVariables(data.variablesSchema?.length ? data.variablesSchema : DEFAULT_VARS);
      try {
        const result = await previewTemplate(templateId);
        setPreviewHtml(result.html);
      } catch (_previewError) {
        setPreviewHtml('');
      }
    } catch (_error) {
      toast.error(t('messages.loadError'));
    }
  };

  const listDestination = () => (canPublish ? AppRoutes.Manager.Templates : AppRoutes.Manager.TemplatesMine);

  const insertVariable = (key: string) => {
    setFormData((prev) => ({ ...prev, htmlContent: `${prev.htmlContent}{{${key}}}` }));
  };

  const handlePreview = async () => {
    if (!id) {
      toast.error(t('messages.saveBeforePreview'));
      return;
    }
    try {
      const result = await previewTemplate(id);
      setPreviewHtml(result.html);
    } catch (_error) {
      toast.error(t('messages.previewError'));
    }
  };

  const handleSubmit = async () => {
    const parsed = await schema(t).safeParseAsync({ name: formData.name, htmlContent: formData.htmlContent });
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
      const payload = {
        name: formData.name,
        type: formData.type,
        thumbnailUrl,
        description: formData.description,
        htmlContent: formData.htmlContent,
        cssContent: formData.cssContent,
        variablesSchema: variables.filter((v) => v.key.trim()),
        isPremium: formData.isPremium,
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
    {
      icon: <X className="w-4 h-4 mr-2" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      variant: 'outline',
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={id ? t('updateTemplate') : t('addTemplate')} />
      <ComponentCard title={id ? t('updateTemplate') : t('addTemplate')} listAction={actions}>
        <div className="grid gap-6 lg:grid-cols-2">
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t('variables')}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setVariables([...variables, { key: '', label: '', type: 'text', scope: 'event', required: false }])
                  }
                >
                  <Plus className="w-4 h-4 mr-1" /> {t('addVariable')}
                </Button>
              </div>
              <div className="space-y-2">
                {variables.map((variable, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <Input
                      className="col-span-3"
                      placeholder="key"
                      value={variable.key}
                      onChange={(e) => {
                        const next = [...variables];
                        next[index] = { ...variable, key: e.target.value };
                        setVariables(next);
                      }}
                    />
                    <Input
                      className="col-span-3"
                      placeholder={t('label')}
                      value={variable.label || ''}
                      onChange={(e) => {
                        const next = [...variables];
                        next[index] = { ...variable, label: e.target.value };
                        setVariables(next);
                      }}
                    />
                    <select
                      className="col-span-2 border rounded-md h-9 px-2 text-sm"
                      value={variable.scope || 'event'}
                      onChange={(e) => {
                        const next = [...variables];
                        next[index] = { ...variable, scope: e.target.value as TemplateVariable['scope'] };
                        setVariables(next);
                      }}
                    >
                      <option value="event">event</option>
                      <option value="guest">guest</option>
                    </select>
                    <Button type="button" variant="ghost" size="sm" className="col-span-2" onClick={() => insertVariable(variable.key)}>
                      {`{{${variable.key || 'key'}}}`}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="col-span-2 text-red-500"
                      onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>{t('htmlContent')}</Label>
              <Textarea
                className="min-h-48 font-mono text-sm"
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
              />
              {formErrors.htmlContent && <p className="text-sm text-red-500">{formErrors.htmlContent}</p>}
            </div>
            <div>
              <Label>{t('cssContent')}</Label>
              <Textarea
                className="min-h-32 font-mono text-sm"
                value={formData.cssContent}
                onChange={(e) => setFormData({ ...formData, cssContent: e.target.value })}
              />
            </div>
            <Button type="button" variant="outline" onClick={handlePreview}>
              {t('preview')}
            </Button>
            <PhoneFrame html={previewHtml} title={formData.name || 'preview'} />
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
