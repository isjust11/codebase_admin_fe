'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createEvent, getEvent, updateEvent, EventDto } from '@/services/event-api';
import { uploadFile } from '@/services/media-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Save, X } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslations } from 'next-intl';
import ImageUpload from '@/components/ui/ImageUpload';
import { AppRoutes } from '@/constants';
import Select, { SelectOption } from '@/components/form/Select';
import { getTemplates } from '@/services/template-api';

export default function EventForm() {
  const t = useTranslations('EventPage'); // Need translations if they exist, else fallback to text
  const tUtils = useTranslations('Utils');
  const { navigateTo, back } = useLoading();
  const params = useParams();
  const id = params.id?.toString();

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templates, setTemplates] = useState<SelectOption[]>([]);
  const [allTemplates, setAllTemplates] = useState<any[]>([]);

  const [formData, setFormData] = useState<EventDto>({
    title: '',
    slug: '',
    type: 'EVENT',
    templateId: '',
    eventDate: '',
    venue: '',
    coverImageUrl: '',
    status: 'DRAFT',
  });

  const typeOptions: SelectOption[] = [
    { value: 'WEDDING', label: 'Wedding' },
    { value: 'EVENT', label: 'Event' },
    { value: 'BIRTHDAY', label: 'Birthday' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  useEffect(() => {
    // Load available templates
    getTemplates({ size: 100 }).then(res => {
      const items = res.data || [];
      setAllTemplates(items);
      setTemplates(items.map((t: any) => ({
        value: t.id.toString(),
        label: t.name
      })));
    }).catch(console.error);

    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      const data = await getEvent(eventId);
      setFormData({
        title: data.title,
        slug: data.slug || '',
        type: data.type || 'EVENT',
        templateId: data.templateId?.id || data.templateId || '',
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString().slice(0, 16) : '',
        venue: data.venue || '',
        coverImageUrl: data.coverImageUrl || '',
        status: data.status || 'DRAFT',
      });
    } catch (_error) {
      toast.error('Could not load event data');
    }
  };

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

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Title is required');
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
        coverImageUrl,
        eventDate: formData.eventDate ? new Date(formData.eventDate).toISOString() : undefined,
      };

      if (id) {
        await updateEvent(id, payload);
        toast.success('Event updated successfully');
      } else {
        await createEvent(payload);
        toast.success('Event created successfully');
      }
      navigateTo(AppRoutes.Manager.Events);
    } catch (_error) {
      toast.error(id ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const actions: Action[] = [
    {
      icon: <Save className="w-4 h-4 mr-2" />,
      onClick: handleSubmit,
      title: tUtils('save'),
      isLoading: loading,
    },
    {
      icon: <X className="w-4 h-4 mr-2" />,
      onClick: () => back(),
      title: tUtils('cancel'),
      variant: 'outline',
    },
  ];

  const selectedTemplate = allTemplates.find(t => String(t.id) === String(formData.templateId));

  return (
    <div>
      <PageBreadcrumb pageTitle={id ? 'Update Event' : 'Add Event'} />
      <ComponentCard title={id ? 'Update Event' : 'Add Event'} listAction={actions}>
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="event-slug"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Venue</Label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Enter venue address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select
                  options={typeOptions}
                  value={formData.type as string}
                  onChange={(value) => setFormData({ ...formData, type: Array.isArray(value) ? value[0] : value as any })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  options={statusOptions}
                  value={formData.status as string}
                  onChange={(value) => setFormData({ ...formData, status: Array.isArray(value) ? value[0] : value as any })}
                />
              </div>
            </div>
            <div>
              <Label>Template</Label>
              <Select
                options={templates}
                value={formData.templateId as string}
                onChange={(value) => {
                  const templateId = Array.isArray(value) ? value[0] : value as string;
                  const template = allTemplates.find(t => String(t.id) === templateId);
                  let initialData = { ...(formData.eventData || {}) };

                  // Auto-populate from schema defaults when template changes
                  const dataEntries = Array.isArray(template?.data)
                    ? template.data.map((d: any) => [d.fieldKey, { type: d.fieldType, value: d.value }])
                    : Object.entries(template?.data || {});

                  dataEntries.forEach(([fieldKey, d]: [string, any]) => {
                    if (initialData[fieldKey] === undefined && d.value !== undefined && d.value !== null) {
                      let val = d.value;
                      if (d.type === 'json' || d.type === 'textarea') {
                        try { val = JSON.parse(val); } catch (e) { }
                      }
                      initialData[fieldKey] = val;
                    }
                  });

                  setFormData({ ...formData, templateId, eventData: initialData });
                }}
              />
              {selectedTemplate?.thumbnailUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-stone-500">Template Preview</p>
                  <img src={selectedTemplate.thumbnailUrl} alt="Template Preview" className="w-full max-w-[240px] rounded-xl border object-cover shadow-sm" />
                </div>
              )}
            </div>

            {/* Dynamic Template Data Form */}
            {selectedTemplate?.data && Object.keys(selectedTemplate.data).length > 0 && (
              <div className="col-span-1 sm:col-span-2 mt-6 pt-6 border-t border-stone-200">
                <h3 className="mb-4 text-lg font-medium">Custom Event Data (Template Variables)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(Array.isArray(selectedTemplate.data)
                    ? selectedTemplate.data.map((d: any) => [d.fieldKey, { type: d.fieldType, config: d.config }])
                    : Object.entries(selectedTemplate.data)
                  ).map(([fieldKey, schemaField]: [string, any]) => {
                    const isJson = schemaField.type?.toLowerCase() === 'json' || schemaField.type?.toLowerCase() === 'textarea';
                    const isArray = schemaField.type?.toLowerCase() === 'array';
                    const val = formData.eventData?.[fieldKey];

                    const fieldLabel = schemaField.labelVi || schemaField.labelEn || schemaField.config?.display || fieldKey;

                    if (isArray) {
                      const arrayItems = Array.isArray(val) ? val : [];
                      return (
                        <div key={fieldKey} className="sm:col-span-2 border rounded-xl p-5 bg-stone-50/50 space-y-4">
                          <Label className="flex items-center gap-1 font-semibold text-base text-blue-900">
                            {fieldLabel}
                            {schemaField.required && <span className="text-red-500">*</span>}
                          </Label>
                          {schemaField.placeHolder && <p className="text-sm text-stone-500">{schemaField.placeHolder}</p>}

                          <div className="space-y-4">
                            {arrayItems.map((item, itemIdx) => (
                              <div key={itemIdx} className="p-4 bg-white border rounded-lg shadow-sm relative group">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button type="button" onClick={() => {
                                    const newArr = [...arrayItems];
                                    newArr.splice(itemIdx, 1);
                                    setFormData({ ...formData, eventData: { ...formData.eventData, [fieldKey]: newArr } });
                                  }} className="text-red-500 hover:bg-red-50 rounded-md p-1.5 transition-colors" title="Xóa mục này">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <h4 className="text-sm font-medium mb-4 text-stone-400"># {itemIdx + 1}</h4>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {Object.entries(schemaField.itemSchema || {}).map(([subKey, subField]: [string, any]) => {
                                    const subLabel = subField.labelVi || subField.labelEn || subKey;
                                    return (
                                      <div key={subKey}>
                                        <Label className="text-xs mb-1.5 block text-stone-600">{subLabel}</Label>
                                        {subField.type?.toLowerCase() === 'image' ? (
                                          <ImageUpload
                                            value={item[subKey] || ''}
                                            onChange={(file) => {
                                              handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                                                const newArr = [...arrayItems];
                                                newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: url };
                                                setFormData({ ...formData, eventData: { ...formData.eventData, [fieldKey]: newArr } });
                                              });
                                            }}
                                          />
                                        ) : (
                                          <Input
                                            className="h-9 text-sm bg-stone-50/30"
                                            placeholder={subField.placeHolder || ''}
                                            value={item[subKey] || ''}
                                            onChange={(e) => {
                                              const newArr = [...arrayItems];
                                              newArr[itemIdx] = { ...newArr[itemIdx], [subKey]: e.target.value };
                                              setFormData({ ...formData, eventData: { ...formData.eventData, [fieldKey]: newArr } });
                                            }}
                                          />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            onClick={() => {
                              const emptyItem: Record<string, any> = {};
                              Object.keys(schemaField.itemSchema || {}).forEach(k => emptyItem[k] = '');
                              setFormData({ ...formData, eventData: { ...formData.eventData, [fieldKey]: [...arrayItems, emptyItem] } });
                            }}
                          >
                            + Thêm {fieldLabel} mới
                          </button>
                        </div>
                      );
                    }

                    const displayVal = (isJson && typeof val === 'object') ? JSON.stringify(val, null, 2) : (val || '');

                    return (
                      <div key={fieldKey} className={isJson ? "sm:col-span-2" : ""}>
                        <Label className="flex items-center gap-1">
                          {fieldLabel}
                          {schemaField.required && <span className="text-red-500">*</span>}
                        </Label>
                        {isJson ? (
                          <textarea
                            className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={displayVal}
                            placeholder={schemaField.placeHolder || ''}
                            onChange={(e) => {
                              let newVal: any = e.target.value;
                              if (schemaField.type?.toLowerCase() === 'json') {
                                try { newVal = JSON.parse(newVal); } catch (err) { /* keep as string if incomplete json */ }
                              }
                              setFormData({
                                ...formData,
                                eventData: { ...(formData.eventData || {}), [fieldKey]: newVal }
                              });
                            }}
                          />
                        ) : schemaField.type?.toLowerCase() === 'image' ? (
                          <div className="mt-1">
                            <ImageUpload
                              value={displayVal}
                              onChange={(file) => {
                                handleDynamicImageUpload(Array.isArray(file) ? file[0] : file, (url) => {
                                  setFormData({
                                    ...formData,
                                    eventData: { ...(formData.eventData || {}), [fieldKey]: url }
                                  });
                                });
                              }}
                            />
                          </div>
                        ) : (
                          <Input
                            className="mt-1"
                            type={schemaField.type === 'date' ? 'datetime-local' : 'text'}
                            value={displayVal}
                            placeholder={schemaField.placeHolder || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              eventData: { ...(formData.eventData || {}), [fieldKey]: e.target.value }
                            })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <Label>Cover Image</Label>
              <ImageUpload
                value={formData.coverImageUrl}
                onChange={(file) => setSelectedFile(Array.isArray(file) ? file[0] : file)}
              />
            </div>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}
