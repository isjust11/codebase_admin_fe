import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createTable, updateTable } from '@/services/manager-api';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Action } from '@/types/actions';
import { Plus, Save, X } from 'lucide-react';
import { Role } from '@/types/role';
import { createRole, getRole, updateRole } from '@/services/auth-api';
import { RoleFormInput } from './RoleFormInput';
import AssignHandleForm from './AssignHandleForm';
import RolePermissionSummary from './RolePermissionSummary';
import { useTranslations } from 'next-intl';

interface RoleFormProps {
  isView?: boolean;
}

const RoleForm = ({ isView = false }: RoleFormProps) => {
  const t = useTranslations('RolesPage');
  const tUtils = useTranslations('Utils');
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<Role>();
  const [formValues, setFormValues] = useState<any>(null);
  const [assignFeatures, setAssignFeatures] = useState<string[]>([]);
  const id = params.id as string;

  const title = isView ? t('viewDetail') : (id ? t('updateRole') : t('addRole'));
  
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      loadRole(id.toString());
    }
  }, [id]);

  const loadRole = async (id: string) => {
    try {
      const roleData = await getRole(id);
      setRole(roleData);
      setAssignFeatures(roleData.features?.map(item => item.id)??[]);
    } catch (_error) {
      toast.error(t('cannotLoadRoleInformation'));
      router.push('/manager/admin/roles');
    }
  };

  const handleSubmit = async () => {
    if (!formValues) {
      toast.error(t('pleaseFillAllInformation'));
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formValues,
      };

      if (isEditing) {
        await updateRole(id, submitData);
        toast.success(t('updateSuccess'));
      } else {
        await createRole(submitData);
        toast.success(t('addSuccess'));
      }
      router.push('/manager/admin/roles');
    } catch (_error) {
      toast.error(isEditing ? t('updateError') : t('addError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLstAssign = (
   values: any[] | string[],
  ) => {
    setAssignFeatures(values);
    setFormValues((prev: any) => ({
      ...prev,
      features: values,
    }));
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
        { title: t('roles'), href: '/manager/roles' },
        { title: '', href: '#' }
      ]} />
      <div className="space-y-2">
        <ComponentCard title={title} listAction={listAction}>
          <div className="flex flex-col space-y-4">
            {/* Phần input form */}
            <div className="w-full">
              <div className="space-y-2">
                <RoleFormInput 
                  role={role} 
                  onCancel={() => {}} 
                  onFormChange={(values) => setFormValues(values)}
                  isView={isView}
                />
              </div>
            </div>

            {/* Phần assign handle form */}
            <div className="w-full">
              <AssignHandleForm
                assignedItems={assignFeatures}
                onChange={handleChangeLstAssign}
                isView={isView}
              />
            </div>

            {/* Phần permission summary */}
            {role && (
              <div className="w-full">
                <RolePermissionSummary
                  role={role}
                  onManagePermissions={() => router.push(`/manager/admin/roles/${role.id}/permissions`)}
                />
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}

export default RoleForm;
