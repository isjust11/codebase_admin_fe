import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";
import * as z from "zod";
import Switch from "@/components/form/switch/Switch";
import { Textarea } from "@/components/ui/textarea";
import { CategoryType } from "@/types/category-type";
import { useMemo, useState } from "react";
import { SmilePlus } from "lucide-react";
import { IconPickerModal } from "@/components/IconPickerModal";
import { unicodeToEmoji } from "@/lib/utils";
import { IconType } from "@/enums/icon-type.enum";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import Select from '@/components/form/Select';
import { toast } from "sonner";
import ImageUpload from "@/components/ui/ImageUpload";

const NO_PARENT_VALUE = "__none__";

// Vài màu gợi ý nhanh cho UX (user vẫn có thể chọn màu tuỳ ý qua color input)
const COLOR_PRESETS = [
    "#6366F1", // indigo
    "#22C55E", // green
    "#F97316", // orange
    "#EF4444", // red
    "#06B6D4", // cyan
    "#A855F7", // purple
    "#F59E0B", // amber
    "#10B981", // emerald
];

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

const formCategorySchema = (t: any) => z.object({
    name: z.string().min(1, {
        message: t('validation.nameMinLength'),
    }),
    nameEN: z.string().optional(),
    description: z.string().optional(),
    descriptionEN: z.string().optional(),
    isActive: z.boolean(),
    categoryTypeId: z.string().refine(val => val.trim() !== '', {
        message: t('validation.categoryTypeIdRequired'),
    }),
    parentId: z.string().optional().nullable(),
    icon: z.string().optional(),
    iconType: z.nativeEnum(IconType).optional(),
    sortOrder: z.preprocess(
        (value) => (value === '' || value === null ? undefined : value),
        z.coerce.number().int().min(0).optional()
    ),
    code: z.string().optional(),
    image: z.string().optional().nullable(),
    color: z
        .string()
        .optional()
        .nullable()
        .refine(
            (val) => !val || HEX_COLOR_REGEX.test(val),
            { message: 'Color phải là HEX hợp lệ (#RRGGBB hoặc #RRGGBBAA)' }
        ),
});

interface CategoryFormProps {
    initialData?: Category | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    categoryTypes: CategoryType[];
    selectedType?: CategoryType | null;
    /** Danh sách toàn bộ category để chọn parent (cùng categoryType) */
    allCategories?: Category[];
}

export function CategoryForm({ initialData, onSubmit, onCancel, categoryTypes, selectedType, allCategories = [] }: CategoryFormProps) {
    const t = useTranslations("CategoriesPage");
    const tUtils = useTranslations("Utils");
    const formSchema = formCategorySchema(t);
    if (initialData && initialData?.icon !== null) {
        initialData.icon = unicodeToEmoji(initialData.icon ?? '');
    }
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof formSchema>, string>>>({});
    // File ảnh người dùng vừa pick — upload trước khi submit, không nằm trong schema
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<z.infer<typeof formSchema>>(initialData ? {
        name: initialData.name,
        nameEN: initialData.nameEN || '',
        description: initialData.description,
        descriptionEN: initialData.descriptionEN || '',
        isActive: initialData.isActive,
        categoryTypeId: initialData.type.id.toString(),
        parentId: initialData.parentId ? initialData.parentId.toString() : null,
        icon: initialData.icon,
        code: initialData.code || '',
        iconType: initialData.iconType || IconType.lucide,
        sortOrder: initialData.sortOrder || 1,
        image: initialData.image || '',
        color: initialData.color || '',
    } : {
        name: "",
        nameEN: "",
        description: "",
        descriptionEN: "",
        isActive: true,
        categoryTypeId: "",
        parentId: null,
        icon: "",
        code: "",
        iconType: IconType.lucide,
        sortOrder: 1,
        image: "",
        color: "",
    });
    if (selectedType && !initialData) {
        formData.categoryTypeId = selectedType.id;
    }

    // Tập category có thể làm parent: cùng categoryType, khác chính nó, khác con của nó
    const parentOptions = useMemo(() => {
        const typeId = formData.categoryTypeId?.toString();
        if (!typeId) return [];
        const editingId = initialData?.id?.toString();

        // Build danh sách id descendant của category đang edit (tránh tạo vòng lặp)
        const descendantIds = new Set<string>();
        if (editingId) {
            const queue: string[] = [editingId];
            while (queue.length > 0) {
                const current = queue.shift()!;
                descendantIds.add(current);
                allCategories
                    .filter(c => (c.parentId?.toString() ?? '') === current)
                    .forEach(c => queue.push(c.id.toString()));
            }
        }

        return allCategories
            .filter(c => c.type?.id?.toString() === typeId)
            .filter(c => !descendantIds.has(c.id.toString()))
            .map(c => ({
                value: c.id.toString(),
                label: c.name,
            }));
    }, [allCategories, formData.categoryTypeId, initialData?.id]);

    const handleSubmit = async () => {
        const isValid = formSchema.safeParse(formData);
        if (!isValid.success) {
            setFormErrors(isValid.error.flatten().fieldErrors as Partial<Record<keyof z.infer<typeof formSchema>, string>>);
            toast.error(t('validation.validationError'));
            return;
        }
        setFormErrors({});
        const payload = {
            ...formData,
            parentId: formData.parentId && formData.parentId !== NO_PARENT_VALUE
                ? formData.parentId
                : null,
            // Cha (page) sẽ upload imageFile và gán lại vào image trước khi gọi API
            imageFile: imageFile ?? undefined,
            // Chuẩn hoá empty string -> null cho BE
            color: formData.color && formData.color.trim() !== '' ? formData.color : null,
            image: formData.image && formData.image.trim() !== '' ? formData.image : null,
        };
        onSubmit(payload);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
    const handleChangeCategoryTypeId = (value: any) => {
        // Đổi category type → reset parent để tránh chọn parent khác type
        setFormData((prev: any) => ({ ...prev, categoryTypeId: value, parentId: null }));
    };
    const handleChangeParentId = (value: any) => {
        const next = value === NO_PARENT_VALUE ? null : value;
        setFormData((prev: any) => ({ ...prev, parentId: next }));
    };
    const handleChangeIsActive = (value: any) => {
        setFormData((prev: any) => ({ ...prev, isActive: value }));
    };
    const handleChangeImage = (file: File | null) => {
        setImageFile(file);
        // Khi user xoá ảnh thì cũng clear field image trong formData
        if (!file) {
            setFormData((prev: any) => ({ ...prev, image: '' }));
        }
    };
    const handleChangeColor = (value: string) => {
        setFormData((prev: any) => ({ ...prev, color: value }));
    };
    return (
        <div>
            <div className="space-y-6">
                <div className="full-width">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('name')} <span className="text-red-500">(*)</span></Label>
                        <Input id="name"
                            name="name"
                            placeholder={t('enterName')}
                            type="text"
                            value={formData.name}
                            onChange={handleChange} />
                        {formErrors.name && <div className="text-red-500 text-sm">{formErrors.name}</div>}
                    </div>
                </div>
                <div className="full-width">
                    <div className="space-y-2">
                        <Label htmlFor="nameEN">{t('nameEN')}</Label>
                        <Input id="nameEN"
                            name="nameEN"
                            placeholder={t('enterNameEN')}
                            type="text"
                            value={formData.nameEN}
                            onChange={handleChange} />
                        {formErrors.nameEN && <div className="text-red-500 text-sm">{formErrors.nameEN}</div>}
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <div className="basis-[70%]">
                        <div className="space-y-2">
                            <Label htmlFor="code">{t('code')}</Label>
                            <Input id="code"
                                name="code"
                                className="input-focus"
                                placeholder={t('enterCode')}
                                type="text"
                                value={formData.code}
                                onChange={handleChange} />
                        </div>
                        {formErrors.code && <div className="text-red-500 text-sm">{formErrors.code}</div>}
                    </div>
                    <div className="basis-[30%]">
                        <div className="space-y-2">
                            <Label htmlFor="sortOrder">{t('sortOrder')}</Label>
                            <Input id="sortOrder"
                                name="sortOrder"
                                className="input-focus"
                                placeholder={t('sortOrder')}
                                type="number"
                                value={formData.sortOrder || ''} onChange={handleChange} />
                        </div>
                        {formErrors.sortOrder && <div className="text-red-500 text-sm">{formErrors.sortOrder}</div>}
                    </div>

                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">{t('description')}</Label>
                    <Textarea id="description"
                        name="description"
                        rows={3}
                        className="input-focus"
                        placeholder={t('enterDescription')}
                        value={formData.description}
                        onChange={handleChange} />
                    {formErrors.description && <div className="text-red-500">{formErrors.description}</div>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="descriptionEN">{t('descriptionEN')}</Label>
                    <Textarea id="descriptionEN"
                        name="descriptionEN"
                        rows={3}
                        className="input-focus"
                        placeholder={t('enterDescriptionEN')}
                        value={formData.descriptionEN}
                        onChange={handleChange} />
                    {formErrors.descriptionEN && <div className="text-red-500">{formErrors.descriptionEN}</div>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="categoryTypeId">{t('type')} <span className="text-red-500">(*)</span></Label>
                    <Select
                        options={categoryTypes.map((type) => ({
                            value: type.id,
                            label: type.name,
                        }))}
                        placeholder={t('selectType')}
                        onChange={(value) => handleChangeCategoryTypeId(value as any)}
                        value={formData.categoryTypeId || ''}
                    />
                    {formErrors.categoryTypeId && (
                        <div className="text-red-500 text-sm">{formErrors.categoryTypeId}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentId">{t('parentCategory')}</Label>
                    <Select
                        searchable
                        searchPlaceholder={t('searchParent')}
                        options={[
                            { value: NO_PARENT_VALUE, label: t('noParent') },
                            ...parentOptions,
                        ]}
                        placeholder={t('selectParent')}
                        onChange={(value) => handleChangeParentId(value as any)}
                        value={formData.parentId ?? NO_PARENT_VALUE}
                        disabled={!formData.categoryTypeId}
                        emptyMessage={t('noParentAvailable')}
                    />
                    {formErrors.parentId && (
                        <div className="text-red-500 text-sm">{formErrors.parentId as string}</div>
                    )}
                </div>

                <div className="flex flex-start items-center gap-6">
                    <div className="basis-[30%]">
                        <Switch
                            label={t('status')}
                            defaultChecked={formData.isActive}
                            onChange={(value) => handleChangeIsActive(value as any)}
                        />
                    </div>

                    <div className="basis-[70%]">
                        <div className="flex flex-start items-center gap-2">
                            <Input id="icon"
                                name="icon"
                                disabled
                                className="input-focus"
                                type="text"
                                value={formData.icon}
                                onChange={handleChange}
                                placeholder={t('selectIcon')}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 w-10 p-0"
                                onClick={() => setIsIconPickerOpen(true)}
                            >
                                <SmilePlus className="h-4 w-4 text-amber-300" />
                            </Button>
                        </div>
                    </div>
                </div>
                {formErrors.icon && <div className="text-red-500">{formErrors.icon}</div>}

                <div className="space-y-2">
                    <Label htmlFor="image">{t('image')}</Label>
                    <ImageUpload
                        value={formData.image ? formData.image : undefined}
                        onChange={(file) => handleChangeImage(file)}
                        placeholder={t('uploadImage')}
                    />
                    {formErrors.image && (
                        <div className="text-red-500 text-sm">{formErrors.image as string}</div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="color">{t('color')}</Label>
                    <div className="flex items-center gap-3">
                        <input
                            id="color"
                            type="color"
                            value={formData.color && HEX_COLOR_REGEX.test(formData.color) ? formData.color.slice(0, 7) : '#6366F1'}
                            onChange={(e) => handleChangeColor(e.target.value.toUpperCase())}
                            className="h-10 w-14 cursor-pointer rounded-md border border-gray-200 bg-white p-1"
                            aria-label={t('color')}
                        />
                        <Input
                            id="colorHex"
                            name="color"
                            type="text"
                            placeholder="#6366F1"
                            value={formData.color ?? ''}
                            onChange={(e) => handleChangeColor(e.target.value)}
                            className="max-w-[160px]"
                        />
                        {formData.color && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 px-3"
                                onClick={() => handleChangeColor('')}
                            >
                                {tUtils('clear')}
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        {COLOR_PRESETS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => handleChangeColor(c)}
                                className={`h-7 w-7 rounded-full border-2 transition ${formData.color?.toUpperCase() === c ? 'border-gray-900 ring-2 ring-offset-1 ring-gray-300' : 'border-white shadow'}`}
                                style={{ backgroundColor: c }}
                                aria-label={`Preset ${c}`}
                            />
                        ))}
                    </div>
                    {formErrors.color && (
                        <div className="text-red-500 text-sm">{formErrors.color as string}</div>
                    )}
                </div>


                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onCancel}>
                        {tUtils('cancel')}
                    </Button>
                    <Button type="button" onClick={() => handleSubmit()} className="bg-blue-500 hover:bg-blue-600">
                        {initialData ? tUtils('update') : tUtils('add')}
                    </Button>
                </div>
            </div>
            <IconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(icon, iconType) => {
                    setFormData((prev: any) => ({ ...prev, icon: icon }));
                    setFormData((prev: any) => ({ ...prev, iconType: iconType }));
                }}
            />
        </div>
    );
}
