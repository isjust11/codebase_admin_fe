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

const DEFAULT_VARS: TemplateVariable[] = [
  { key: 'brideName', label: 'Tên cô dâu', type: 'text', scope: 'event', required: true },
  { key: 'groomName', label: 'Tên chú rể', type: 'text', scope: 'event', required: true },
  { key: 'eventDate', label: 'Ngày sự kiện', type: 'date', scope: 'event', required: true },
  { key: 'venue', label: 'Địa điểm', type: 'text', scope: 'event' },
  { key: 'guestName', label: 'Tên khách', type: 'text', scope: 'guest', required: true },
];

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
  
  const [variables, setVariables] = useState<TemplateVariable[]>(DEFAULT_VARS);

  const typeOptions: SelectOption[] = [
    { value: 'WEDDING', label: t('types.WEDDING') },
    { value: 'EVENT', label: t('types.EVENT') },
    { value: 'BIRTHDAY', label: t('types.BIRTHDAY') },
    { value: 'OTHER', label: t('types.OTHER') },
  ];

  useEffect(() => {
    if (id) loadTemplate(id);
  }, [id]);

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
      setVariables(data.variablesSchema?.length ? data.variablesSchema : DEFAULT_VARS);
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
      
      const payload = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        thumbnailUrl,
        description: formData.description,
        htmlContent: '', // Empty because we use React host now
        cssContent: '', // Empty because we use React host now
        variablesSchema: variables.filter((v) => v.key.trim()),
        isPremium: formData.isPremium,
        editorMode: 'code' as const,
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
              <Label>{t('variables')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVariables([...variables, { key: '', label: '', type: 'text', scope: 'event', required: false }])
                }
              >
                <Plus className="mr-1 h-4 w-4" /> {t('addVariable')}
              </Button>
            </div>
            
            <div className="space-y-2 border rounded-xl p-4 bg-gray-50">
              {variables.map((variable, index) => (
                <div key={`${variable.key}-${index}`} className="grid grid-cols-12 items-center gap-2">
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
                    className="col-span-4"
                    placeholder={t('label')}
                    value={variable.label || ''}
                    onChange={(e) => {
                      const next = [...variables];
                      next[index] = { ...variable, label: e.target.value };
                      setVariables(next);
                    }}
                  />
                  <select
                    className="col-span-3 h-9 rounded-md border px-2 text-sm bg-white"
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="col-span-2 text-red-500"
                    onClick={() => setVariables(variables.filter((_, i) => i !== index))}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {variables.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No variables defined</p>
              )}
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
