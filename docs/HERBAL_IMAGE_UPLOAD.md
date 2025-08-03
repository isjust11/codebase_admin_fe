# Hướng Dẫn Upload Hình Ảnh Thảo Dược

## Tổng Quan

Tính năng upload và quản lý hình ảnh cho thảo dược đã được tích hợp vào hệ thống quản lý. Tính năng này cho phép:

- Upload nhiều hình ảnh cùng lúc
- Phân loại hình ảnh theo loại (chính, chi tiết, bộ phận, v.v.)
- Chỉnh sửa thông tin hình ảnh
- Sắp xếp thứ tự hiển thị
- Xem gallery với lightbox

## Cấu Trúc API

### Endpoints

- `GET /herbal-images/herbal/:herbalId` - Lấy tất cả hình ảnh của thảo dược
- `GET /herbal-images/herbal/:herbalId/type/:type` - Lấy hình ảnh theo loại
- `GET /herbal-images/herbal/:herbalId/main` - Lấy hình ảnh chính
- `POST /herbal-images` - Tạo hình ảnh mới
- `PATCH /herbal-images/:id` - Cập nhật hình ảnh
- `DELETE /herbal-images/:id` - Xóa hình ảnh
- `DELETE /herbal-images/herbal/:herbalId` - Xóa tất cả hình ảnh của thảo dược
- `POST /herbal-images/sort-order` - Cập nhật thứ tự sắp xếp

### Loại Hình Ảnh

- `main` - Hình chính
- `detail` - Hình chi tiết
- `part` - Hình bộ phận
- `growth` - Hình sinh trưởng
- `processing` - Hình chế biến
- `usage` - Hình sử dụng
- `other` - Hình khác

## Components

### 1. HerbalImageUpload

Component chính để upload và quản lý hình ảnh.

**Props:**
- `herbalId: number` - ID của thảo dược

**Tính năng:**
- Drag & drop upload
- Preview hình ảnh
- Chỉnh sửa thông tin (alt, description, type, status)
- Sắp xếp thứ tự
- Xóa hình ảnh

**Sử dụng:**
```tsx
import HerbalImageUpload from '@/components/herbal/HerbalImageUpload'

<HerbalImageUpload herbalId={herbalId} />
```

### 2. HerbalImageGallery

Component để hiển thị gallery hình ảnh.

**Props:**
- `herbalId: number` - ID của thảo dược
- `showMainImageOnly?: boolean` - Chỉ hiển thị hình chính

**Tính năng:**
- Grid layout responsive
- Lightbox với navigation
- Hiển thị thông tin hình ảnh
- Hover effects

**Sử dụng:**
```tsx
import HerbalImageGallery from '@/components/herbal/HerbalImageGallery'

// Hiển thị tất cả hình ảnh
<HerbalImageGallery herbalId={herbalId} />

// Chỉ hiển thị hình chính
<HerbalImageGallery herbalId={herbalId} showMainImageOnly={true} />
```

## Cách Sử Dụng

### 1. Trong Trang Tạo Thảo Dược Mới

1. Điền thông tin cơ bản của thảo dược
2. Nhấn "Tạo thảo dược"
3. Sau khi tạo thành công, chuyển sang tab "Quản lý hình ảnh"
4. Upload hình ảnh bằng cách kéo thả hoặc click chọn file
5. Chỉnh sửa thông tin hình ảnh nếu cần

### 2. Trong Trang Cập Nhật Thảo Dược

1. Chuyển sang tab "Quản lý hình ảnh"
2. Upload hình ảnh mới hoặc chỉnh sửa hình ảnh hiện có
3. Sắp xếp thứ tự hiển thị
4. Xóa hình ảnh không cần thiết

### 3. Hiển Thị Gallery

```tsx
// Trong trang chi tiết thảo dược
<HerbalImageGallery herbalId={herbalId} />

// Trong danh sách thảo dược (chỉ hiển thị hình chính)
<HerbalImageGallery herbalId={herbalId} showMainImageOnly={true} />
```

## Cấu Hình

### File Upload

Hiện tại component sử dụng base64 để encode hình ảnh. Trong môi trường production, bạn nên:

1. Upload file lên server trước
2. Lưu URL của file đã upload
3. Gửi URL lên API thay vì base64

### Kích Thước File

- Hỗ trợ: PNG, JPG, GIF, WebP
- Kích thước tối đa: Không giới hạn (có thể cấu hình)
- Số lượng file: Không giới hạn

### Responsive

- Mobile: 1 cột
- Tablet: 2 cột  
- Desktop: 3 cột

## Troubleshooting

### Lỗi Upload

1. Kiểm tra kết nối mạng
2. Kiểm tra quyền truy cập API
3. Kiểm tra định dạng file
4. Kiểm tra kích thước file

### Lỗi Hiển Thị

1. Kiểm tra URL hình ảnh
2. Kiểm tra CORS policy
3. Kiểm tra quyền truy cập file

### Performance

1. Sử dụng lazy loading cho hình ảnh
2. Nén hình ảnh trước khi upload
3. Sử dụng CDN cho hình ảnh
4. Implement pagination cho gallery lớn

## Tương Lai

- [ ] Upload nhiều file cùng lúc
- [ ] Crop và resize hình ảnh
- [ ] Watermark tự động
- [ ] Backup và restore hình ảnh
- [ ] Analytics cho hình ảnh
- [ ] AI tagging cho hình ảnh 