# Data Source Management

Cấu trúc CRUD cho Data Source được xây dựng theo pattern của Categories Management.

## Cấu trúc thư mục

```
data-source/
├── page.tsx                    # Main page component với DataTable
├── components/
│   └── DataSourceForm.tsx      # Form component cho create/edit
└── README.md                   # File hướng dẫn này
```

## Tính năng

### 1. Main Page (`page.tsx`)
- **DataTable** với pagination, search, filter
- **CRUD Operations**: Create, Read, Update, Delete
- **Status Toggle**: Bật/tắt trạng thái active/inactive
- **Type Filter**: Lọc theo loại data source
- **Permission-based Actions**: Kiểm tra quyền trước khi thực hiện action
- **Modal Form**: Sử dụng modal để create/edit
- **Confirmation Dialog**: Xác nhận trước khi xóa

### 2. Form Component (`DataSourceForm.tsx`)
- **Form Validation**: Sử dụng Zod schema validation
- **All Fields**: Name, Title, Description, Type, URL, Author, Publisher, Publish Date, ISBN, DOI, Citation, Notes
- **Type Selection**: Dropdown với các loại data source
- **Status Switch**: Toggle cho trạng thái active/inactive
- **Responsive Layout**: Grid layout responsive

### 3. API Integration
- **CRUD Operations**: Tích hợp với manager-api.ts
- **Error Handling**: Xử lý lỗi và hiển thị toast messages
- **Loading States**: Quản lý trạng thái loading

### 4. Internationalization
- **Multi-language Support**: Hỗ trợ tiếng Anh và tiếng Việt
- **Translation Keys**: Đầy đủ các key cần thiết trong messages/

## Cách sử dụng

1. **Truy cập trang**: Navigate đến `/manager/data-source`
2. **Xem danh sách**: DataTable hiển thị tất cả data sources
3. **Tìm kiếm**: Sử dụng search box để tìm kiếm
4. **Lọc theo loại**: Sử dụng dropdown để lọc theo type
5. **Thêm mới**: Click nút "Add" để mở modal form
6. **Chỉnh sửa**: Click icon edit trong actions column
7. **Xóa**: Click icon delete và xác nhận
8. **Toggle status**: Click action để bật/tắt trạng thái

## Pattern tương tự

Cấu trúc này có thể được sử dụng làm template cho các entity khác:
- Categories Management
- Folk Medicines Management
- Tables Management
- Và các entity khác...

## Dependencies

- React Hook Form + Zod validation
- TanStack Table cho DataTable
- Next-intl cho internationalization
- Tailwind CSS cho styling
- Lucide React cho icons
