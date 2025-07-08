'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge/Badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Shield, 
  Users, 
  Eye,
  Save,
  X
} from 'lucide-react';
import { 
  getPermissions, 
  getPermissionsByRole, 
  assignRolePermissions,
  getRole
} from '@/services/auth-api';
import { Role } from '@/types/role';
import { Permission } from '@/types/permission';
import { useTranslations } from 'next-intl';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import { AsyncWrapper } from '@/components/common/AsyncWrapper';
import { Action } from '@/types/actions';

interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

export default function RolePermissionsPage() {
  const t = useTranslations('RolesPage');
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [assignedPermissions, setAssignedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    fetchData();
  }, [roleId]);

  // Group permissions by resource
  useEffect(() => {
    if (permissions.length > 0) {
      const groups = permissions.reduce((acc: PermissionGroup[], permission) => {
        const resource = permission.resource || 'Unknown';
        const existingGroup = acc.find(group => group.resource === resource);
        
        if (existingGroup) {
          existingGroup.permissions.push(permission);
        } else {
          acc.push({
            resource,
            permissions: [permission]
          });
        }
        
        return acc;
      }, []);
      
      setPermissionGroups(groups);
    }
  }, [permissions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roleResponse, permissionsResponse, assignedPermissionsResponse] = await Promise.all([
        getRole(roleId),
        getPermissions({ size: 1000 }),
        getPermissionsByRole(roleId)
      ]);
      
      setRole(roleResponse);
      setPermissions(permissionsResponse.data);
      setAssignedPermissions(assignedPermissionsResponse.map(p => p.id));
    } catch (error: any) {
      toast.error(t('fetchError') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setAssignedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleResourcePermissionToggle = (resource: string, checked: boolean) => {
    const resourcePermissions = permissions.filter(p => p.resource === resource);
    const permissionIds = resourcePermissions.map(p => p.id);
    
    setAssignedPermissions(prev => {
      if (checked) {
        // Add all permissions for this resource
        const newPermissions = [...prev];
        permissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      } else {
        // Remove all permissions for this resource
        return prev.filter(id => !permissionIds.includes(id));
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignRolePermissions(roleId, assignedPermissions);
      toast.success(t('permissionUpdateSuccess'));
      router.push(`/manager/admin/roles/${roleId}`);
    } catch (error: any) {
      toast.error(t('permissionUpdateError') + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissionGroups = permissionGroups.filter(group => {
    const matchesSearch = group.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.permissions.some(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesResource = selectedResource === 'all' || group.resource === selectedResource;
    const matchesAction = selectedAction === 'all' || 
      group.permissions.some(p => p.action === selectedAction);
    
    return matchesSearch && matchesResource && matchesAction;
  });

  const getResourceStats = (resource: string) => {
    const resourcePermissions = permissions.filter(p => p.resource === resource);
    const assignedCount = resourcePermissions.filter(p => 
      assignedPermissions.includes(p.id)
    ).length;
    
    return {
      total: resourcePermissions.length,
      assigned: assignedCount,
      percentage: resourcePermissions.length > 0 ? 
        Math.round((assignedCount / resourcePermissions.length) * 100) : 0
    };
  };

  const getAvailableResources = () => {
    return ['all', ...new Set(permissions.map(p => p.resource).filter(Boolean))];
  };

  const getAvailableActions = () => {
    return ['all', ...new Set(permissions.map(p => p.action).filter(Boolean))];
  };

  if (loading) {
    return (
      <AsyncWrapper>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AsyncWrapper>
    );
  }

  if (!role) {
    return (
      <AsyncWrapper>
        <div className="text-center p-8">
          <p className="text-gray-600">{t('roleNotFound')}</p>
        </div>
      </AsyncWrapper>
    );
  }
  const lstActions: Action[] = [
    {
      icon: <ArrowLeft className="w-4 h-4 mr-1" />,
      onClick: () => router.back(),
      title: t('back'),
      className: "hover:bg-gray-600 dark:hover:bg-gray-800 rounded-md transition-colors bg-gray-500 dark:bg-gray-800 text-white",
    },
    {
      icon: <Save className="w-4 h-4 mr-1" />,
      onClick: handleSave,
      title:saving ? t('saving') : t('save'),
      className: "hover:bg-blue-100 dark:hover:bg-blue-800 rounded-md transition-colors text-blue-500",
    },

  ];

  return (
    <AsyncWrapper>
      <PageBreadcrumb 
        pageTitle={`${t('managePermissions')} - ${role.name}`}
      />
      
      <div className="space-y-6">
        <ComponentCard title={`${t('managePermissions')} - ${role.name}`} desc={<div className="flex items-center gap-2 mt-2">
          <Badge variant="light" color="info">{t('roleCode')}: {role.code}</Badge>
        </div>} listAction={lstActions}>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalPermissions')}</p>
                    <p className="text-2xl font-bold">{permissions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('assignedPermissions')}</p>
                    <p className="text-2xl font-bold">{assignedPermissions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('uniqueResources')}</p>
                    <p className="text-2xl font-bold">
                      {new Set(permissions.map(p => p.resource).filter(Boolean)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t('filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('search')}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t('searchPermissions')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('resource')}</label>
                  <select
                    value={selectedResource}
                    onChange={(e) => setSelectedResource(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    aria-label={t('selectResource')}
                  >
                    {getAvailableResources().map(resource => (
                      <option key={resource} value={resource}>
                        {resource === 'all' ? t('allResources') : resource}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('action')}</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    aria-label={t('selectAction')}
                  >
                    {getAvailableActions().map(action => (
                      <option key={action} value={action}>
                        {action === 'all' ? t('allActions') : action}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('permissions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredPermissionGroups.map(group => {
                    const stats = getResourceStats(group.resource);
                    const allAssigned = group.permissions.every(p => 
                      assignedPermissions.includes(p.id)
                    );
                    
                    return (
                      <div key={group.resource} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allAssigned}
                              onCheckedChange={(checked) => 
                                handleResourcePermissionToggle(group.resource, checked as boolean)
                              }
                            />
                            <h3 className="font-semibold text-lg">{group.resource}</h3>
                            <Badge variant="light" color="info">
                              {stats.assigned}/{stats.total} ({stats.percentage}%)
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {group.permissions.map(permission => (
                            <div
                              key={permission.id}
                              className={`flex items-center gap-2 p-2 rounded border ${
                                assignedPermissions.includes(permission.id)
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <Checkbox
                                checked={assignedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {permission.code}
                                </p>
                                {permission.action && (
                                  <Badge variant="light" color="info" className="text-xs">
                                    {permission.action}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </ComponentCard>
      </div>
    </AsyncWrapper>
  );
} 