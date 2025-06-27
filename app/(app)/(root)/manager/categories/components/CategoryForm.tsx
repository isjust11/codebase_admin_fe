import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Category } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from "@/components/form/switch/Switch";
import { Textarea } from "@/components/ui/textarea";
import { CategoryType } from "@/types/category-type";
import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { IconPickerModal } from "@/components/IconPickerModal";
import { unicodeToEmoji } from "@/lib/utils";
import { IconType } from "@/enums/icon-type.enum";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Tên loại phải có ít nhất 2 ký tự.",
    }),
    description: z.string().optional(),
    isActive: z.boolean(),
    categoryTypeId: z.string({
        required_error: "Vui lòng chọn loại danh mục",
    }),
    icon: z.string().optional(),
    iconType: z.nativeEnum(IconType).optional(),
    code: z.string().optional(),
});

interface CategoryFormProps {
    initialData?: Category | null;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    onCancel: () => void;
    categoryTypes: CategoryType[];
}

export function CategoryForm({ initialData, onSubmit, onCancel, categoryTypes }: CategoryFormProps) {
    if (initialData && initialData?.icon !== null) {
        initialData.icon = unicodeToEmoji(initialData.icon ?? '');
    }
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                isActive: initialData.isActive || true,
                icon: initialData.icon || "",
                categoryTypeId: initialData.categoryType.id,
                iconType: initialData.iconType
            }
            : {
                name: "",
                description: "",
                isActive: true,
                categoryTypeId: "",
                icon: "",
                code: "",
                iconType: IconType.lucide
            },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên danh mục</FormLabel>
                            <FormControl>
                                <Input className="input-focus" placeholder="Nhập tên danh mục" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mã danh mục</FormLabel>
                            <FormControl>
                                <Input className="input-focus" placeholder="Nhập mã danh mục" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl>
                                <Textarea className="input-focus" placeholder="Nhập mô tả" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryTypeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Loại danh mục</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại danh mục" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto bg-white z-[999991]">
                                    {categoryTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            <div className="flex flex-start items-center">
                                                <span className="text-2xl mr-2"> {type.icon && unicodeToEmoji(type.icon)}</span>
                                                <span className="text-sm text-gray-500">{type.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex flex-start items-center gap-2">
                    <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <Switch
                                    label="Trạng thái"
                                    defaultChecked={field.value}
                                    {...field}
                                />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                            <FormItem className="w-1/2">
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            disabled
                                            className="input-focus"
                                            {...field}
                                            value={field.value || ""}
                                            placeholder="Chọn icon"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 w-10 p-0"
                                        onClick={() => setIsIconPickerOpen(true)}
                                    >
                                        <SmilePlus className="h-4 w-4 text-amber-300" />
                                    </Button>
                                </div>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                </div>


                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                        {initialData ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </form>
            <IconPickerModal
                    isOpen={isIconPickerOpen}
                    onClose={() => setIsIconPickerOpen(false)}
                    onSelect={(icon, iconType) => {
                        form.setValue("icon", icon);
                        form.setValue("iconType", iconType)
                    }}
                />
        </Form>
    );
}