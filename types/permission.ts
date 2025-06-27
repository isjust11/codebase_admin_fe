

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  navagatorIds?: string[];
  // permissionIds: number[];
}

export interface UpdateRoleDto {
  name?: string;
  code: string;
  description?: string;
  navagatorIds?: string[];
  isActive?: boolean;
  // permissionIds?: number[];
} 