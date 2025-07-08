# Role-Permission Management System

## Tổng quan

Hệ thống quản lý mối liên hệ giữa Role và Permission được xây dựng để cung cấp một giao diện trực quan và dễ sử dụng cho việc quản lý quyền hạn trong ứng dụng.

## Cấu trúc dữ liệu

### Role Entity
```typescript
interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  features?: Feature[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

### Permission Entity
```typescript
interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  action?: string;
  resource?: string;
  featureId?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Components

### 1. RolePermissionSummary
**File**: `app/(app)/(root)/manager/admin/roles/components/RolePermissionSummary.tsx`

Component hiển thị tổng quan về permissions của một role:
- Thống kê số lượng permissions đã gán
- Nhóm permissions theo resource
- Nút để chuyển đến trang quản lý chi tiết

**Props**:
- `role`: Role object
- `onManagePermissions`: Callback function khi click vào nút quản lý

### 2. RolePermissionManager
**File**: `app/(app)/(root)/manager/admin/roles/components/RolePermissionManager.tsx`

Component quản lý chi tiết permissions cho role:
- Hiển thị tất cả permissions có sẵn
- Cho phép gán/bỏ gán permissions
- Lọc theo resource, action
- Tìm kiếm permissions

**Props**:
- `role`: Role object
- `onClose`: Callback khi đóng modal
- `onSave`: Callback khi lưu thay đổi

### 3. RolePermissionsPage
**File**: `app/(app)/(root)/manager/admin/roles/[id]/permissions/page.tsx`

Trang độc lập để quản lý permissions cho role:
- Giao diện đầy đủ với breadcrumb
- Thống kê chi tiết
- Bộ lọc và tìm kiếm nâng cao
- Lưu thay đổi trực tiếp

## API Endpoints

### 1. Lấy permissions của role
```typescript
GET /roles/{roleId}/permissions
```

### 2. Gán permissions cho role
```typescript
POST /roles/{roleId}/permissions
Body: { permissionIds: string[] }
```

### 3. Bỏ gán permissions khỏi role
```typescript
DELETE /roles/{roleId}/permissions
Body: { permissionIds: string[] }
```

### 4. Lấy thống kê permissions của role
```typescript
GET /roles/{roleId}/permissions/stats
```

## Cách sử dụng

### 1. Xem tổng quan permissions của role
```tsx
import RolePermissionSummary from './components/RolePermissionSummary';

<RolePermissionSummary
  role={role}
  onManagePermissions={() => router.push(`/manager/admin/roles/${role.id}/permissions`)}
/>
```

### 2. Quản lý permissions trong modal
```tsx
import RolePermissionManager from './components/RolePermissionManager';

<RolePermissionManager
  role={role}
  onClose={() => setModalOpen(false)}
  onSave={() => {
    // Refresh data
    fetchRoleData();
    setModalOpen(false);
  }}
/>
```

### 3. Truy cập trang quản lý permissions
```
/manager/admin/roles/{roleId}/permissions
```

## Tính năng chính

### 1. Nhóm permissions theo Resource
- Permissions được nhóm theo resource để dễ quản lý
- Hiển thị thống kê số lượng permissions đã gán cho mỗi resource
- Cho phép gán/bỏ gán tất cả permissions của một resource

### 2. Bộ lọc và tìm kiếm
- Tìm kiếm theo tên permission hoặc code
- Lọc theo resource
- Lọc theo action
- Kết hợp nhiều bộ lọc

### 3. Giao diện trực quan
- Checkbox để chọn permissions
- Màu sắc khác biệt cho permissions đã gán/chưa gán
- Badge hiển thị thông tin action
- Loading states và error handling

### 4. Thống kê real-time
- Số lượng permissions tổng cộng
- Số lượng permissions đã gán
- Số lượng resources và actions duy nhất
- Phần trăm hoàn thành cho mỗi resource

## Cấu hình

### 1. Translation keys
Thêm các translation keys vào file `messages/en.json` và `messages/vi.json`:

```json
{
  "RolesPage": {
    "managePermissions": "Manage Permissions",
    "totalPermissions": "Total Permissions",
    "assignedPermissions": "Assigned Permissions",
    "uniqueResources": "Unique Resources",
    "uniqueActions": "Unique Actions",
    "filters": "Filters",
    "search": "Search",
    "resource": "Resource",
    "action": "Action",
    "permissionUpdateSuccess": "Permissions updated successfully",
    "permissionUpdateError": "Error updating permissions: "
  }
}
```

### 2. API Configuration
Đảm bảo các API endpoints được cấu hình đúng trong backend:
- Controller methods cho role-permission management
- Service methods để xử lý logic
- Database relationships giữa Role và Permission

## Best Practices

### 1. Performance
- Sử dụng pagination cho danh sách permissions lớn
- Implement caching cho permissions thường xuyên truy cập
- Optimize database queries với proper indexing

### 2. Security
- Validate permissions trước khi gán
- Implement role-based access control cho trang quản lý
- Audit log cho các thay đổi permissions

### 3. UX/UI
- Provide clear feedback khi thao tác
- Confirm dialog cho các hành động quan trọng
- Responsive design cho mobile devices
- Keyboard navigation support

## Troubleshooting

### 1. Permissions không hiển thị
- Kiểm tra API response format
- Verify database relationships
- Check console errors

### 2. Không thể gán permissions
- Kiểm tra API permissions
- Verify role ID format
- Check network connectivity

### 3. Translation không hoạt động
- Verify translation keys
- Check locale configuration
- Restart development server

## Future Enhancements

### 1. Bulk Operations
- Import/export permissions
- Copy permissions từ role khác
- Template-based permission assignment

### 2. Advanced Features
- Permission inheritance
- Time-based permissions
- Permission analytics

### 3. Integration
- LDAP/AD integration
- SSO support
- API rate limiting 