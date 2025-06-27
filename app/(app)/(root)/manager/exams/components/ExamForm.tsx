import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Exam } from "@/types/exam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Switch from "@/components/form/switch/Switch";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Tiêu đề phải có ít nhất 2 ký tự.",
    }),
    description: z.string().optional(),
    isActive: z.boolean(),
});

interface ExamFormProps {
    initialData?: Exam | null;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    onCancel: () => void;
}

export function ExamForm({ initialData, onSubmit, onCancel }: ExamFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                isActive: initialData.isActive || false,
            }
            : {
                title: "",
                description: "",
                isActive: true,
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
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên bài thi</FormLabel>
                            <FormControl>
                                <Input className="input-focus" placeholder="Nhập tên bài thi" {...field} />
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
                    name="isActive"
                    render={({ field }) => (
                        <FormItem>
                             <Switch
                                label="Trạng thái"
                                defaultChecked={field.value}
                                {...field}
                            />
                        </FormItem>
                    )}
                />


                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                        {initialData ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}