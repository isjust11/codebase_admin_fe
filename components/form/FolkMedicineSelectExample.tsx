import React, { useState } from 'react';
import Select from './Select';
import { mergeImageUrl } from '@/lib/utils';

// Example of how to use the new Select component in FolkMedicineForm
const FolkMedicineSelectExample: React.FC = () => {
  const [formData, setFormData] = useState({
    authorId: '',
    categoryId: '',
    dataSourceIds: [] as string[]
  });

  // Sample data (replace with actual API data)
  const authors = [
    {
      value: '1',
      label: 'Dr. Nguyễn Văn A',
      avatar: '/uploads/1/avatar1.jpg'
    },
    {
      value: '2', 
      label: 'Dr. Trần Thị B',
      avatar: '/uploads/1/avatar2.jpg'
    },
    {
      value: '3',
      label: 'Dr. Lê Văn C',
      avatar: '/uploads/1/avatar3.jpg'
    }
  ];

  const categories = [
    { value: '1', label: 'Thuốc Nam' },
    { value: '2', label: 'Thuốc Bắc' },
    { value: '3', label: 'Cây Thuốc' },
    { value: '4', label: 'Bài Thuốc Dân Gian' }
  ];

  const dataSources = [
    { value: '1', label: 'Sách "Cây Thuốc Việt Nam"' },
    { value: '2', label: 'Tài liệu Y học Cổ truyền' },
    { value: '3', label: 'Nghiên cứu Đại học Y Hà Nội' },
    { value: '4', label: 'Kinh nghiệm dân gian' }
  ];

  const handleSelectChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Custom renderer for authors with avatar (similar to FolkMedicineForm)
  const renderAuthorOption = (option: any) => (
    <div className="flex items-center gap-2">
      {option.avatar && (
        <img
          src={mergeImageUrl(option.avatar)}
          alt={option.label}
          className="w-8 h-8 rounded-full bg-gray-200 ring-1 ring-gray-300"
        />
      )}
      <span>{option.label}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">FolkMedicineForm Select Examples</h1>
      
      {/* Author Selection - Single with Search and Avatar */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Tác giả (Author)</label>
        <Select
          options={authors}
          placeholder="Chọn tác giả"
          onChange={(value) => handleSelectChange('authorId', value as string)}
          value={formData.authorId}
          searchable={true}
          searchPlaceholder="Tìm kiếm tác giả..."
          renderOption={renderAuthorOption}
          emptyMessage="Không tìm thấy tác giả nào"
        />
        <p className="text-sm text-gray-600">Selected Author ID: {formData.authorId}</p>
      </div>

      {/* Category Selection - Single with Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Danh mục (Category)</label>
        <Select
          options={categories}
          placeholder="Chọn danh mục"
          onChange={(value) => handleSelectChange('categoryId', value as string)}
          value={formData.categoryId}
          searchable={true}
          searchPlaceholder="Tìm kiếm danh mục..."
          emptyMessage="Không tìm thấy danh mục nào"
        />
        <p className="text-sm text-gray-600">Selected Category ID: {formData.categoryId}</p>
      </div>

      {/* Data Sources Selection - Multiple with Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nguồn dữ liệu (Data Sources)</label>
        <Select
          options={dataSources}
          placeholder="Chọn nguồn dữ liệu"
          onChange={(value) => handleSelectChange('dataSourceIds', value as string[])}
          value={formData.dataSourceIds}
          multiple={true}
          searchable={true}
          searchPlaceholder="Tìm kiếm nguồn dữ liệu..."
          emptyMessage="Không tìm thấy nguồn dữ liệu nào"
        />
        <p className="text-sm text-gray-600">Selected Data Source IDs: {formData.dataSourceIds.join(', ')}</p>
      </div>

      {/* Form Data Display */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Form Data:</h3>
        <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default FolkMedicineSelectExample;
