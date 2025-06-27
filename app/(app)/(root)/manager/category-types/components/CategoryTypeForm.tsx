import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CategoryType } from "@/types/category-type"
import Switch from "@/components/form/switch/Switch"
import {  icons, SmilePlus } from "lucide-react"
import { useState } from "react";
import { IconPickerModal } from "@/components/IconPickerModal"
import { emojiToUnicode, unicodeToEmoji } from "@/lib/utils"
import { AppCategoryCode } from "@/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconType } from "@/enums/icon-type.enum"
import { Slider } from "@radix-ui/react-slider"
import { Icon } from "@/components/ui/icon"

const formSchema = z.object({
  code: z.string().min(2, {
    message: "Mã loại phải có ít nhất 2 ký tự.",
  }),
  name: z.string().min(2, {
    message: "Tên loại phải có ít nhất 2 ký tự.",
  }),
  description: z.string().optional(),
  iconType: z.nativeEnum(IconType).optional(),
  isActive: z.boolean(),
  icon: z.string().optional(),
})

interface CategoryTypeFormProps {
  initialData?: CategoryType;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export function CategoryTypeForm({ initialData, onSubmit, onCancel }: CategoryTypeFormProps) {
  const [iconSize, setIconSize] = useState(20);
  if (initialData && initialData?.icon !== null) {
    initialData.icon = unicodeToEmoji(initialData.icon ?? '');
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: "",
      name: "",
      description: "",
      iconType: IconType.lucide,
      isActive: true,
      icon: "",
    },
  })
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
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
                  {Object.entries(AppCategoryCode).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-start items-center">
                        <span className="text-sm text-gray-500">{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên loại</FormLabel>
              <FormControl>
                <Input className="input-focus" placeholder="Nhập tên loại" {...field} />
              </FormControl>
              <FormMessage />
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
                  {
                    form.getValues('iconType') == IconType.emoji ?
                      <FormControl>
                        <Input
                          disabled
                          className="input-focus"
                          {...field}
                          value={unicodeToEmoji(field.value || "")}
                          placeholder="Chọn icon"
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
                            defaultValue={[20]}
                            max={40}
                            step={1}
                            onValueChange={(value) => {
                              setIconSize(value[0]);
                              // form.setValue("iconSize", value[0]);
                            }}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Kích thước: {iconSize}px
                          </div>
                        </div>)}
                      </div>

                  }
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-10 p-0"
                    onClick={() => setIsIconPickerOpen(true)}
                  >
                    <SmilePlus className="h-4 w-4 text-amber-300" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            {initialData ? "Cập nhật" : "Tạo mới"}
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
  )
}

