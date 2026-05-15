import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";
import * as z from "zod";
import Switch from "@/components/form/switch/Switch";
import { Textarea } from "@/components/ui/textarea";
import { CategoryType } from "@/types/category-type";
import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { IconPickerModal } from "@/components/IconPickerModal";
import { unicodeToEmoji } from "@/lib/utils";
import { IconType } from "@/enums/icon-type.enum";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import Select from '@/components/form/Select';
import { toast } from "sonner";

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
    icon: z.string().optional(),
    iconType: z.nativeEnum(IconType).optional(),
    sortOrder: z.preprocess(
        (value) => (value === '' || value === null ? undefined : value),
        z.coerce.number().int().min(0).optional()
    ),
    code: z.string().optional(),
});

interface CategoryFormProps {
    initialData?: Category | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    categoryTypes: CategoryType[];
    selectedType?: CategoryType | null;
}

export function CategoryForm({ initialData, onSubmit, onCancel, categoryTypes, selectedType }: CategoryFormProps) {
    const t = useTranslations("CategoriesPage");
    const tUtils = useTranslations("Utils");
    const formSchema = formCategorySchema(t);
    if (initialData && initialData?.icon !== null) {
        initialData.icon = unicodeToEmoji(initialData.icon ?? '');
    }
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof z.infer<typeof formSchema>, string>>>({});
    const [formData, setFormData] = useState<z.infer<typeof formSchema>>(initialData ? {
        name: initialData.name,
        nameEN: initialData.nameEN || '',
        description: initialData.description,
        descriptionEN: initialData.descriptionEN || '',
        isActive: initialData.isActive,
        categoryTypeId: initialData.type.id.toString(),
        icon: initialData.icon,
        code: initialData.code || '',
        iconType: initialData.iconType || IconType.lucide,
        sortOrder: initialData.sortOrder || 1
    } : {
        name: "",
        nameEN: "",
        description: "",
        descriptionEN: "",
        isActive: true,
        categoryTypeId: "",
        icon: "",
        code: "",
        iconType: IconType.lucide,
        sortOrder: 1
    });
    if (selectedType) {
        formData.categoryTypeId = selectedType.id;
    }
    const handleSubmit = async () => {
        const isValid = formSchema.safeParse(formData);
        if (!isValid.success) {
            setFormErrors(isValid.error.flatten().fieldErrors as Partial<Record<keyof z.infer<typeof formSchema>, string>>);
            toast.error(t('validation.validationError'));
            return;
        }
        setFormErrors({});
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };
    const handleChangeCategoryTypeId = (value: any) => {
        setFormData((prev: any) => ({ ...prev, categoryTypeId: value }));
    };
    const handleChangeIsActive = (value: any) => {
        setFormData((prev: any) => ({ ...prev, isActive: value }));
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
