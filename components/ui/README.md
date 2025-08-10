# Image Upload Components

## Tổng quan

Bộ component upload ảnh được thiết kế để thay thế các input URL đơn giản, cung cấp trải nghiệm upload ảnh trực quan và dễ sử dụng với tính năng drag & drop.

## Components

### 1. ImageUpload

Component upload ảnh đơn, hỗ trợ drag & drop và preview ảnh.

#### Props

- `value?: string` - URL ảnh hiện tại
- `onChange: (value: string) => void` - Callback khi ảnh thay đổi
- `label?: string` - Label hiển thị phía trên component
- `placeholder?: string` - Text placeholder khi không có ảnh
- `className?: string` - CSS classes bổ sung

#### Sử dụng

```tsx
import ImageUpload from '@/components/ui/ImageUpload';

const MyComponent = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      label="Ảnh sản phẩm"
      value={imageUrl}
      onChange={setImageUrl}
      placeholder="Kéo & thả ảnh vào đây"
    />
  );
};
```

### 2. MultipleImageUpload

Component upload nhiều ảnh, hỗ trợ drag & drop, preview grid và giới hạn số lượng ảnh.

#### Props

- `value?: string[]` - Mảng URL ảnh hiện tại
- `onChange: (value: string[]) => void` - Callback khi danh sách ảnh thay đổi
- `label?: string` - Label hiển thị phía trên component
- `placeholder?: string` - Text placeholder khi không có ảnh
- `className?: string` - CSS classes bổ sung
- `maxImages?: number` - Số lượng ảnh tối đa (mặc định: 10)

#### Sử dụng

```tsx
import MultipleImageUpload from '@/components/ui/MultipleImageUpload';

const MyComponent = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <MultipleImageUpload
      label="Thư viện ảnh"
      value={imageUrls}
      onChange={setImageUrls}
      placeholder="Upload thư viện ảnh"
      maxImages={5}
    />
  );
};
```

## Tính năng

### Drag & Drop
- Hỗ trợ kéo thả file ảnh trực tiếp vào khu vực upload
- Visual feedback khi đang kéo file (border và background thay đổi)

### File Validation
- Chỉ chấp nhận file ảnh: PNG, JPEG, WebP, SVG
- Tự động lọc file không hợp lệ

### Preview
- Hiển thị preview ảnh ngay lập tức sau khi chọn
- Hỗ trợ xóa ảnh với nút delete
- Responsive design cho mobile và desktop

### Multiple Images
- Grid layout hiển thị nhiều ảnh
- Hover effect hiển thị nút xóa
- Giới hạn số lượng ảnh có thể upload

## Lưu ý

### Hiện tại
- Component chỉ tạo URL preview tạm thời (URL.createObjectURL)
- Chưa tích hợp với backend upload service
- Cần implement logic upload thực tế trong form submit

### Tương lai
- Tích hợp với upload service
- Progress bar cho upload
- Image compression và optimization
- Drag & drop để sắp xếp lại thứ tự ảnh

## Dependencies

- `react-dropzone` - Xử lý drag & drop
- `lucide-react` - Icons (X, Plus)
- Tailwind CSS - Styling

## Migration từ Input URL

### Trước (Input đơn giản)
```tsx
<Input
  value={formData.portrait}
  onChange={(e) => handleInputChange('portrait', e.target.value)}
  placeholder="Nhập URL ảnh"
/>
```

### Sau (ImageUpload component)
```tsx
<ImageUpload
  value={formData.portrait}
  onChange={(value) => handleInputChange('portrait', value)}
  placeholder="Upload ảnh"
/>
```

## Troubleshooting

### Component không hiển thị
- Kiểm tra import path
- Đảm bảo `react-dropzone` đã được cài đặt
- Kiểm tra console errors

### Drag & drop không hoạt động
- Kiểm tra file type có được chấp nhận không
- Đảm bảo file không quá lớn
- Kiểm tra browser compatibility

### Preview ảnh không hiển thị
- Kiểm tra file có hợp lệ không
- Đảm bảo file là ảnh thực sự
- Kiểm tra browser security policies
