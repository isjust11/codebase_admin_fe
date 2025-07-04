'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Permission } from '@/types/permission';
import { 
  createPermission, 
  updatePermission, 
  getPermissionResources, 
  getPermissionActions, 
  getPermissionTemplates 
} from '@/services/auth-api';
import { useEffect, useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Tên quyền không được để trống'),
  description: z.string().optional(),
  code: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  featureId: z.number().optional(),
  isActive: z.boolean().default(true),
});

type PermissionFormProps = {
  permission?: Permission | null;
  onSuccess: () => void;
};

interface Resource {
  [key: string]: string;
}

interface Action {
  [key: string]: string;
}

interface PermissionTemplate {
  name: string;
  permissions: {
    action: string;
    name: string;
    code: string;
  }[];
}

export function PermissionForm({ permission, onSuccess }: PermissionFormProps) {
  const [resources, setResources] = useState<Resource>({});
  const [actions, setActions] = useState<Action>({});
  const [templates, setTemplates] = useState<{ [key: string]: PermissionTemplate }>({});
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isTemplateMode, setIsTemplateMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: permission?.name || '',
      code: permission?.code || '',
      description: permission?.description || '',
      action: permission?.action || '',
      resource: permission?.resource || '',
      featureId: permission?.featureId || undefined,
      isActive: permission?.isActive ?? true,
    },
  });

  // Fetch constants khi component mount
  useEffect(() => {
    fetchConstants();
  }, []);

  // Set selected resource và actions khi có permission data
  useEffect(() => {
    if (permission?.resource) {
      setSelectedResource(permission.resource);
    }
    if (permission?.action) {
      setSelectedActions([permission.action]);
    }
  }, [permission]);

  const fetchConstants = async () => {
    try {
      // Fetch resources
      const resourcesData = await getPermissionResources();
      setResources(resourcesData.resources);

      // Fetch actions
      const actionsData = await getPermissionActions();
      setActions(actionsData.actions);

      // Fetch templates
      const templatesData = await getPermissionTemplates();
      setTemplates(templatesData.templates);
    } catch (error) {
      console.error('Error fetching constants:', error);
      toast.error('Lỗi khi tải dữ liệu resources và actions');
    }
  };

  const handleResourceChange = (resource: string) => {
    setSelectedResource(resource);
    setSelectedActions([]);
    form.setValue('resource', resource);
    
    // Auto-generate code if using template
    if (isTemplateMode && templates[resource]) {
      const template = templates[resource];
      const action = selectedActions[0];
      if (action) {
        const permissionData = template.permissions.find(p => p.action === action);
        if (permissionData) {
          form.setValue('name', permissionData.name);
          form.setValue('code', permissionData.code);
        }
      }
    }
  };

  const handleActionToggle = (action: string) => {
    const newActions = selectedActions.includes(action) 
      ? selectedActions.filter(a => a !== action)
      : [...selectedActions, action];
    
    setSelectedActions(newActions);
    form.setValue('action', newActions[0] || '');

    // Auto-generate code if using template
    if (isTemplateMode && selectedResource && templates[selectedResource]) {
      const template = templates[selectedResource];
      const permissionData = template.permissions.find(p => p.action === action);
      if (permissionData) {
        form.setValue('name', permissionData.name);
        form.setValue('code', permissionData.code);
      }
    }
  };

  const getResourceDisplayName = (resourceKey: string) => {
    const resourceNames: { [key: string]: string } = {
      user: 'Người dùng',
      role: 'Vai trò',
      permission: 'Quyền',
      feature: 'Tính năng',
      article: 'Bài viết',
      category: 'Danh mục',
      order: 'Đơn hàng',
      payment: 'Thanh toán',
      reservation: 'Đặt bàn',
      table: 'Bàn',
      exam: 'Bài thi',
      question: 'Câu hỏi',
      media: 'Media',
      notification: 'Thông báo',
      history: 'Lịch sử',
      food_item: 'Món ăn',
    };
    return resourceNames[resourceKey] || resourceKey;
  };

  const getActionDisplayName = (actionKey: string) => {
    const actionNames: { [key: string]: string } = {
      CREATE: 'Tạo mới',
      READ: 'Xem',
      UPDATE: 'Cập nhật',
      DELETE: 'Xóa',
      EXPORT: 'Xuất',
      IMPORT: 'Nhập',
      APPROVE: 'Phê duyệt',
      REJECT: 'Từ chối',
      PUBLISH: 'Xuất bản',
      BLOCK: 'Khóa',
      UNBLOCK: 'Mở khóa',
      ASSIGN: 'Phân quyền',
      UPLOAD: 'Tải lên',
      DOWNLOAD: 'Tải xuống',
    };
    return actionNames[actionKey] || actionKey;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (permission) {
        await updatePermission(permission.id, values);
        toast.success('Cập nhật quyền thành công');
      } else {
        await createPermission(values);
        toast.success('Tạo quyền thành công');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-4 mb-6">
          <Button
            type="button"
            variant={!isTemplateMode ? "default" : "outline"}
            onClick={() => setIsTemplateMode(false)}
          >
            Tạo thủ công
          </Button>
          <Button
            type="button"
            variant={isTemplateMode ? "default" : "outline"}
            onClick={() => setIsTemplateMode(true)}
          >
            Sử dụng template
          </Button>
        </div>

        {isTemplateMode ? (
          // Template Mode
          <div className="space-y-6">
            {/* Resource Selection */}
            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select value={selectedResource} onValueChange={handleResourceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn resource..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(resources).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {getResourceDisplayName(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Selection */}
            {selectedResource && templates[selectedResource] && (
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <div className="space-y-3">
                      {templates[selectedResource].permissions.map((permission) => (
                        <div key={permission.action} className="flex items-center space-x-3">
                          <Checkbox
                            id={permission.action}
                            checked={selectedActions.includes(permission.action)}
                            onCheckedChange={() => handleActionToggle(permission.action)}
                          />
                          <label
                            htmlFor={permission.action}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getActionDisplayName(permission.action)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{permission.name}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        ) : (
          // Manual Mode
          <div className="space-y-6">
            {/* Resource Selection */}
            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn resource..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(resources).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {getResourceDisplayName(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Selection */}
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(actions).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {getActionDisplayName(value)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Common Fields */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên quyền</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên quyền" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã quyền</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mã quyền" {...field} />
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
                <Textarea
                  placeholder="Nhập mô tả cho quyền này"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Kích hoạt</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit">
            {permission ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 