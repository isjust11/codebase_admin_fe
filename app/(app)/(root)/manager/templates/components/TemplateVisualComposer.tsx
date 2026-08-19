'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  LayoutJson,
  LayoutSection,
  SECTION_CATALOG,
} from '@/lib/wedding-layout';

const SECTION_FIELD_MAP: Record<string, Array<{ key: string; label: string; type: 'text' | 'color' | 'number' | 'textarea' }>> = {
  cover: [
    { key: 'title', label: 'Tiêu đề', type: 'text' },
    { key: 'subtitle', label: 'Phụ đề', type: 'text' },
    { key: 'buttonText', label: 'Nút CTA', type: 'text' },
    { key: 'backgroundColor', label: 'Màu nền', type: 'color' },
    { key: 'textColor', label: 'Màu chữ', type: 'color' },
    { key: 'accentColor', label: 'Màu nhấn', type: 'color' },
    { key: 'borderRadius', label: 'Bo góc', type: 'number' },
  ],
  inviteHero: [
    { key: 'title', label: 'Tên sự kiện', type: 'text' },
    { key: 'subtitle', label: 'Nội dung', type: 'textarea' },
    { key: 'backgroundColor', label: 'Màu nền', type: 'color' },
    { key: 'textColor', label: 'Màu chữ', type: 'color' },
    { key: 'accentColor', label: 'Màu nhấn', type: 'color' },
  ],
  countdown: [
    { key: 'title', label: 'Tên mốc', type: 'text' },
    { key: 'date', label: 'Ngày sự kiện', type: 'text' },
    { key: 'backgroundColor', label: 'Màu nền', type: 'color' },
    { key: 'textColor', label: 'Màu chữ', type: 'color' },
  ],
  default: [
    { key: 'title', label: 'Tiêu đề', type: 'text' },
    { key: 'subtitle', label: 'Mô tả', type: 'textarea' },
    { key: 'backgroundColor', label: 'Màu nền', type: 'color' },
    { key: 'textColor', label: 'Màu chữ', type: 'color' },
    { key: 'accentColor', label: 'Màu nhấn', type: 'color' },
    { key: 'borderRadius', label: 'Bo góc', type: 'number' },
    { key: 'css', label: 'CSS tùy biến', type: 'textarea' },
  ],
};

const getSectionFields = (type: string) => SECTION_FIELD_MAP[type] || SECTION_FIELD_MAP.default;

const normalizeProps = (type: string, props?: Record<string, unknown>) => {
  const fields = getSectionFields(type);
  const defaults: Record<string, unknown> = {
    title: 'Tên sự kiện',
    subtitle: 'Chúng tôi rất hân hạnh mời bạn',
    buttonText: 'Xác nhận',
    backgroundColor: '#fffaf6',
    textColor: '#1f2937',
    accentColor: '#c9a227',
    borderRadius: 24,
    css: '.visual-section-preview { transition: all 0.2s ease; }\n.visual-section-preview .title { font-weight: 700; }',
    date: '2026-12-12',
  };

  fields.forEach((field) => {
    if (!(field.key in defaults)) {
      defaults[field.key] = '';
    }
  });

  return { ...defaults, ...(props || {}) };
};

function SortableRow({
  section,
  selected,
  onSelect,
  onRemove,
}: {
  section: LayoutSection;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const label = SECTION_CATALOG.find((item) => item.type === section.type)?.label || section.type;
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border px-2 py-2 ${selected ? 'border-stone-900 bg-stone-50' : 'border-stone-200'}`}
    >
      <button type="button" className="cursor-grab text-stone-400" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </button>
      <button type="button" className="flex-1 text-left text-sm" onClick={onSelect}>
        {label}
      </button>
      <button type="button" className="text-red-500" onClick={onRemove}>
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}

type Props = {
  layout: LayoutJson;
  onChange: (layout: LayoutJson) => void;
};

export default function TemplateVisualComposer({ layout, onChange }: Props) {
  const [selectedId, setSelectedId] = useState(layout.sections[0]?.id || '');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const selected = useMemo(
    () => layout.sections.find((item) => item.id === selectedId) || layout.sections[0],
    [layout.sections, selectedId],
  );

  const selectedProps = useMemo(() => (selected ? normalizeProps(selected.type, (selected.props || {}) as Record<string, unknown>) : {}), [selected]);

  const updateTheme = (patch: Partial<LayoutJson['theme']>) => {
    onChange({ ...layout, theme: { ...DEFAULT_THEME, ...layout.theme, ...patch } });
  };

  const updateSelectedProps = (patch: Record<string, unknown>) => {
    if (!selected) return;
    onChange({
      ...layout,
      sections: layout.sections.map((item) =>
        item.id === selected.id ? { ...item, props: { ...(item.props || {}), ...patch } } : item,
      ),
    });
  };

  const addSection = (type: string) => {
    const id = `${type}-${Date.now()}`;
    onChange({ ...layout, sections: [...layout.sections, { id, type, props: {} }] });
    setSelectedId(id);
  };

  const removeSection = (id: string) => {
    const nextSections = layout.sections.filter((item) => item.id !== id);
    onChange({ ...layout, sections: nextSections });
    if (selectedId === id && nextSections[0]) {
      setSelectedId(nextSections[0].id);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.sections.findIndex((item) => item.id === active.id);
    const newIndex = layout.sections.findIndex((item) => item.id === over.id);
    onChange({ ...layout, sections: arrayMove(layout.sections, oldIndex, newIndex) });
  };

  const moveSelectedSection = (direction: 'up' | 'down') => {
    if (!selected) return;
    const currentIndex = layout.sections.findIndex((item) => item.id === selected.id);
    if (currentIndex < 0) return;
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= layout.sections.length) return;
    onChange({
      ...layout,
      sections: arrayMove(layout.sections, currentIndex, nextIndex),
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.25fr_1fr]">
      <div className="space-y-3">
        <Label>Thư viện section</Label>
        <div className="flex flex-wrap gap-2">
          {SECTION_CATALOG.map((item) => (
            <Button key={item.type} type="button" size="sm" variant="outline" onClick={() => addSection(item.type)}>
              <Plus className="mr-1 h-3 w-3" /> {item.label}
            </Button>
          ))}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={layout.sections.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {layout.sections.map((section) => (
                <SortableRow
                  key={section.id}
                  section={section}
                  selected={section.id === selected?.id}
                  onSelect={() => setSelectedId(section.id)}
                  onRemove={() => removeSection(section.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="space-y-3 rounded-xl border bg-stone-50 p-3">
        <Label>Canvas trực quan</Label>
        <div className="mx-auto max-w-[430px] space-y-3 rounded-[28px] border-4 border-zinc-800 bg-zinc-950 p-3 shadow-xl">
          <div className="h-[520px] overflow-y-auto rounded-[22px] bg-white p-3">
            {layout.sections.map((section) => {
              const props = normalizeProps(section.type, (section.props || {}) as Record<string, unknown>);
              const baseStyle = {
                background: String(props.backgroundColor || '#fffaf6'),
                color: String(props.textColor || '#1f2937'),
                borderRadius: `${Number(props.borderRadius || 24)}px`,
                border: `1px solid ${String(props.accentColor || '#d6d3d1')}`,
              };

              return (
                <div
                  key={section.id}
                  className={`mb-3 rounded-2xl border border-stone-200 p-4 transition ${section.id === selected?.id ? 'ring-2 ring-stone-900' : ''}`}
                  style={baseStyle}
                  onClick={() => setSelectedId(section.id)}
                >
                  <style>{String(props.css || '')}</style>
                  <div className="visual-section-preview">
                    <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                      {SECTION_CATALOG.find((item) => item.type === section.type)?.label || section.type}
                    </div>
                    <div className="mt-2 text-2xl font-bold" style={{ color: String(props.textColor || '#1f2937') }}>
                      {String(props.title || 'Tiêu đề')}
                    </div>
                    {props.subtitle ? (
                      <div className="mt-2 text-sm opacity-80">{String(props.subtitle)}</div>
                    ) : null}
                    {props.buttonText ? (
                      <button
                        type="button"
                        className="mt-4 rounded-full px-4 py-2 text-sm font-medium"
                        style={{ background: String(props.accentColor || '#c9a227'), color: '#ffffff' }}
                      >
                        {String(props.buttonText)}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Thiết lập component</Label>
        {selected ? (
          <div className="space-y-3">
            <div className="rounded-md border bg-stone-50 p-3 text-sm text-stone-600">
              <div className="flex items-center justify-between gap-2">
                <span>
                  Đang chọn: <strong>{SECTION_CATALOG.find((item) => item.type === selected.type)?.label || selected.type}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSelectedSection('up')}>
                    Lên
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => moveSelectedSection('down')}>
                    Xuống
                  </Button>
                </div>
              </div>
            </div>
            {getSectionFields(selected.type).map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                {field.type === 'text' && (
                  <Input
                    value={String(selectedProps[field.key] ?? '')}
                    onChange={(e) => updateSelectedProps({ [field.key]: e.target.value })}
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    value={String(selectedProps[field.key] ?? '')}
                    onChange={(e) => updateSelectedProps({ [field.key]: e.target.value })}
                    className="min-h-[90px]"
                  />
                )}
                {field.type === 'color' && (
                  <Input
                    type="color"
                    value={String(selectedProps[field.key] || '#ffffff')}
                    onChange={(e) => updateSelectedProps({ [field.key]: e.target.value })}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={Number(selectedProps[field.key] ?? 24)}
                    onChange={(e) => updateSelectedProps({ [field.key]: Number(e.target.value || 0) })}
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}

        <div className="space-y-3 border-t pt-3">
          <Label>Theme</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Màu chủ đạo</Label>
              <Input
                type="color"
                value={layout.theme?.primaryColor || DEFAULT_THEME.primaryColor}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              />
            </div>
            <div>
              <Label>Nền</Label>
              <Input
                type="color"
                value={layout.theme?.background || DEFAULT_THEME.background}
                onChange={(e) => updateTheme({ background: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Font tiêu đề</Label>
            <select
              className="h-9 w-full rounded-md border px-2 text-sm"
              value={layout.theme?.fontHeading || DEFAULT_THEME.fontHeading}
              onChange={(e) => updateTheme({ fontHeading: e.target.value })}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Font nội dung</Label>
            <select
              className="h-9 w-full rounded-md border px-2 text-sm"
              value={layout.theme?.fontBody || DEFAULT_THEME.fontBody}
              onChange={(e) => updateTheme({ fontBody: e.target.value })}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
