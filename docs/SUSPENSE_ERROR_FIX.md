# Khắc phục lỗi "A component was suspended by an uncached promise"

## Nguyên nhân

Lỗi này xảy ra trong React 18 và Next.js 13+ khi:

1. **Sử dụng async/await trực tiếp trong useEffect** mà không có Suspense boundary
2. **Promise không được cache** trong React 18
3. **Component bị suspend** bởi một promise chưa được xử lý đúng cách

## Cách khắc phục

### 1. Sử dụng Custom Hook useAsyncEffect (Khuyến nghị)

Thay vì sử dụng async trực tiếp trong useEffect, sử dụng custom hook `useAsyncEffect`:

```tsx
import { useAsyncEffect } from '@/hooks/useAsyncEffect';

// ❌ Cách cũ - có thể gây lỗi Suspense
useEffect(() => {
  const fetchData = async () => {
    const data = await api.getData();
    setData(data);
  };
  fetchData();
}, []);

// ✅ Cách mới với useAsyncEffect
useAsyncEffect(async () => {
  const data = await api.getData();
  setData(data);
}, []);
```

#### Các tính năng của useAsyncEffect:

1. **Tự động cleanup**: Kiểm tra component mounted trước khi setState
2. **Error handling**: Tự động catch và log errors
3. **Cleanup function**: Hỗ trợ return cleanup function
4. **TypeScript support**: Đầy đủ type safety

#### Ví dụ sử dụng:

```tsx
// Cơ bản
useAsyncEffect(async () => {
  const data = await fetch('/api/data');
  setData(data);
}, []);

// Với dependencies
useAsyncEffect(async () => {
  const data = await fetch(`/api/users/${userId}`);
  setUser(data);
}, [userId]);

// Với cleanup function
useAsyncEffect(async () => {
  const controller = new AbortController();
  
  const response = await fetch('/api/data', {
    signal: controller.signal
  });
  const data = await response.json();
  setData(data);
  
  return () => controller.abort();
}, []);

// Với error handling
useAsyncEffect(async () => {
  try {
    const data = await api.getData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  }
}, []);
```

### 2. Sử dụng Suspense Boundary

Bao quanh component có async operations bằng Suspense:

```tsx
import { Suspense } from 'react';

export default function MyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyAsyncComponent />
    </Suspense>
  );
}
```

### 3. Sử dụng State để quản lý loading

```tsx
const [isLoading, setIsLoading] = useState(true);

useAsyncEffect(async () => {
  setIsLoading(true);
  try {
    const data = await api.getData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
}, []);

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 4. Sử dụng AsyncWrapper Component

```tsx
import { AsyncWrapper } from '@/components/common/AsyncWrapper';

export default function MyPage() {
  return (
    <AsyncWrapper>
      <MyAsyncComponent />
    </AsyncWrapper>
  );
}
```

## Các file đã được sửa

1. **`layouts/AppSidebar.tsx`** - Thêm loading state và cleanup
2. **`app/(app)/(auth)/success/page.tsx`** - Sử dụng mounted check
3. **`layouts/AppHeader.tsx`** - Thêm aria-label cho accessibility
4. **`hooks/useAsyncEffect.ts`** - Custom hook mới
5. **`components/common/AsyncWrapper.tsx`** - Component wrapper
6. **`app/(app)/(root)/manager/categories/page.tsx`** - Sử dụng useAsyncEffect
7. **`examples/useAsyncEffect-examples.tsx`** - Ví dụ sử dụng

## Best Practices

1. **Luôn sử dụng useAsyncEffect** thay vì async trong useEffect
2. **Kiểm tra component mounted** trước khi setState
3. **Bao quanh async components** bằng Suspense
4. **Sử dụng loading states** để tránh flash content
5. **Xử lý errors** một cách graceful
6. **Sử dụng cleanup functions** khi cần thiết

## Lưu ý

- Lỗi này thường xảy ra trong development mode
- Trong production, React có thể xử lý tốt hơn
- Luôn test với React.StrictMode để phát hiện sớm
- `useAsyncEffect` tự động xử lý cleanup và error handling 