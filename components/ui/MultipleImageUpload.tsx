import { useState } from 'react';
import { useDropzone } from "react-dropzone";
import { X, Plus } from 'lucide-react';

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (value: string[]) => void;
  onFileChange?: (files: File[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  maxImages?: number;
}

const MultipleImageUpload = ({ 
  value = [], 
  onChange, 
  onFileChange,
  label, 
  placeholder = "Kéo & và thả file vào đây",
  className = "",
  maxImages = 10
}: MultipleImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.slice(0, maxImages - value.length);
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Cập nhật giá trị với các URL preview mới
      const newUrls = [...value, ...newPreviewUrls];
      onChange(newUrls);
      
      // Gọi callback cho file nếu có
      if (onFileChange) {
        onFileChange([...selectedFiles, ...newFiles]);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
  });

  const handleRemoveImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    onChange(newUrls);
    
    // Gọi callback cho file nếu có
    if (onFileChange) {
      onFileChange(newFiles);
    }
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      
      {/* Hiển thị các ảnh đã upload */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                title="Xóa hình ảnh"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Khu vực upload mới */}
      {canAddMore && (
        <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
          <div
            {...getRootProps()}
            className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                ${isDragActive
                ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }
              `}
            id="multiple-image-upload"
          >
            {/* Hidden Input */}
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center m-0!">
              {/* Icon Container */}
              <div className="mb-[22px] flex justify-center">
                <div className="flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <Plus className="h-8 w-8" />
                </div>
              </div>

              {/* Text Content */}
              <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                {isDragActive ? "Thả file vào đây" : placeholder}
              </h4>

              <span className=" text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                Kéo và thả file PNG, JPG, WebP, SVG vào đây
              </span>

              <span className="font-medium underline text-theme-sm text-brand-500">
                Chọn ảnh
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin về số lượng ảnh */}
      <div className="text-sm text-gray-500">
        {value.length} / {maxImages} ảnh
      </div>
    </div>
  );
};

export default MultipleImageUpload;
