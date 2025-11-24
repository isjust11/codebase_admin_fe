import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent } from "./dialog";
import { mergeImageUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";

type BaseImageUploadProps = {
  label?: string;
  placeholder?: string;
  className?: string;
  maxImages?: number;
};

type SingleImageUploadProps = BaseImageUploadProps & {
  value?: string;
  multiple?: false;
  onChange: (value: File | null) => void;
};

type MultipleImageUploadProps = BaseImageUploadProps & {
  value?: string | string[];
  multiple: true;
  onChange: (value: File[] | null) => void;
};

type ImageUploadProps = SingleImageUploadProps | MultipleImageUploadProps;

type ImageItem = {
  id: string;
  url: string;
  origin: "remote" | "local";
  file?: File;
};

const createInitialItems = (value?: string | string[]): ImageItem[] => {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];

  return items
    .filter(Boolean)
    .map((url, index) => ({
      id: `remote-${index}-${url}`,
      url: mergeImageUrl(url),
      origin: "remote" as const,
    }));
};

const ImageUpload = (props: ImageUploadProps) => {
  const tUtils = useTranslations("Utils");
  const tImage = useTranslations("ImageUpload");

  const {
    value,
    onChange,
    label,
    placeholder: placeholderProp,
    className = "",
    maxImages = 10,
  } = props;

  const placeholder = placeholderProp ?? tUtils("dropFile");

  const isMultiple = props.multiple === true;

  const [remoteImages, setRemoteImages] = useState<ImageItem[]>(() =>
    createInitialItems(value)
  );
  const [localImages, setLocalImages] = useState<ImageItem[]>([]);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    setRemoteImages(createInitialItems(value));
  }, [value]);

  const images = useMemo(() => {
    if (isMultiple) {
      return [...remoteImages, ...localImages];
    }

    return localImages.length > 0 ? localImages : remoteImages;
  }, [isMultiple, localImages, remoteImages]);

  const totalImages = isMultiple
    ? remoteImages.length + localImages.length
    : images.length;

  const emitChange = (nextLocalImages: ImageItem[]) => {
    const files = nextLocalImages
      .map((item) => item.file)
      .filter((file): file is File => Boolean(file));

    if (!files.length) {
      onChange(null as never);
      return;
    }

    if (isMultiple) {
      onChange(files as never);
    } else {
      onChange((files[0] ?? null) as never);
    }
  };

  // Fix: Call onChange in useEffect to avoid updating parent during render
  useEffect(() => {
    emitChange(localImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localImages]);

  const handleDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    if (isMultiple) {
      const availableSlots = Math.max(maxImages - totalImages, 0);
      if (!availableSlots) return;

      const filesToAdd = acceptedFiles.slice(0, availableSlots);
      const newItems = filesToAdd.map((file, index) => ({
        id: `local-${file.name}-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        origin: "local" as const,
        file,
      }));

      setLocalImages((prev) => [...prev, ...newItems]);
      return;
    }

    const file = acceptedFiles[0];
    const newItem: ImageItem = {
      id: `local-${file.name}-${Date.now()}`,
      url: URL.createObjectURL(file),
      origin: "local",
      file,
    };

    setLocalImages((prev) => {
      prev.forEach((item) => {
        if (item.origin === "local") {
          URL.revokeObjectURL(item.url);
        }
      });
      return [newItem];
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": [],
    },
    multiple: isMultiple,
    disabled: isMultiple && totalImages >= maxImages,
  });

  const handleRemoveImage = (image: ImageItem) => {
    if (image.origin === "local") {
      URL.revokeObjectURL(image.url);
      setLocalImages((prev) => prev.filter((item) => item.id !== image.id));
    } else {
      setRemoteImages((prev) => prev.filter((item) => item.id !== image.id));
      if (!isMultiple) {
        onChange(null as never);
      }
    }

    if (galleryIndex !== null && images[galleryIndex]?.id === image.id) {
      setGalleryIndex(null);
    }
  };

  const canAddMore = isMultiple ? totalImages < maxImages : true;

  const renderDropContent = () => (
    <div className="dz-message flex flex-col items-center m-0!">
      <div className="mb-[22px] flex justify-center">
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
          <Plus className="h-8 w-8" />
        </div>
      </div>
      <h4 className="mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90">
        {isDragActive ? tUtils("dropFile") : placeholder}
      </h4>
      <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400">
        {tUtils("dragAndDropFile")}
      </span>
      <span className="font-medium underline text-theme-sm text-brand-500">
        {tUtils("selectImage")}
      </span>
    </div>
  );

  const renderEmptyState = () => (
    <div
      {...getRootProps()}
      className={`dropzone rounded-xl border border-dashed border-gray-300 p-7 lg:p-10 cursor-pointer transition 
        ${isDragActive
          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        }`}
      id="image-upload"
    >
      <input {...getInputProps()} />
      {renderDropContent()}
    </div>
  );

  const renderAddTile = () => (
    <div
      {...getRootProps()}
      className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 cursor-pointer hover:border-brand-500 transition"
    >
      <input {...getInputProps()} />
      <Plus className="h-6 w-6 mb-2" />
      <span className="text-sm font-medium">{tImage("addImage")}</span>
    </div>
  );

  const showGallery = galleryIndex !== null && images[galleryIndex];

  const handlePrev = () => {
    if (!showGallery || galleryIndex === null) return;
    setGalleryIndex(
      galleryIndex === 0 ? images.length - 1 : (galleryIndex - 1 + images.length) % images.length
    );
  };

  const handleNext = () => {
    if (!showGallery || galleryIndex === null) return;
    setGalleryIndex((galleryIndex + 1) % images.length);
  };

  useEffect(() => {
    return () => {
      localImages.forEach((image) => {
        if (image.origin === "local") {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [localImages]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {images.length === 0 ? (
        renderEmptyState()
      ) : isMultiple ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => setGalleryIndex(index)}
                  className="block w-full h-32"
                >
                  <img
                    src={image.url}
                    alt={tImage("imageAlt", { index: index + 1 })}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition opacity-0 group-hover:opacity-100" />
                </button>
                <button
                  type="button"
                  title={tUtils("deleteImage")}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveImage(image);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {canAddMore && renderAddTile()}
          </div>
        </>) : (<>
          <div className="relative">
            {images.length > 0 && (
              <img
                src={images[0].url}
                alt="Preview"
                className="w-full h-64 object-cover rounded-xl"
              />
            )}

            <button
              type="button"
              title={tUtils('deleteImage')}
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveImage(images[0]);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>)}

      {isMultiple && (
        <div className="text-sm text-gray-500">
          {tImage("countLabel", {
            count: Math.min(totalImages, maxImages),
            max: maxImages,
          })}
        </div>
      )}

      <Dialog
        open={Boolean(showGallery)}
        onOpenChange={(open) => {
          if (!open) {
            setGalleryIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl w-full border-none bg-transparent shadow-none">
          {showGallery && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4">
              <img
                src={images[galleryIndex!].url}
                alt={tImage("previewAlt")}
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
              {images.length > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {tUtils("previous")}
                  </Button>
                  <span className="text-sm text-gray-500">
                    {tImage("galleryPosition", {
                      current: galleryIndex! + 1,
                      total: images.length,
                    })}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    {tUtils("next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUpload;
