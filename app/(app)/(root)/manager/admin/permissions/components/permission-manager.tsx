'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getPermissionResources, 
  getPermissionActions, 
  getPermissionTemplates,
  createPermissionFromTemplate 
} from '@/services/auth-api';
import { DataTable } from '@/components/DataTable';
import type { ColumnDef } from '@tanstack/react-table';

interface PermissionTemplate {
  name: string;
  permissions: {
    action: string;
    name: string;
    code: string;
  }[];
}

interface Resource {
  [key: string]: string;
}

interface Action {
  [key: string]: string;
}

const PermissionManager: React.FC = () => {
  const [resources, setResources] = useState<Resource>({});
  const [actions, setActions] = useState<Action>({});
  const [templates, setTemplates] = useState<{ [key: string]: PermissionTemplate }>({});
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    fetchConstants();
  }, []);

  useEffect(() => {
    // Update table data when resource or templates change
    if (selectedResource && templates[selectedResource]) {
      setTableData(
        templates[selectedResource].permissions.map((p) => ({
          ...p,
          resource: selectedResource,
        }))
      );
    } else {
      setTableData([]);
    }
  }, [selectedResource, templates]);

  const fetchConstants = async () => {
    try {
      setLoading(true);
      
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
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceChange = (resource: string) => {
    setSelectedResource(resource);
    setSelectedActions([]);
  };

  const handleActionToggle = (action: string) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const handleSelectAll = () => {
    if (selectedResource && templates[selectedResource]) {
      const allActions = templates[selectedResource].permissions.map(p => p.action);
      setSelectedActions(allActions);
    }
  };

  const handleDeselectAll = () => {
    setSelectedActions([]);
  };

  const handleCreatePermissions = async () => {
    if (!selectedResource || selectedActions.length === 0) {
      toast.error('Vui lòng chọn resource và ít nhất một action');
      return;
    }

    try {
      setLoading(true);
      const result = await createPermissionFromTemplate({
        resource: selectedResource,
        selectedActions: selectedActions,
      });
      
      toast.success(`Đã tạo ${result.length} permission thành công!`);
      setSelectedActions([]);
    } catch (error: any) {
      console.error('Error creating permissions:', error);
      toast.error('Có lỗi xảy ra khi tạo permission: ' + error.message);
    } finally {
      setLoading(false);
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

  // Table columns
  const columns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)
          }
          onCheckedChange={(value) => {
            if (value) {
              setSelectedActions(tableData.map((row) => row.action));
            } else {
              setSelectedActions([]);
            }
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedActions.includes(row.original.action)}
          onCheckedChange={() => handleActionToggle(row.original.action)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 32,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => getActionDisplayName(row.original.action),
    },
    {
      accessorKey: 'name',
      header: 'Tên quyền',
    },
    {
      accessorKey: 'code',
      header: 'Mã quyền',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => row.original.name,
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Phân quyền theo Template</h1>
        <Button onClick={fetchConstants} variant="outline">
          Làm mới
        </Button>
      </div>
      <div className="mb-4">
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
      </div>
      {/* DataTable for actions */}
      <div className="border rounded-lg bg-white">
        <DataTable
          columns={columns}
          data={tableData}
          allowPagination={false}
        />
      </div>
      {/* Selected Actions Summary & Create Button */}
      {selectedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quyền sẽ được tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedActions.map((action) => {
                const permission = tableData.find((p) => p.action === action);
                return (
                  <Badge key={action} variant="default">
                    {permission?.name || getActionDisplayName(action)}
                  </Badge>
                );
              })}
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleCreatePermissions}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Đang tạo...' : `Tạo ${selectedActions.length} quyền`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Resource Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin về Resources và Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Resources có sẵn:</h3>
              <div className="space-y-2">
                {Object.entries(resources).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline">{value}</Badge>
                    <span className="text-sm">{getResourceDisplayName(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Actions có sẵn:</h3>
              <div className="space-y-2">
                {Object.entries(actions).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="outline">{value}</Badge>
                    <span className="text-sm">{getActionDisplayName(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManager; 