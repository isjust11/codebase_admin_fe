import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User } from '@/services/user-api';
import { getRoles } from '@/services/auth-api';
import { Role } from '@/types/role';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

const formSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  fullName: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  isAdmin: z.boolean(),
  roleIds: z.array(z.number()).optional(),
});

type UserFormProps = {
  user?: User | null;
  onCancel: () => void;
  onFormChange?: (values: z.infer<typeof formSchema>) => void;
  isView?: boolean;
};

export function UserFormInput({ user, onFormChange, isView = false }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || '',
      password: '',
      fullName: user?.fullName || '',
      email: user?.email || '',
      isAdmin: user?.isAdmin || false,
      roleIds: user?.roles?.map(role => Number(role.id)) || [],
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (_error) {
        // Handle error
      }
    };

    fetchRoles();
  }, []);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        password: '',
        fullName: user.fullName || '',
        email: user.email || '',
        isAdmin: user.isAdmin,
        roleIds: user.roles?.map(role => Number(role.id)) || [],
      });
    }
  }, [user, form]);

  // Gửi giá trị ban đầu của form
  useEffect(() => {
    const initialValues = form.getValues();
    onFormChange?.(initialValues);
  }, [user]);

  // Theo dõi sự thay đổi của form
  useEffect(() => {
    const subscription = form.watch((value) => {
      onFormChange?.(value as z.infer<typeof formSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onFormChange]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên đăng nhập</FormLabel>
              <FormControl>
                <Input className='input-focus' placeholder="Nhập tên đăng nhập" {...field} disabled={isView || !!user} />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {user ? 'Mật khẩu mới (để trống nếu không muốn thay đổi)' : 'Mật khẩu'}
              </FormLabel>
              <FormControl>
                <Input 
                  className='input-focus' 
                  type="password" 
                  placeholder="Nhập mật khẩu" 
                  {...field} 
                  disabled={isView}
                />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>
              <FormControl>
                <Input className='input-focus' placeholder="Nhập họ tên" {...field} disabled={isView} />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input className='input-focus' type="email" placeholder="Nhập email" {...field} disabled={isView} />
              </FormControl>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roleIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quyền</FormLabel>
              <div className="flex flex-col gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value?.includes(Number(role.id)) || false}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...(field.value || []), Number(role.id)]);
                        } else {
                          field.onChange((field.value || []).filter((id) => id !== Number(role.id)));
                        }
                      }}
                      disabled={isView}
                    />
                    {role.name}
                  </label>
                ))}
              </div>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isView}
                />
              </FormControl>
              <FormLabel>Quyền quản trị viên</FormLabel>
              <FormMessage className='text-red-500'/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
} 