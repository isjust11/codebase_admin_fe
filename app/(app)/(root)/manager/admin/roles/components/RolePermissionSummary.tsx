'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Badge from '@/components/ui/badge/Badge';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import { getPermissionsByRole, getRolePermissionStats } from '@/services/auth-api';
import { Permission } from '@/types/permission';
import { Role } from '@/types/role';
import { useTranslations } from 'next-intl';

interface RolePermissionSummaryProps {
  role: Role;
  onManagePermissions?: () => void;
}

export default function RolePermissionSummary({ 
  role, 
  onManagePermissions 
}: RolePermissionSummaryProps) {
  const t = useTranslations('RolesPage');
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermissionData();
  }, [role.id]);

  const fetchPermissionData = async () => {
    setLoading(true);
    try {
      const [permissionsResponse, statsResponse] = await Promise.all([
        getPermissionsByRole(role.id),
        getRolePermissionStats(role.id)
      ]);
      
      setAssignedPermissions(permissionsResponse);
      setStats(statsResponse);
    } catch (error: any) {
      toast.error(t('fetchError') + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionGroups = () => {
    const groups = assignedPermissions.reduce((acc: any, permission) => {
      const resource = permission.resource || 'Unknown';
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {});
    
    return Object.entries(groups).map(([resource, permissions]) => ({
      resource,
      permissions: permissions as Permission[]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('permissions')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('rolePermissionsDescription')}
          </p>
        </div>
        {onManagePermissions && (
          <Button onClick={onManagePermissions} size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {t('managePermissions')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalPermissions')}</p>
                <p className="text-2xl font-bold">{assignedPermissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('uniqueResources')}</p>
                <p className="text-2xl font-bold">
                  {new Set(assignedPermissions.map(p => p.resource)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('uniqueActions')}</p>
                <p className="text-2xl font-bold">
                  {new Set(assignedPermissions.map(p => p.action).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Groups */}
      {assignedPermissions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {t('assignedPermissions')} ({assignedPermissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getPermissionGroups().map(group => (
                <div key={group.resource} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg">{group.resource}</h4>
                    <Badge variant="light" color="info">
                      {group.permissions.length} {t('permissions')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.permissions.map(permission => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-2 p-2 rounded border bg-blue-50 border-blue-200"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {permission.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {permission.code}
                          </p>
                          {permission.action && (
                            <Badge variant="light" color="info" className="text-xs mt-1">
                              {permission.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noPermissionsAssigned')}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('noPermissionsDescription')}
            </p>
            {onManagePermissions && (
              <Button onClick={onManagePermissions}>
                <Plus className="w-4 h-4 mr-2" />
                {t('assignPermissions')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 