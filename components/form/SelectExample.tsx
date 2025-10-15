import React, { useState } from 'react';
import Select from './Select';
import { mergeImageUrl } from '@/lib/utils';

// Example usage of the new Select component
const SelectExample: React.FC = () => {
  const [singleValue, setSingleValue] = useState<string>('');
  const [multipleValues, setMultipleValues] = useState<string[]>([]);
  const [searchableValue, setSearchableValue] = useState<string>('');

  // Sample data similar to authors in FolkMedicineForm
  const authors = [
    {
      value: '1',
      label: 'Dr. Nguyễn Văn A',
      avatar: '/images/avatar1.jpg'
    },
    {
      value: '2', 
      label: 'Dr. Trần Thị B',
      avatar: '/images/avatar2.jpg'
    },
    {
      value: '3',
      label: 'Dr. Lê Văn C',
      avatar: '/images/avatar3.jpg'
    },
    {
      value: '4',
      label: 'Dr. Phạm Thị D',
      avatar: '/images/avatar4.jpg'
    }
  ];

  const categories = [
    { value: '1', label: 'Thuốc Nam' },
    { value: '2', label: 'Thuốc Bắc' },
    { value: '3', label: 'Cây Thuốc' },
    { value: '4', label: 'Bài Thuốc Dân Gian' }
  ];

  // Custom renderer for authors with avatar
  const renderAuthorOption = (option: any) => (
    <div className="flex items-center gap-2">
      {option.avatar && (
        <img
          src={mergeImageUrl(option.avatar)}
          alt={option.label}
          className="w-6 h-6 rounded-full bg-gray-200 ring-1 ring-gray-300"
        />
      )}
      <span>{option.label}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Select Component Examples</h1>
      
      {/* Basic Single Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Basic Single Select</label>
        <Select
          options={categories}
          placeholder="Chọn danh mục"
          onChange={(value) => setSingleValue(value as string)}
          value={singleValue}
        />
        <p className="text-sm text-gray-600">Selected: {singleValue}</p>
      </div>

      {/* Multiple Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Multiple Select</label>
        <Select
          options={categories}
          placeholder="Chọn nhiều danh mục"
          onChange={(values) => setMultipleValues(Array.isArray(values) ? values : [])}
          value={multipleValues}
          multiple={true}
        />
        <p className="text-sm text-gray-600">Selected: {multipleValues.join(', ')}</p>
      </div>

      {/* Searchable Single Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Searchable Single Select</label>
        <Select
          options={authors}
          placeholder="Tìm kiếm tác giả"
          onChange={(value) => setSearchableValue(value as string)}
          value={searchableValue}
          searchable={true}
          searchPlaceholder="Nhập tên tác giả..."
          renderOption={renderAuthorOption}
        />
        <p className="text-sm text-gray-600">Selected: {searchableValue}</p>
      </div>

      {/* Searchable Multiple Select with Custom Rendering */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Searchable Multiple Select with Avatars</label>
        <Select
          options={authors}
          placeholder="Chọn nhiều tác giả"
          onChange={(values) => setMultipleValues(Array.isArray(values) ? values : [])}
          value={multipleValues}
          multiple={true}
          searchable={true}
          searchPlaceholder="Tìm kiếm tác giả..."
          renderOption={renderAuthorOption}
          emptyMessage="Không tìm thấy tác giả nào"
        />
        <p className="text-sm text-gray-600">Selected: {multipleValues.join(', ')}</p>
      </div>

      {/* Disabled Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Disabled Select</label>
        <Select
          options={categories}
          placeholder="Select disabled"
          onChange={() => {}}
          disabled={true}
        />
      </div>
    </div>
  );
};

export default SelectExample;
