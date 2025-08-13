# FullScreen Loading Usage Guide

## 🎯 Tổng quan

Hệ thống loading full màn hình được thiết kế để hiển thị khi người dùng chuyển trang hoặc thực hiện các thao tác cần thời gian chờ.

## 🚀 Cách sử dụng cơ bản

### 1. Sử dụng hook `useFullScreenLoading`

```tsx
import { useFullScreenLoading } from '@/hooks/useFullScreenLoading';

const MyComponent = () => {
  const { navigateTo, FullScreenLoadingComponent } = useFullScreenLoading();
  
  const handleNavigation = () => {
    navigateTo('/dashboard'); // Tự động hiển thị loading
  };
  
  return (
    <div>
      <button onClick={handleNavigation}>Đi đến Dashboard</button>
      <FullScreenLoadingComponent />
    </div>
  );
};
```

### 2. Sử dụng trực tiếp component `FullScreenLoading`

```tsx
import { FullScreenLoading } from '@/components/ui/FullScreenLoading';

const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsLoading(true)}>Bắt đầu loading</button>
      <FullScreenLoading 
        isVisible={isLoading}
        message="Đang xử lý..."
        variant="fancy"
        size="large"
      />
    </div>
  );
};
```

## ⚙️ Tùy chọn cấu hình

### Hook Options

```tsx
const { FullScreenLoadingComponent } = useFullScreenLoading({
  message: "Đang chuyển trang...",     // Message hiển thị
  variant: "fancy",                     // Kiểu loading: default, minimal, fancy
  size: "medium",                       // Kích thước: small, medium, large
  showProgress: false,                  // Hiển thị progress bar
  className: "custom-class"             // CSS class tùy chỉnh
});
```

### Component Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `isVisible` | `boolean` | - | Hiển thị/ẩn loading |
| `message` | `string` | "Đang tải..." | Message hiển thị |
| `variant` | `'default' \| 'minimal' \| 'fancy'` | "default" | Kiểu loading |
| `size` | `'small' \| 'medium' \| 'large'` | "medium" | Kích thước spinner |
| `showProgress` | `boolean` | false | Hiển thị progress bar |
| `progressValue` | `number` | 0 | Giá trị progress (0-100) |
| `className` | `string` | "" | CSS class tùy chỉnh |

## 🎨 Các kiểu Loading

### 1. Default
- Spinner tròn với border xanh
- Dot nhỏ ở giữa với animation bounce
- Phù hợp cho hầu hết trường hợp

### 2. Minimal
- Spinner đơn giản với border mỏng
- Thiết kế tối giản, nhẹ nhàng
- Phù hợp cho UI clean

### 3. Fancy
- Spinner kép với hiệu ứng pulse
- 3 dots bounce với delay khác nhau
- Thông tin bổ sung ở dưới
- Phù hợp cho trải nghiệm premium

## 📱 Responsive Design

Component tự động responsive và hoạt động tốt trên mọi kích thước màn hình:

- **Mobile**: Tự động điều chỉnh padding và kích thước
- **Tablet**: Layout tối ưu cho màn hình trung bình
- **Desktop**: Hiển thị đầy đủ với spacing lớn

## 🔧 Tùy chỉnh nâng cao

### Custom CSS Classes

```tsx
<FullScreenLoading 
  isVisible={true}
  className="custom-overlay custom-content"
/>
```

### Progress Bar

```tsx
<FullScreenLoading 
  isVisible={true}
  showProgress={true}
  progressValue={75}
/>
```

## 📋 Best Practices

1. **Sử dụng hook**: Ưu tiên sử dụng `useFullScreenLoading` cho navigation
2. **Message rõ ràng**: Cung cấp thông tin hữu ích cho người dùng
3. **Thời gian hợp lý**: Không để loading quá lâu (>10s)
4. **Fallback**: Luôn có plan B nếu loading bị lỗi
5. **Accessibility**: Component đã được thiết kế với accessibility tốt

## 🐛 Troubleshooting

### Loading không hiển thị
- Kiểm tra `isVisible` prop
- Đảm bảo component được render trong DOM
- Kiểm tra z-index và positioning

### Loading không ẩn
- Kiểm tra logic trong `useNavigationLoading`
- Đảm bảo `clearLoading` được gọi
- Kiểm tra timeout trong useEffect

### Performance issues
- Sử dụng `React.memo` cho component con
- Tránh re-render không cần thiết
- Sử dụng `useCallback` cho event handlers

## 📚 Ví dụ thực tế

Xem file `NavigationLoadingExample.tsx` để có ví dụ hoàn chỉnh về cách sử dụng tất cả tính năng.
