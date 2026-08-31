'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface InlineSlotEditorProps {
  value: string;
  type?: 'text' | 'textarea' | 'color' | 'number';
  label?: string;
  onChange: (val: string | number) => void;
  children: React.ReactNode;
  active?: boolean;
}

export default function InlineSlotEditor({
  value,
  type = 'text',
  label,
  onChange,
  children,
  active = true,
}: InlineSlotEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<string | number>(value);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  if (!active) return <>{children}</>;

  return (
    <div className="relative group/slot inline-block w-full">
      <div 
        className="group-hover/slot:ring-2 group-hover/slot:ring-blue-500/50 group-hover/slot:bg-blue-50/10 rounded-sm cursor-pointer transition-all min-h-[1.5rem]"
        onClick={() => setIsEditing(true)}
      >
        {children}
      </div>

      <div className="absolute -top-3 -right-3 opacity-0 group-hover/slot:opacity-100 transition-opacity z-10 pointer-events-none">
        <button
          type="button"
          className="flex items-center gap-1 bg-blue-600 text-white shadow-md rounded-full px-2 py-1 text-[10px] font-medium pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>

      {isEditing && (
        <div 
          ref={popoverRef}
          className="absolute z-50 top-full left-0 mt-2 bg-white rounded-xl p-4 shadow-2xl border border-gray-200 w-[300px] text-left animate-in fade-in zoom-in-95 duration-100"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              Sửa {label || 'nội dung'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none"
            >
              &times;
            </button>
          </div>

          {type === 'textarea' ? (
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              rows={3}
              className="mb-3 text-sm"
              autoFocus
            />
          ) : type === 'number' ? (
            <Input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(Number(e.target.value))}
              className="mb-3 text-sm"
              autoFocus
            />
          ) : type === 'color' ? (
            <div className="flex items-center gap-2 mb-3">
              <input
                type="color"
                value={String(tempValue)}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-10 h-10 p-1 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={String(tempValue)}
                onChange={(e) => setTempValue(e.target.value)}
                className="text-sm flex-1"
              />
            </div>
          ) : (
            <Input
              type="text"
              value={String(tempValue)}
              onChange={(e) => setTempValue(e.target.value)}
              className="mb-3 text-sm"
              autoFocus
            />
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 text-xs font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow transition-colors"
            >
              Cập nhật
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
