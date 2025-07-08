# Role-Permission API Documentation

## Tổng quan

Tài liệu này mô tả các API endpoints mới được thêm vào để quản lý mối liên hệ giữa Role và Permission.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Tất cả các API endpoints đều yêu cầu JWT authentication. Thêm header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Lấy permissions của role

**Endpoint:** `GET /roles/{roleId}/permissions`

**Description:** Lấy danh sách tất cả permissions đã được gán cho role

**Parameters:**
- `roleId` (string, required): ID của role (đã được mã hóa base64)

**Response:**
```json
[
  {
    "id": "1",
    "name": "View Users",
    "code": "users.view",
    "description": "Permission to view users",
    "action": "view",
    "resource": "users",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/roles/Mg==/permissions" \
  -H "Authorization: Bearer your-jwt-token"
```

### 2. Gán permissions cho role

**Endpoint:** `POST /roles/{roleId}/permissions`

**Description:** Gán danh sách permissions cho role (thay thế toàn bộ permissions hiện tại)

**Parameters:**
- `roleId` (string, required): ID của role (đã được mã hóa base64)

**Request Body:**
```json
{
  "permissionIds": ["Mg==", "Mw=="]
}
```

**Response:**
```json
{
  "id": "1",
  "name": "Admin Role",
  "code": "ADMIN",
  "description": "Administrator role",
  "permissions": [
    {
      "id": "2",
      "name": "View Users",
      "code": "users.view"
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/roles/Mg==/permissions" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": ["Mg==", "Mw=="]
  }'
```

### 3. Bỏ gán permissions khỏi role

**Endpoint:** `DELETE /roles/{roleId}/permissions`

**Description:** Bỏ gán danh sách permissions khỏi role

**Parameters:**
- `roleId` (string, required): ID của role (đã được mã hóa base64)

**Request Body:**
```json
{
  "permissionIds": ["Mg==", "Mw=="]
}
```

**Response:**
```json
{
  "id": "1",
  "name": "Admin Role",
  "code": "ADMIN",
  "description": "Administrator role",
  "permissions": [],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/roles/Mg==/permissions" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": ["Mg==", "Mw=="]
  }'
```

### 4. Lấy thống kê permissions của role

**Endpoint:** `GET /roles/{roleId}/permissions/stats`

**Description:** Lấy thống kê chi tiết về permissions của role

**Parameters:**
- `roleId` (string, required): ID của role (đã được mã hóa base64)

**Response:**
```json
{
  "totalPermissions": 50,
  "assignedPermissions": 15,
  "uniqueResources": 8,
  "uniqueActions": 5,
  "resourceStats": [
    {
      "resource": "users",
      "total": 10,
      "assigned": 5,
      "percentage": 50
    },
    {
      "resource": "roles",
      "total": 8,
      "assigned": 3,
      "percentage": 37
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/roles/Mg==/permissions/stats" \
  -H "Authorization: Bearer your-jwt-token"
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Role with ID 1 not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Frontend Integration

### 1. Sử dụng với React Hook

```typescript
import { getPermissionsByRole, assignRolePermissions } from '@/services/auth-api';

const useRolePermissions = (roleId: string) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await getPermissionsByRole(roleId);
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignPermissions = async (permissionIds: string[]) => {
    try {
      await assignRolePermissions(roleId, permissionIds);
      await fetchPermissions(); // Refresh data
    } catch (error) {
      console.error('Error assigning permissions:', error);
    }
  };

  return { permissions, loading, fetchPermissions, assignPermissions };
};
```

### 2. Sử dụng với Axios Interceptor

```typescript
// Thêm vào axios config
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Security Considerations

### 1. Input Validation
- Tất cả input đều được validate bằng class-validator
- Role ID được decode từ base64 trước khi sử dụng
- Permission IDs được validate và decode

### 2. Authorization
- Tất cả endpoints đều yêu cầu JWT authentication
- Có thể thêm role-based access control cho các endpoints này

### 3. Rate Limiting
- Nên implement rate limiting cho các endpoints này
- Đặc biệt là POST và DELETE endpoints

## Testing

### 1. Unit Tests
```typescript
describe('RolePermissionService', () => {
  it('should assign permissions to role', async () => {
    const roleId = 1;
    const permissionIds = ['Mg==', 'Mw=='];
    
    const result = await roleService.assignPermissions(roleId, { permissionIds });
    
    expect(result.permissions).toHaveLength(2);
  });
});
```

### 2. Integration Tests
```typescript
describe('RolePermissionController', () => {
  it('should return permissions for role', async () => {
    const response = await request(app)
      .get('/roles/Mg==/permissions')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## Migration Notes

### 1. Database Changes
- Không cần thay đổi database schema
- Sử dụng existing many-to-many relationship giữa Role và Permission

### 2. Backward Compatibility
- Các API cũ vẫn hoạt động bình thường
- Các API mới là bổ sung, không thay thế

### 3. Performance
- Sử dụng eager loading cho permissions
- Implement caching nếu cần thiết
- Optimize queries với proper indexing

## Future Enhancements

### 1. Bulk Operations
- Import/export permissions từ file
- Copy permissions từ role khác
- Template-based permission assignment

### 2. Advanced Features
- Permission inheritance
- Time-based permissions
- Permission analytics và reporting

### 3. API Improvements
- Pagination cho permissions list
- Filtering và sorting
- Batch operations 