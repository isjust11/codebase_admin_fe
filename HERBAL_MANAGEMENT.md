# Quản lý Thảo dược (Herbal Management)

## Tổng quan

Chức năng quản lý thảo dược cho phép admin quản lý các thông tin về thảo dược trong hệ thống, bao gồm thông tin chi tiết về tính chất dược liệu, cách sử dụng, liều lượng và các thông tin liên quan khác.

## Tính năng

### 1. Danh sách thảo dược (`/manager/herbals`)
- Hiển thị danh sách tất cả thảo dược với phân trang
- Tìm kiếm thảo dược theo tên
- Sắp xếp theo các tiêu chí khác nhau
- Thao tác: Xem chi tiết, Chỉnh sửa, Xóa
- Thêm thảo dược mới

### 2. Tạo thảo dược mới (`/manager/herbals/create`)
- Form tạo mới với đầy đủ các trường thông tin
- Upload hình ảnh thảo dược
- Chọn danh mục phân loại
- Thiết lập trạng thái hoạt động

### 3. Cập nhật thảo dược (`/manager/herbals/update/[id]`)
- Form cập nhật với dữ liệu hiện tại
- Chỉnh sửa tất cả thông tin thảo dược
- Lưu thay đổi

### 4. Chi tiết thảo dược (`/manager/herbals/[id]`)
- Hiển thị đầy đủ thông tin thảo dược
- Thống kê lượt xem và lượt thích
- Thông tin hệ thống (ngày tạo, cập nhật)

## Cấu trúc dữ liệu

### Herbal Entity
```typescript
interface Herbal {
  id: number;
  title: string;                    // Tên thảo dược
  slug: string;                     // URL slug
  summary?: string;                 // Tóm tắt
  content: string;                  // Nội dung chi tiết
  scientificName?: string;          // Tên khoa học
  commonNames?: string;             // Tên thường gọi
  family?: string;                  // Họ thực vật
  partsUsed?: string;               // Bộ phận sử dụng
  activeCompounds?: string;         // Hợp chất hoạt tính
  medicinalProperties?: string;     // Tính chất dược liệu
  preparationMethods?: string;      // Phương pháp chế biến
  dosage?: string;                  // Liều lượng
  contraindications?: string;       // Chống chỉ định
  sideEffects?: string;             // Tác dụng phụ
  thumbnail?: string;               // Hình ảnh
  viewCount: number;                // Lượt xem
  likeCount: number;                // Lượt thích
  authorId?: string;                // ID tác giả
  category?: Category;              // Danh mục
  categoryId?: string;              // ID danh mục
  isActive: boolean;                // Trạng thái hoạt động
  createdAt: Date;                  // Ngày tạo
  updatedAt: Date;                  // Ngày cập nhật
}
```

## API Endpoints

### Backend (NestJS)
- `GET /herbals` - Lấy danh sách thảo dược (có phân trang)
- `POST /herbals` - Tạo thảo dược mới
- `GET /herbals/:id` - Lấy chi tiết thảo dược
- `PATCH /herbals/:id` - Cập nhật thảo dược
- `DELETE /herbals/:id` - Xóa thảo dược
- `POST /herbals/:id/view` - Tăng lượt xem
- `POST /herbals/:id/like` - Tăng lượt thích
- `GET /herbals/category/:categoryId` - Lấy thảo dược theo danh mục
- `GET /herbals/scientific-name/:scientificName` - Tìm theo tên khoa học
- `GET /herbals/family/:family` - Tìm theo họ thực vật

### Frontend (Next.js)
- `/manager/herbals` - Trang danh sách
- `/manager/herbals/create` - Trang tạo mới
- `/manager/herbals/update/[id]` - Trang cập nhật
- `/manager/herbals/[id]` - Trang chi tiết

## Quyền truy cập

Chức năng này yêu cầu các quyền sau:
- `READ` - Xem danh sách và chi tiết thảo dược
- `CREATE` - Tạo thảo dược mới
- `UPDATE` - Cập nhật thảo dược
- `DELETE` - Xóa thảo dược

## Cài đặt

### 1. Chạy migration
```bash
npm run migration:run
```

### 2. Kiểm tra feature trong database
Đảm bảo feature "Thảo dược" đã được thêm vào bảng `feature` với:
- Icon: `ic_herbal`
- Label: `Thảo dược`
- Link: `/manager/herbals`
- FeatureType: `MANAGER`

### 3. Kiểm tra permissions
Đảm bảo các permission sau đã được thêm:
- `CREATE herbal`
- `READ herbal`
- `UPDATE herbal`
- `DELETE herbal`

## Sử dụng

### 1. Truy cập vào quản lý thảo dược
- Đăng nhập với tài khoản admin
- Vào menu "Thảo dược" trong sidebar
- Chọn "Danh sách thảo dược"

### 2. Tạo thảo dược mới
- Click nút "Thêm thảo dược mới"
- Điền đầy đủ thông tin bắt buộc (tên, nội dung)
- Điền các thông tin tùy chọn khác
- Click "Tạo thảo dược"

### 3. Chỉnh sửa thảo dược
- Từ danh sách, click "Chỉnh sửa" trên thảo dược cần sửa
- Cập nhật thông tin cần thiết
- Click "Cập nhật thảo dược"

### 4. Xem chi tiết thảo dược
- Từ danh sách, click "Xem chi tiết"
- Xem đầy đủ thông tin thảo dược
- Có thể click "Chỉnh sửa" để cập nhật

### 5. Xóa thảo dược
- Từ danh sách, click "Xóa" trên thảo dược cần xóa
- Xác nhận xóa

## Lưu ý

1. **Hình ảnh**: Hiện tại chỉ hỗ trợ URL hình ảnh, cần tích hợp upload ảnh
2. **Nội dung**: Hỗ trợ HTML trong trường content
3. **Phân trang**: Mặc định 10 items/trang
4. **Tìm kiếm**: Tìm theo tên thảo dược
5. **Sắp xếp**: Có thể sắp xếp theo tên và các trường khác

## Tương lai

- [ ] Tích hợp upload ảnh
- [ ] Rich text editor cho nội dung
- [ ] Import/Export dữ liệu
- [ ] Thống kê chi tiết
- [ ] Tích hợp với mobile app 