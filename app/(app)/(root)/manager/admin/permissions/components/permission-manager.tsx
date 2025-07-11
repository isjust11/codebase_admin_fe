'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
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
import { useTranslations } from 'next-intl';

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

const PermissionManager = forwardRef<{ refresh: () => void }, { ref: React.RefObject<{ refresh: () => void }> }>((props, ref) => {
  const t = useTranslations('PermissionsPage');
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

  useImperativeHandle(ref, () => ({
    refresh: () => {
      fetchConstants();
    }
  }));

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
      toast.error(t('errorFetchingData'));
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
      toast.error(t('pleaseSelectResourceAndAction'));
      return;
    }

    try {
      setLoading(true);
      const result = await createPermissionFromTemplate({
        resource: selectedResource,
        selectedActions: selectedActions,
      });
      
      toast.success(t('createPermissionSuccess', { count: result.length }));
      setSelectedActions([]);
    } catch (error: any) {
      console.error('Error creating permissions:', error);
      toast.error(t('errorCreatingPermission', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const getResourceDisplayName = (resourceKey: string) => {
    const resourceNames: { [key: string]: string } = {
      user: t('user'),
      role: t('role'),
      permission: t('permission'),
      feature: t('feature'),
      article: t('article'),
      category: t('category'),
      order: t('order'),
      payment: t('payment'),
      reservation: t('reservation'),
      table: t('table'),
      exam: t('exam'),
      question: t('question'),
      media: t('media'),
      notification: t('notification'),
      history: t('history'),
      food_item: t('foodItem'),
    };
    return resourceNames[resourceKey] || resourceKey;
  };

  const getActionDisplayName = (actionKey: string) => {
    const actionNames: { [key: string]: string } = {
      CREATE: t('create'),
      READ: t('read'),
      UPDATE: t('update'),
      DELETE: t('delete'),
      EXPORT: t('export'),
      IMPORT: t('import'),
      APPROVE: t('approve'),
      REJECT: t('reject'),
      PUBLISH: t('publish'),
      BLOCK: t('block'),
      UNBLOCK: t('unblock'),
      ASSIGN: t('assign'),
      UPLOAD: t('upload'),
      DOWNLOAD: t('download'),
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
      header: t('action'),
      cell: ({ row }) => getActionDisplayName(row.original.action),
    },
    {
      accessorKey: 'name',
      header: t('permissionName'),
    },
    {
      accessorKey: 'code',
      header: t('permissionCode'),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">{row.original.code}</Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: t('description'),
      cell: ({ row }) => row.original.name,
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-8">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Select value={selectedResource} onValueChange={handleResourceChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectResource')} />
          </SelectTrigger>
          <SelectContent className='bg-white dark:bg-gray-800'>
            {Object.entries(resources).map(([key, value]) => (
              <SelectItem key={key} value={value} className='hover:bg-gray-100 dark:hover:bg-gray-700'>
                {getResourceDisplayName(value)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* DataTable for actions */}
      <div className="">
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
            <CardTitle>{t('permissionsToBeCreated')}</CardTitle>
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
                {loading ? t('creating') : t('create', { count: selectedActions.length })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Resource Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t('resourceAndActionInformation')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">{t('availableResources')}:</h3>
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
              <h3 className="font-semibold mb-3">{t('availableActions')}:</h3>
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
});

export default PermissionManager; 