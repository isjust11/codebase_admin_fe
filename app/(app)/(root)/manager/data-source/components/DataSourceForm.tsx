import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DataSource, DataSourceType, DataSourceTypeOption } from "@/types/data-source";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Switch from "@/components/form/switch/Switch";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

const formDataSourceSchema = (t: any) => z.object({
    name: z.string().min(1, {
        message: t('validation.nameMinLength'),
    }),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.nativeEnum(DataSourceType, {
        required_error: t('validation.typeRequired'),
    }),
    url: z.string().url().optional().or(z.literal("")),
    author: z.string().optional(),
    publisher: z.string().optional(),
    publishDate: z.string().optional(),
    isbn: z.string().optional(),
    doi: z.string().optional(),
    citation: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean(),
});

interface DataSourceFormProps {
    initialData?: DataSource | null;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    dataSourceTypes: DataSourceTypeOption[];
}

export function DataSourceForm({ initialData, onSubmit, onCancel, dataSourceTypes }: DataSourceFormProps) {
    const t = useTranslations("DataSourcePage");
    const tUtils = useTranslations("Utils");
    const formSchema = formDataSourceSchema(t);
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
            ? {
                ...initialData,
                isActive: initialData.isActive || true,
                publishDate: initialData.publishDate || "",
            }
            : {
                name: "",
                title: "",
                description: "",
                type: DataSourceType.OTHER,
                url: "",
                author: "",
                publisher: "",
                publishDate: "",
                isbn: "",
                doi: "",
                citation: "",
                notes: "",
                isActive: true,
            },
    });

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('name')} *</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterName')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('type')} *</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectType')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-60 overflow-y-auto bg-white z-[999991]">
                                        {dataSourceTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value} className="hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300 cursor-pointer">
                                                {type.label}
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
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('dataTitle')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterTitle')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('url')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterUrl')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('author')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterAuthor')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="publisher"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('publisher')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterPublisher')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="publishDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('publishDate')}</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date"
                                        className="input-focus" 
                                        placeholder={t('enterPublishDate')} 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isbn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('isbn')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterIsbn')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="doi"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('doi')}</FormLabel>
                                <FormControl>
                                    <Input className="input-focus" placeholder={t('enterDoi')} {...field} />
                                </FormControl>
                                <FormMessage className="text-red-500"/>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('description')}</FormLabel>
                            <FormControl>
                                <Textarea className="input-focus" placeholder={t('enterDescription')} {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="citation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('citation')}</FormLabel>
                            <FormControl>
                                <Textarea className="input-focus" placeholder={t('enterCitation')} {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500"/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('notes')}</FormLabel>
                            <FormControl>
                                <Textarea className="input-focus" placeholder={t('enterNotes')} {...field} />
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
                                label={t('status')}
                                defaultChecked={field.value}
                                {...field}
                            />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onCancel}>
                        {tUtils('cancel')}
                    </Button>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                        {initialData ? tUtils('update') : tUtils('add')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
