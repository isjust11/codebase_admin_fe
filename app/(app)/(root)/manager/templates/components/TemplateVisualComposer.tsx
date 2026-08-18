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
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  LayoutJson,
  LayoutSection,
  SECTION_CATALOG,
} from '@/lib/wedding-layout';

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

  const updateTheme = (patch: Partial<LayoutJson['theme']>) => {
    onChange({ ...layout, theme: { ...DEFAULT_THEME, ...layout.theme, ...patch } });
  };

  const addSection = (type: string) => {
    const id = `${type}-${Date.now()}`;
    onChange({ ...layout, sections: [...layout.sections, { id, type, props: {} }] });
    setSelectedId(id);
  };

  const removeSection = (id: string) => {
    onChange({ ...layout, sections: layout.sections.filter((item) => item.id !== id) });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = layout.sections.findIndex((item) => item.id === active.id);
    const newIndex = layout.sections.findIndex((item) => item.id === over.id);
    onChange({ ...layout, sections: arrayMove(layout.sections, oldIndex, newIndex) });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
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
      <div className="space-y-3">
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
        {selected ? (
          <p className="text-sm text-stone-500">
            Section đang chọn: {SECTION_CATALOG.find((item) => item.type === selected.type)?.label}. Host sẽ điền nội dung
            (tên, ảnh, địa chỉ) trên app.
          </p>
        ) : null}
      </div>
    </div>
  );
}
