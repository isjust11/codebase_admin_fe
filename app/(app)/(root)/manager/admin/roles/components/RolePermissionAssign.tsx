import { useEffect, useState } from 'react';
import AssignHandleForm from './AssignHandleForm';
import { getFeaturesByRole, assignRoleFeatures } from '@/services/auth-api';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function RolePermissionAssign() {
  const params = useParams();
  const roleId = params.id as string;
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAssigned() {
      setLoading(true);
      try {
        const features = await getFeaturesByRole(roleId);
        setAssigned(features.map((f: any) => f.id));
      } catch (err: any) {
        toast.error('Lỗi khi tải danh sách chức năng: ' + err.message);
      }
      setLoading(false);
    }
    if (roleId) fetchAssigned();
  }, [roleId]);

  const handleChange = (newAssigned: string[]) => {
    setAssigned(newAssigned);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignRoleFeatures(roleId, assigned);
      toast.success('Cập nhật chức năng cho vai trò thành công!');
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật chức năng: ' + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div>Đang tải danh sách chức năng...</div>;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Gán chức năng (permission) cho vai trò</h3>
      <AssignHandleForm assignedItems={assigned} onChange={handleChange} />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-60"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  );
} 