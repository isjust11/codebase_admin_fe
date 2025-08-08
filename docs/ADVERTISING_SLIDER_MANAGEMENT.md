# Hệ Thống Quản Lý Advertising Slider

## Tổng Quan

Hệ thống quản lý Advertising Slider cung cấp các chức năng toàn diện để quản lý các slider quảng cáo và banner trên website. Hệ thống bao gồm:

- **Quản lý CRUD**: Tạo, đọc, cập nhật, xóa slider
- **Quản lý trạng thái**: Bật/tắt slider, đánh dấu nổi bật
- **Thống kê và phân tích**: Theo dõi hiệu quả quảng cáo
- **Quản lý media**: Upload và chọn hình ảnh cho slider
- **Dashboard**: Tổng quan về hiệu quả quảng cáo

## Cấu Trúc Thư Mục

```
codebase_admin_fe/
├── app/
│   ├── (app)/(root)/manager/
│   │   └── advertising-sliders/
│   │       ├── page.tsx                    # Trang quản lý chính
│   │       └── dashboard/
│   │           └── page.tsx                # Trang dashboard
│   └── api/
│       └── advertising-sliders/
│           ├── route.ts                    # API chính
│           ├── stats/
│           │   └── route.ts               # API thống kê
│           └── [id]/
│               ├── route.ts               # API chi tiết slider
│               ├── toggle-active/
│               │   └── route.ts           # API toggle active
│               └── toggle-featured/
│                   └── route.ts           # API toggle featured
├── components/
│   ├── AdvertisingSliderStats.tsx         # Component thống kê
│   └── MediaManager.tsx                   # Component quản lý media
└── docs/
    └── ADVERTISING_SLIDER_MANAGEMENT.md   # Tài liệu này
```

## Tính Năng Chính

### 1. Quản Lý Slider

#### Tạo Slider Mới
- **Tiêu đề**: Bắt buộc, tên hiển thị của slider
- **Phụ đề**: Tùy chọn, mô tả ngắn
- **Mô tả**: Nội dung chi tiết về slider
- **Loại slider**: Banner, Khuyến mãi, Sản phẩm mới, Nổi bật, Sự kiện, Danh mục
- **Vị trí**: Đầu trang, Giữa trang, Cuối trang, Thanh bên, Toàn màn hình
- **Thứ tự**: Số thứ tự hiển thị
- **Link**: URL khi click vào slider
- **Ngày bắt đầu/kết thúc**: Thời gian hiển thị
- **Trạng thái**: Hoạt động/Ngừng hoạt động
- **Nổi bật**: Đánh dấu slider quan trọng

#### Chỉnh Sửa Slider
- Cập nhật tất cả thông tin của slider
- Thay đổi hình ảnh
- Điều chỉnh thứ tự hiển thị

#### Xóa Slider
- Xóa vĩnh viễn slider khỏi hệ thống
- Có xác nhận trước khi xóa

### 2. Quản Lý Trạng Thái

#### Toggle Active
- Bật/tắt slider nhanh chóng
- Không cần vào form chỉnh sửa

#### Toggle Featured
- Đánh dấu/bỏ đánh dấu slider nổi bật
- Slider nổi bật sẽ được ưu tiên hiển thị

### 3. Bộ Lọc và Tìm Kiếm

#### Tìm Kiếm
- Tìm theo tiêu đề
- Tìm theo mô tả
- Tìm kiếm real-time

#### Bộ Lọc
- **Loại slider**: Lọc theo loại (Banner, Khuyến mãi, etc.)
- **Vị trí**: Lọc theo vị trí hiển thị
- **Trạng thái**: Lọc theo trạng thái hoạt động

### 4. Quản Lý Media

#### Upload Hình Ảnh
- Hỗ trợ kéo thả
- Upload nhiều file cùng lúc
- Hỗ trợ format: JPG, PNG, GIF, WebP

#### Chọn Hình Ảnh
- Xem trước hình ảnh
- Chọn một hoặc nhiều hình
- Chế độ xem grid/list

### 5. Thống Kê và Phân Tích

#### Dashboard
- **Tổng sliders**: Số lượng slider đã tạo
- **Đang hoạt động**: Slider đang hiển thị
- **Nổi bật**: Slider được đánh dấu nổi bật
- **Tỷ lệ click**: CTR trung bình
- **Tổng lượt xem**: Tổng số lượt xem
- **Tổng lượt click**: Tổng số lượt click

#### Slider Hiệu Quả Nhất
- Hiển thị slider có CTR cao nhất
- Thống kê chi tiết về lượt xem và click

## API Endpoints

### Backend (NestJS)

```typescript
// GET /advertising-sliders - Lấy danh sách slider
// POST /advertising-sliders - Tạo slider mới
// GET /advertising-sliders/:id - Lấy chi tiết slider
// PUT /advertising-sliders/:id - Cập nhật slider
// DELETE /advertising-sliders/:id - Xóa slider
// PUT /advertising-sliders/:id/toggle-active - Toggle trạng thái active
// PUT /advertising-sliders/:id/toggle-featured - Toggle trạng thái featured
// GET /advertising-sliders/stats - Lấy thống kê
```

### Frontend (Next.js)

```typescript
// GET /api/advertising-sliders - Proxy đến backend
// POST /api/advertising-sliders - Proxy đến backend
// GET /api/advertising-sliders/[id] - Proxy đến backend
// PUT /api/advertising-sliders/[id] - Proxy đến backend
// DELETE /api/advertising-sliders/[id] - Proxy đến backend
// PUT /api/advertising-sliders/[id]/toggle-active - Proxy đến backend
// PUT /api/advertising-sliders/[id]/toggle-featured - Proxy đến backend
// GET /api/advertising-sliders/stats - Proxy đến backend
```

## Database Schema

### AdvertisingSlider Entity

```typescript
@Entity()
export class AdvertisingSlider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  subtitle?: string;

  @Column({ length: 255, nullable: true })
  image?: string;

  @Column({ type: 'simple-array', nullable: true })
  images?: string[];

  @Column({ length: 500, nullable: true })
  link?: string;

  @Column({
    type: 'enum',
    enum: SliderType,
    default: SliderType.BANNER
  })
  type: SliderType;

  @Column({
    type: 'enum',
    enum: SliderPosition,
    default: SliderPosition.TOP
  })
  position: SliderPosition;

  @Column({ default: 1 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  targetAudience?: string;

  @Column({ type: 'text', nullable: true })
  conditions?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ctr?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  conversionRate?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL' })
  createdBy?: User | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

## Enums

### SliderType
```typescript
export enum SliderType {
  BANNER = 'BANNER',
  PROMOTION = 'PROMOTION',
  NEW_PRODUCT = 'NEW_PRODUCT',
  FEATURED = 'FEATURED',
  EVENT = 'EVENT',
  CATEGORY = 'CATEGORY'
}
```

### SliderPosition
```typescript
export enum SliderPosition {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  SIDEBAR = 'SIDEBAR',
  FULLSCREEN = 'FULLSCREEN'
}
```

## Hướng Dẫn Sử Dụng

### 1. Truy Cập Hệ Thống

1. Đăng nhập vào admin panel
2. Vào menu "Manager" > "Advertising Sliders"
3. Chọn "Quản lý Sliders" hoặc "Dashboard"

### 2. Tạo Slider Mới

1. Click nút "Tạo Slider"
2. Điền thông tin bắt buộc:
   - Tiêu đề
   - Loại slider
   - Vị trí
   - Thứ tự
3. Upload hình ảnh (tùy chọn)
4. Cấu hình thời gian hiển thị (tùy chọn)
5. Click "Tạo Slider"

### 3. Chỉnh Sửa Slider

1. Tìm slider cần chỉnh sửa
2. Click nút "Chỉnh sửa" (icon bút chì)
3. Thay đổi thông tin cần thiết
4. Click "Cập nhật"

### 4. Quản Lý Trạng Thái

1. Sử dụng dropdown menu trên mỗi slider
2. Chọn "Hiện slider" / "Ẩn slider" để toggle active
3. Chọn "Đánh dấu nổi bật" / "Bỏ nổi bật" để toggle featured

### 5. Xem Thống Kê

1. Vào trang "Dashboard"
2. Xem các chỉ số tổng quan
3. Phân tích hiệu quả của từng slider

## Bảo Mật

### Phân Quyền
- **READ**: Xem danh sách và chi tiết slider
- **CREATE**: Tạo slider mới
- **UPDATE**: Chỉnh sửa slider
- **DELETE**: Xóa slider

### Validation
- Tiêu đề: Bắt buộc, tối đa 255 ký tự
- Link: URL hợp lệ (nếu có)
- Thứ tự: Số nguyên dương
- Ngày: Định dạng datetime-local

## Tối Ưu Hóa

### Performance
- Lazy loading cho hình ảnh
- Pagination cho danh sách slider
- Caching cho thống kê
- Optimized images

### SEO
- Meta tags cho từng slider
- Alt text cho hình ảnh
- Structured data

### Mobile Responsive
- Responsive design cho tất cả màn hình
- Touch-friendly interface
- Mobile-optimized forms

## Troubleshooting

### Lỗi Thường Gặp

1. **Không upload được hình ảnh**
   - Kiểm tra kích thước file (tối đa 5MB)
   - Kiểm tra định dạng file (JPG, PNG, GIF, WebP)
   - Kiểm tra quyền upload

2. **Slider không hiển thị**
   - Kiểm tra trạng thái "Hoạt động"
   - Kiểm tra thời gian hiển thị
   - Kiểm tra vị trí hiển thị

3. **Thống kê không cập nhật**
   - Kiểm tra kết nối database
   - Kiểm tra cron job cho việc tính toán thống kê
   - Clear cache nếu cần

### Logs

```bash
# Backend logs
tail -f logs/application.log

# Frontend logs
# Check browser console for errors
```

## Tương Lai

### Tính Năng Sắp Tới
- A/B testing cho slider
- Personalization dựa trên user behavior
- Advanced analytics với Google Analytics integration
- Multi-language support
- Advanced scheduling với calendar view
- Bulk operations (import/export)

### API Extensions
- Webhook support
- Real-time updates với WebSocket
- GraphQL API
- Mobile app API

## Liên Hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- Email: support@example.com
- Documentation: https://docs.example.com
- GitHub Issues: https://github.com/example/repo/issues 