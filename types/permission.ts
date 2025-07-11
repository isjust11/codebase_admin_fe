export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  action?: string;
  resource?: string;
  featureId?: number;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  code?: string;
  action?: string;
  resource?: string;
  featureId?: number;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  code?: string;
  action?: string;
  resource?: string;
  featureId?: number;
  isActive?: boolean;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  navagatorIds?: string[];
  permissionIds?: number[];
}

export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  navagatorIds?: string[];
  isActive?: boolean;
  permissionIds?: number[];
} 