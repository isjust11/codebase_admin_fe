import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { User } from '@/services/user-api';
import { userApi } from '@/services/user-api';
import { UserFormInput } from './UserFormInput';

interface UserFormProps {
  isView?: boolean;
}

const UserForm = ({ isView = false }: UserFormProps) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User>();
  const [formValues, setFormValues] = useState<any>(null);
  const id = params.id as string;

  const title = isView ? 'Chi tiết người dùng' : (id ? 'Cập nhật người dùng' : 'Thêm người dùng');
  
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadUser(id.toString());
    }
  }, [id]);

  const loadUser = async (id: string) => {
    try {
      const userData = await userApi.getById(Number(id));
      setUser(userData);
    } catch (_error) {
      toast.error('Không thể tải thông tin người dùng');
      router.push('/manager/admin/users');
    }
  };

  const handleSubmit = async () => {
    if (!formValues) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
      };

      if (isEditing) {
        await userApi.update(Number(id), submitData);
        toast.success('Người dùng đã được cập nhật thành công');
      } else {
        await userApi.create(submitData);
        toast.success('Người dùng đã được thêm thành công');
      }
      router.push('/manager/admin/users');
    } catch (_error) {
      toast.error(isEditing ? 'Có lỗi xảy ra khi cập nhật người dùng' : 'Có lỗi xảy ra khi thêm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const listAction: Action[] = isView ? [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: "Quay lại",
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    }
  ] : [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: "Hủy",
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? "Cập nhật" : "Thêm mới",
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={title} items={[
        { title: 'Danh sách người dùng', href: '/manager/admin/users' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <div className="space-y-2">
                <UserFormInput 
                  user={user} 
                  onCancel={() => {}} 
                  onFormChange={(values) => setFormValues(values)}
                  isView={isView}
                />
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default UserForm; 