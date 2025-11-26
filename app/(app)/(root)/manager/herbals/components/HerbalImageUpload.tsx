'use client'
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/services/media-api';
import { createHerbalImage, getHerbalImages, deleteHerbalImage, updateHerbalImage, HerbalImageDto } from '@/services/herbal-image-api';
import Image from 'next/image';
import { useTranslations } from 'next-intl'
import { mergeImageUrl } from '@/lib/utils';
interface HerbalImageUploadProps {
  herbalId: string;
}

const HerbalImageUpload: React.FC<HerbalImageUploadProps> = ({ herbalId }) => {
  const [images, setImages] = useState<HerbalImageDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Herbals')
  const tUtils = useTranslations('Utils')
  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        // Upload file to media service
        const uploadResponse = await uploadFile(file);
        
        // Create herbal image record
        const imageData = {
          herbalId: herbalId,
          url: uploadResponse.publicRelativePath,
          type: 'other' as const,
          sortOrder: images.length + 1,
          isActive: true
        };

        const newImage = await createHerbalImage(imageData);
        return newImage;
      });

      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${tUtils('uploadSuccess', { count: acceptedFiles.length })}`);
    } catch (error) {
      console.error(tUtils('uploadError'), error);
      toast.error(tUtils('uploadError'));
    } finally {
      setUploading(false);
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
    multiple: true,
  });

  useEffect(() => {
    loadImages();
  }, [herbalId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const herbalImages = await getHerbalImages(herbalId);
      setImages(herbalImages);
    } catch (error) {
      console.error(tUtils('errorLoadingImages'), error);
      toast.error(tUtils('errorLoadingImages'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteHerbalImage(imageId);
      setImages(prev => prev.filter(img => img.id?.toString() !== imageId));
      toast.success(tUtils('deleteFileSuccess'));
    } catch (error) {
      console.error(tUtils('deleteFileError'), error);
      toast.error(tUtils('deleteFileError'));
    }
  };

  const handleSetMainImage = async (imageId: string) => {
    try {
      // Set all images to other type first
      const updatePromises = images.map(img => 
        updateHerbalImage(img.id!, { type: 'other' })
      );
      await Promise.all(updatePromises);

      // Set selected image as main
      await updateHerbalImage(imageId, { type: 'main' });
      
      // Reload images to get updated data
      await loadImages();
      toast.success(tUtils('setMainImageSuccess'));
    } catch (error) {
      console.error(tUtils('errorSettingMainImage'), error);
      toast.error(tUtils('errorSettingMainImage'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">{t('uploadHerbalsImage')}</h3>
        </div>
        
        <div className="transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500">
          <div
            {...getRootProps()}
            className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
                ${isDragActive
                ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }
              `}
          >
            <input {...getInputProps()} />

            <div className="dz-message flex flex-col items-center m-0!">
              {/* Icon Container */}
              <div className="mb-[22px] flex justify-center">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  <Upload className="h-8 w-8" />
                </div>
              </div>

              {/* Text Content */}
              <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
                {isDragActive ? tUtils('dropFileHere') : tUtils('dragAndDropFile')}
              </h4>

              <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
                {tUtils('dragAndDropFile')}
              </span>

              <span className="font-medium underline text-theme-sm text-brand-500">
                {tUtils('selectImage')}
              </span>
            </div>
          </div>
        </div>

        {uploading && (
          <div className="text-center text-blue-600">
            {tUtils('uploading')}
          </div>
        )}
      </div>

      {/* Images Display */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold">{tUtils('uploadedImages', { count: images.length })}</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <Card key={image.id} className="relative group">
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <Image
                      width={100}
                      height={100}
                      src={mergeImageUrl(image.url)}
                      alt={image.alt || `Hình ảnh ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetMainImage(image.id!)}
                          className="bg-white text-gray-800 hover:bg-gray-100"
                        >
                          {image.type === 'main' ? t('main') : t('setMain')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteImage(image.id!)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Main image indicator */}
                    {image.type === 'main' && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        {t('main')}
                      </div>
                    )}

                    {/* Sort order indicator */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {image.sortOrder}
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sort instructions */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>💡 {t('guide')}:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>{t('hoverImage')}</li>
              <li>{t('clickSetMain')}</li>
              <li>{t('clickDelete')}</li>
              <li>{t('sortOrder')}</li>
            </ul>
          </div>
        </div>
      )}

      {images.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          {tUtils('noImage')}
        </div>
      )}
    </div>
  );
};

export default HerbalImageUpload; 