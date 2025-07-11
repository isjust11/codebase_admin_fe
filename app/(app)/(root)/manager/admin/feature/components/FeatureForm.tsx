import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from "@/components/form/switch/Switch";
import { Feature } from "@/types/feature";
import { useEffect, useState } from "react";
import { SmilePlus } from "lucide-react";
import { IconPickerModal } from "@/components/IconPickerModal";
import { emojiToUnicode, getFeatureType, unicodeToEmoji } from "@/lib/utils";
import { IconType } from "@/enums/icon-type.enum";
import { Icon } from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/types/category";
import { getCategoryByCode } from "@/services/manager-api";
import { AppCategoryCode } from "@/constants";
import { useTranslations } from "next-intl";

const formSchema = z.object({
    label: z.string().min(2, {
        message: "Tên chức năng phải có ít nhất 2 ký tự.",
    }),
    link: z.string().min(2, {
        message: "Đường dẫn phải có ít nhất 2 ký tự.",
    }),
    isActive: z.boolean(),
    sortOrder: z.string().optional(),
    roles: z.array(z.string()).optional(),
    icon: z.string().optional(),
    iconSize: z.number().optional().default(20),
    className: z.string().optional().default(''),
    iconType: z.nativeEnum(IconType),
    parentId: z.string().optional(),
    featureTypeId: z.string().optional(),
});

interface FeatureFormProps {
    initialData?: Feature | null;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    onCancel: () => void;
    featureParents: Feature[];
    featureParent?: Feature;
}

export function FeatureForm({ initialData, onSubmit, onCancel, featureParents, featureParent }: FeatureFormProps) {
    const t = useTranslations('FeaturePage');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [iconType, setIconType] = useState(IconType.lucide);
    const [iconSize, setIconSize] = useState(20)
    const [featureType, setFeatureType] = useState<Category[]>([]);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                isActive: initialData.isActive ?? true,
                icon: initialData.icon ? unicodeToEmoji(initialData.icon) : "",
                parentId: initialData.parentId ? initialData.parentId.toString() : "",
                roles: initialData.roles?.map((role) => role.id) || [],
                sortOrder: initialData.sortOrder ? String(initialData.sortOrder) : "0",
                link: initialData.link || "",
                label: initialData.label || "",
                iconSize: initialData.iconSize || 20,
                className: initialData.className || "",
                iconType: initialData.iconType || IconType.lucide,
                featureTypeId: initialData.featureTypeId || ""
            }
            : {
                label: "",
                link: "",
                isActive: true,
                icon: "",
                parentId: featureParent?.id ?? '',
                roles: [],
                sortOrder: "0",
                iconSize: 20,
                className: "",
                iconType: IconType.lucide,
                featureTypeId: ""
            },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        // Đảm bảo sortOrder là số
        values.sortOrder = values.sortOrder || "0";
        onSubmit(values);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loadFeatureType = async () => {
                const data = await getCategoryByCode(getFeatureType());
                setFeatureType(data);
                if (data.length > 0) {
                    const menuFeature = data.find((x) => x.code == AppCategoryCode.FEATURE_MENU)
                    form.setValue("featureTypeId", menuFeature?.id);
                }
            };
            loadFeatureType();
        }
    }, []);
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('name')}</FormLabel>
                            <FormControl>
                                <Input className="input-focus" placeholder={t('namePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="featureTypeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('featureType')}</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectFeatureType')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[999991]">
                                        {featureType.length > 0 ? featureType.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                <div className="flex flex-start items-center">
                                                    <span className="text-2xl mr-2">
                                                        {
                                                            type.iconType == "lucide" ?
                                                                type.icon && (
                                                                    <Icon name={type.icon} />
                                                                ) :
                                                                unicodeToEmoji(type.icon)
                                                        }
                                                    </span>
                                                    <span className="text-sm text-gray-500">{type.name}</span>
                                                </div>
                                            </SelectItem>
                                        )) : (
                                            <div className="flex flex-start items-center">
                                                <span className="text-sm px-2 py-2">
                                                    {t('noData')}
                                                </span>
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('link')}</FormLabel>
                            <FormControl>
                                <Input className="input-focus" placeholder={t('linkPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <div className="flex flex-start items-center gap-2">
                    <FormField
                        control={form.control}
                        name="parentId"
                        render={({ field }) => (
                            <FormItem className="w-2/3">
                                <FormLabel>{t('parentCategory')}</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectParentCategory')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[999991]">
                                        {featureParents.length == 0 && (
                                            <div className="flex flex-start items-center">
                                                <span className="text-sm px-2 py-2">
                                                    {t('noData')}
                                                </span>
                                            </div>
                                        )}
                                        {featureParents.map((parent) => (
                                            <SelectItem key={parent.id} value={parent.id}>
                                                <div className="flex flex-start items-center">
                                                    <span className="text-2xl mr-2">
                                                        {parent.iconType === IconType.emoji
                                                            ? parent.icon && unicodeToEmoji(parent.icon)
                                                            : parent.icon && (
                                                                <Icon
                                                                    name={parent.icon}
                                                                    size={parent.iconSize}
                                                                    className={parent.className}
                                                                />
                                                            )
                                                        }
                                                    </span>
                                                    <span className="text-sm text-gray-500">{parent.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                            <FormItem className="w-1/3">
                                <FormLabel>{t('sortOrder')}</FormLabel>
                                <FormControl>
                                    <Input
                                        className="input-focus"
                                        type="text"
                                        placeholder={t('sortOrderPlaceholder')}
                                        {...field}
                                        value={field.value || "0"}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-between items-center gap-2">
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2 items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 w-10 p-0"
                                        onClick={() => setIsIconPickerOpen(true)}
                                    >
                                        <SmilePlus className="h-4 w-4" />
                                    </Button>
                                    {
                                        form.getValues('iconType') == IconType.emoji ?
                                            <FormControl>
                                                <Input
                                                    disabled
                                                    className="input-focus"
                                                    {...field}
                                                    value={unicodeToEmoji(field.value || "")}
                                                    placeholder={t('selectIcon')}
                                                />
                                            </FormControl>
                                            :
                                            <div className="flex items-center gap-2">
                                                <div className="h-12 w-12 flex items-center justify-center
                                             hover:bg-gray-100 ring-1 ring-gray-100 shadow-2xl rounded-sm">
                                                    <Icon name={field.value ?? ''} size={iconSize} />
                                                </div>
                                                {field.value && (<div className="flex-1" >
                                                    <Slider
                                                        className="[&_.slider-track]:bg-gray-200 [&_.slider-range]:bg-blue-500 [&_.slider-thumb]:bg-white [&_.slider-thumb]:border-2 [&_.slider-thumb]:border-blue-500"
                                                        defaultValue={[iconSize]}
                                                        max={40}
                                                        step={1}
                                                        onValueChange={(value) => {
                                                            setIconSize(value[0]);
                                                            form.setValue("iconSize", value[0]);
                                                        }}
                                                    />
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {t('iconSize')}: {iconSize}px
                                                    </div>
                                                </div>)}
                                            </div>

                                    }

                                </div>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem>
                                <Switch
                                    label={t('status')}
                                    defaultChecked={field.value}
                                    {...field}
                                />
                            </FormItem>
                        )}
                    />
                </div>


                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onCancel}>
                        {t('cancel')}
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                        {initialData ? t('update') : t('add')}
                    </Button>
                </div>


            </form>
            <IconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                onSelect={(icon, iconType) => {
                    console.log('icon type:' + iconType);
                    setIconType(iconType);
                    form.setValue("icon", icon);
                    form.setValue("iconType", iconType);
                }}
            />
        </Form>
    );
}
