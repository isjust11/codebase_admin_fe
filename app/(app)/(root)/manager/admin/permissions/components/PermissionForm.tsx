import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { Permission } from '@/types/permission';
import { createPermission, getPermission, updatePermission } from '@/services/auth-api';
import { useTranslations } from 'next-intl';
import PermissionFormInput from './PermissionFormInput';

interface PermissionFormProps {
  isView?: boolean;
}

const PermissionForm = ({ isView = false }: PermissionFormProps) => {
  const t = useTranslations('PermissionsPage');
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [permission, setPermission] = useState<Permission>();
  const [formValues, setFormValues] = useState<any>(null);
  const id = params.id as string;

  const title = isView ? t('permissionDetail') : (id ? t('updatePermission') : t('addPermissionNew'));
  const formRef = useRef<{ validate: () => boolean }>(null);
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadPermission(id.toString());
    }
  }, [id]);

  const loadPermission = async (id: string) => {
    try {
      const permissionData = await getPermission(id);
      setPermission(permissionData);
    } catch (_error) {
      toast.error(t('loadError'));
      router.push('/manager/admin/permissions');
    }
  };

  const handleSubmit = async () => {
    if (!formRef.current?.validate()) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
      };

      if (isEditing) {
        await updatePermission(id, submitData);
        toast.success(t('updateSuccess'));
      } else {
        await createPermission(submitData);
        toast.success(t('createSuccess'));
      }
      router.push('/manager/admin/permissions');
    } catch (_error) {
      toast.error(isEditing ? t('updateError') : t('createError'));
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
      title: t('back'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    }
  ] : [
    {
      icon: <X className="h-4 w-4" />,
      onClick: () => {
        router.back();
      },
      title: t('cancel'),
      className: "hover:bg-gray-100 dark:hover:bg-gray-500 rounded-md transition-colors text-gray-300",
      variant: 'outline'
    },
    {
      icon: isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />,
      onClick: () => handleSubmit(),
      title: isEditing ? t('update') : t('add'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
      isLoading: loading
    },
  ];

  return (
    <div>
      <PageBreadcrumb pageTitle={title} items={[
        { title: t('permissionList'), href: '/manager/admin/permissions' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex flex-col space-y-4">
            <div className="w-full">
              <div className="space-y-2">
                <PermissionFormInput 
                  ref={formRef}
                  permission={permission} 
                  onCancel={() => {}} 
                  onFormChange={(values: any) => setFormValues(values)}
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

export default PermissionForm; 