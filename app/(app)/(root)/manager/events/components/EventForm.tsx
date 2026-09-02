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
      setAllTemplates(res.data);
      setTemplates(res.data.map((t: any) => ({ value: t.id, label: t.name })));
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
                onChange={(value) => setFormData({ ...formData, templateId: Array.isArray(value) ? value[0] : value as string })}
              />
              {selectedTemplate?.thumbnailUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm text-stone-500">Template Preview</p>
                  <img src={selectedTemplate.thumbnailUrl} alt="Template Preview" className="w-full max-w-[240px] rounded-xl border object-cover shadow-sm" />
                </div>
              )}
            </div>
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
