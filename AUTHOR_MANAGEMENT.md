# Quản lý Tác giả (Author Management)

## Tổng quan

Chức năng quản lý tác giả cho phép admin quản lý các thông tin về tác giả trong hệ thống, bao gồm thông tin tiểu sử, sự nghiệp, thành tựu và các thông tin liên quan khác.

## Tính năng

### 1. Danh sách tác giả (`/manager/authors`)
- Hiển thị danh sách tất cả tác giả với phân trang
- Tìm kiếm tác giả theo tên
- Sắp xếp theo các tiêu chí khác nhau
- Thao tác: Xem chi tiết, Chỉnh sửa, Xóa
- Thêm tác giả mới

### 2. Tạo tác giả mới (`/manager/authors/create`)
- Form tạo mới với đầy đủ các trường thông tin
- Upload hình ảnh tác giả
- Thiết lập trạng thái hoạt động

### 3. Cập nhật tác giả (`/manager/authors/update/[id]`)
- Form cập nhật với dữ liệu hiện tại
- Chỉnh sửa tất cả thông tin tác giả
- Lưu thay đổi

### 4. Chi tiết tác giả (`/manager/authors/[id]`)
- Hiển thị đầy đủ thông tin tác giả
- Thống kê lượt xem và lượt thích
- Thông tin hệ thống (ngày tạo, cập nhật)

## Cấu trúc dữ liệu

### Author Entity
```typescript
interface Author {
  id: number;
  name: string;                    // Tên tác giả
  slug: string;                    // URL slug
  alias?: string;                  // Bút danh
  biography?: string;              // Tiểu sử
  career?: string;                 // Sự nghiệp
  achievements?: string;           // Thành tựu
  contributions?: string;          // Đóng góp
  works?: string;                  // Tác phẩm
  philosophy?: string;             // Triết lý
  legacy?: string;                 // Di sản
  birthDate?: Date;                // Ngày sinh
  deathDate?: Date;                // Ngày mất
  birthPlace?: string;             // Nơi sinh
  deathPlace?: string;             // Nơi mất
  era?: string;                    // Thời kỳ
  dynasty?: string;                // Triều đại
  specialty?: string;              // Chuyên môn
  teacher?: string;                // Thầy dạy
  students?: string;               // Học trò
  portrait?: string;               // Hình ảnh
  quotes?: string;                 // Trích dẫn
  anecdotes?: string;              // Giai thoại
  honors?: string;                 // Danh hiệu
  memorials?: string;              // Tưởng niệm
  references?: string;             // Tài liệu tham khảo
  viewCount: number;               // Lượt xem
  likeCount: number;               // Lượt thích
  isActive: boolean;               // Trạng thái hoạt động
  herbals?: any[];                 // Thảo dược liên quan
  folkMedicines?: any[];           // Bài thuốc dân gian liên quan
  createdAt: Date;                 // Ngày tạo
  updatedAt: Date;                 // Ngày cập nhật
}
```

## API Endpoints

### Backend (NestJS)
- `GET /authors` - Lấy danh sách tác giả (có phân trang)
- `POST /authors` - Tạo tác giả mới
- `GET /authors/:id` - Lấy chi tiết tác giả
- `PATCH /authors/:id` - Cập nhật tác giả
- `DELETE /authors/:id` - Xóa tác giả
- `POST /authors/:id/view` - Tăng lượt xem
- `POST /authors/:id/like` - Tăng lượt thích
- `GET /authors/famous` - Lấy tác giả nổi tiếng
- `GET /authors/search/:query` - Tìm kiếm tác giả
- `GET /authors/era/:era` - Lấy theo thời kỳ
- `GET /authors/dynasty/:dynasty` - Lấy theo triều đại
- `GET /authors/specialty/:specialty` - Lấy theo chuyên môn
- `GET /authors/slug/:slug` - Lấy theo slug

### Frontend (Next.js)
- `/manager/authors` - Trang danh sách
- `/manager/authors/create` - Trang tạo mới
- `/manager/authors/update/[id]` - Trang cập nhật
- `/manager/authors/[id]` - Trang chi tiết

## Quyền truy cập

Chức năng này yêu cầu các quyền sau:
- `READ` - Xem danh sách và chi tiết tác giả
- `CREATE` - Tạo tác giả mới
- `UPDATE` - Cập nhật tác giả
- `DELETE` - Xóa tác giả

## Cài đặt

### 1. Chạy migration
```bash
npm run migration:run
```

### 2. Kiểm tra feature trong database
Đảm bảo feature "Tác giả" đã được thêm vào bảng `feature` với:
- Icon: `ic_author`
- Label: `Tác giả`
- Link: `/manager/authors`
- FeatureType: `MANAGER`

### 3. Kiểm tra permissions
Đảm bảo các permission sau đã được thêm:
- `CREATE author`
- `READ author`
- `UPDATE author`
- `DELETE author`

## Sử dụng

### 1. Truy cập vào quản lý tác giả
- Đăng nhập với tài khoản admin
- Vào menu "Tác giả" trong sidebar
- Chọn "Danh sách tác giả"

### 2. Tạo tác giả mới
- Click nút "Thêm tác giả mới"
- Điền đầy đủ thông tin bắt buộc (tên)
- Điền các thông tin tùy chọn khác
- Click "Tạo tác giả"

### 3. Chỉnh sửa tác giả
- Từ danh sách, click "Chỉnh sửa" trên tác giả cần sửa
- Cập nhật thông tin cần thiết
- Click "Cập nhật tác giả"

### 4. Xem chi tiết tác giả
- Từ danh sách, click "Xem chi tiết"
- Xem đầy đủ thông tin tác giả
- Có thể click "Chỉnh sửa" để cập nhật

### 5. Xóa tác giả
- Từ danh sách, click "Xóa" trên tác giả cần xóa
- Xác nhận xóa

## Lưu ý

1. **Hình ảnh**: Hiện tại chỉ hỗ trợ URL hình ảnh, cần tích hợp upload ảnh
2. **Nội dung**: Hỗ trợ HTML trong các trường text
3. **Phân trang**: Mặc định 10 items/trang
4. **Tìm kiếm**: Tìm theo tên tác giả
5. **Sắp xếp**: Có thể sắp xếp theo tên và các trường khác

## Tương lai

- [ ] Tích hợp upload ảnh
- [ ] Rich text editor cho nội dung
- [ ] Import/Export dữ liệu
- [ ] Thống kê chi tiết
- [ ] Tích hợp với mobile app 