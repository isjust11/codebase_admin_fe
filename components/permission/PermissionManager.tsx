import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';


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

  useEffect(() => {
    fetchConstants();
  }, []);

  const fetchConstants = async () => {
    try {
      setLoading(true);
      
      // Fetch resources
      const resourcesResponse = await fetch('/api/permissions/constants/resources');
      const resourcesData = await resourcesResponse.json();
      setResources(resourcesData.resources);

      // Fetch actions
      const actionsResponse = await fetch('/api/permissions/constants/actions');
      const actionsData = await actionsResponse.json();
      setActions(actionsData.actions);

      // Fetch templates
      const templatesResponse = await fetch('/api/permissions/constants/templates');
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates);

    } catch (error) {
      console.error('Error fetching constants:', error);
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
      alert('Vui lòng chọn resource và ít nhất một action');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/permissions/create-from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: selectedResource,
          selectedActions: selectedActions,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Đã tạo ${result.length} permission thành công!`);
        setSelectedActions([]);
      } else {
        alert('Có lỗi xảy ra khi tạo permission');
      }
    } catch (error) {
      console.error('Error creating permissions:', error);
      alert('Có lỗi xảy ra khi tạo permission');
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Phân quyền</h1>
        <Button onClick={fetchConstants} variant="outline">
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Chọn Resource</CardTitle>
          </CardHeader>
          <CardContent>
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

            {selectedResource && templates[selectedResource] && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">
                  {templates[selectedResource].name}
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn các quyền bạn muốn tạo cho resource này
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Chọn Actions
              {selectedResource && templates[selectedResource] && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSelectAll}>
                    Chọn tất cả
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                    Bỏ chọn tất cả
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedResource && templates[selectedResource] ? (
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
                        <Badge variant="secondary" className="text-xs">
                          {permission.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{permission.name}</p>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Vui lòng chọn resource trước</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Actions Summary */}
      {selectedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quyền sẽ được tạo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedActions.map((action) => {
                const permission = templates[selectedResource]?.permissions.find(
                  p => p.action === action
                );
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