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
import { useTranslations } from 'next-intl';

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
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const id = params.id as string;
  const t = useTranslations('UsersPage');
  const tUtils = useTranslations('Utils');

  const title = isView ? t('viewDetail') : (id ? t('edit') : t('add'));
  
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadUser(id.toString());
    }
  }, [id]);

  const loadUser = async (id: string) => {
    setIsLoadingUser(true);
    try {
      const userData = await userApi.getById(id);
      setUser(userData);
    } catch (_error) {
      toast.error(t('fetchError'));
      router.push('/manager/admin/users');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = async () => {
    if (!formValues) {
      toast.error(t('fillAllInfo'));
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
      };

      if (isEditing) {
        await userApi.update(id, submitData);
        toast.success(t('updateSuccess'));
      } else {
        await userApi.create(submitData);
        toast.success(t('addSuccess'));
      }
      router.push('/manager/admin/users');
    } catch (_error) {
        toast.error(isEditing ? t('updateError') : t('addError'));
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
      title: tUtils('back'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    }
  ] : [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: tUtils('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? tUtils('update') : tUtils('add'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={title} items={[
        { title: t('userList'), href: '/manager/admin/users' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <div className="space-y-2">
                {isLoadingUser ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">{t('loading')}</span>
                  </div>
                ) : (
                  <UserFormInput 
                    user={user} 
                    onCancel={() => {}} 
                    onFormChange={(values) => setFormValues(values)}
                    isView={isView}
                  />
                )}
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default UserForm; 