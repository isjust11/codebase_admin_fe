# 🔍 Hướng Dẫn Debug Next.js - Codebase Admin

## 📋 Mục Lục
1. [Debug Với VS Code](#1-debug-với-vs-code-khuyến-nghị)
2. [Debug Trên Trình Duyệt](#2-debug-trên-trình-duyệt-browser-devtools)
3. [Debug Server-Side (API Routes, Server Components)](#3-debug-server-side)
4. [Debug Network Requests](#4-debug-network-requests)
5. [Debug Redux State](#5-debug-redux-state)
6. [Tips & Tricks](#6-tips--tricks)

---

## 1. Debug Với VS Code (Khuyến Nghị) 🎯

### Cách Sử Dụng:

1. **Dừng dev server hiện tại** (nếu đang chạy):
   - Vào terminal đang chạy `npm run dev` 
   - Nhấn `Ctrl+C` để dừng

2. **Mở Debug Panel trong VS Code**:
   - Nhấn `Ctrl+Shift+D` hoặc click vào icon Debug ở sidebar trái
   - Hoặc vào menu: `View > Run`

3. **Chọn một trong 4 debug options**:

   #### 🌐 **Next.js: debug client-side**
   - Debug code chạy trên browser (components, hooks, client logic)
   - Tự động mở Chrome với debugger attached
   - Đặt breakpoint trong React components
   
   **Khi nào dùng**: Debug giao diện, hooks, client-side logic

   #### 🖥️ **Next.js: debug server-side**
   - Debug code chạy trên server (API routes, Server Components, getServerSideProps)
   - Debug trong VS Code terminal
   - Xem logs và variables trên server
   
   **Khi nào dùng**: Debug API endpoints, server components, server actions

   #### 🔄 **Next.js: debug full stack**
   - Debug cả client và server cùng lúc
   - Tự động khởi động dev server + mở browser với debugger
   - **Khuyến nghị cho hầu hết trường hợp**
   
   **Khi nào dùng**: Debug toàn bộ ứng dụng, theo dõi data flow từ server đến client

   #### 🔗 **Next.js: attach**
   - Attach vào một Next.js process đang chạy
   - Cần chạy dev server với inspect mode: `NODE_OPTIONS='--inspect' npm run dev`
   
   **Khi nào dùng**: Dev server đã chạy và bạn muốn attach debugger

4. **Đặt Breakpoint**:
   - Click vào số dòng bên trái editor (xuất hiện dấu chấm đỏ)
   - Hoặc nhấn `F9` khi cursor ở dòng đó

5. **Chạy Debug**:
   - Chọn debug configuration muốn dùng
   - Nhấn `F5` hoặc click nút ▶️ màu xanh
   - Dev server sẽ khởi động (hoặc attach vào process)

6. **Sử Dụng Debug Controls**:
   - `F5`: Continue
   - `F10`: Step Over (bước qua)
   - `F11`: Step Into (bước vào)
   - `Shift+F11`: Step Out (bước ra)
   - `Ctrl+Shift+F5`: Restart
   - `Shift+F5`: Stop

### Ví Dụ Debug Component:

```typescript
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData(); // Đặt breakpoint ở đây (F9)
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/dashboard'); // Đặt breakpoint ở đây
    const json = await response.json(); // Và ở đây
    console.log('Data received:', json); // Xem trong Debug Console
    setData(json);
  };

  return <div>{/* Your UI */}</div>;
}
```

**Cách debug**:
1. Đặt breakpoint tại các dòng đánh dấu
2. Chạy "Next.js: debug client-side"
3. Khi code chạm breakpoint, nó sẽ dừng lại
4. Xem biến trong panel VARIABLES (bên trái)
5. Chạy lệnh trong DEBUG CONSOLE (bên dưới)

---

## 2. Debug Trên Trình Duyệt (Browser DevTools) 🌐

### Cách Sử Dụng:

1. **Mở DevTools**:
   - Nhấn `F12` hoặc `Ctrl+Shift+I` (Windows)
   - Hoặc click chuột phải > `Inspect`

2. **Console Tab**:
   ```javascript
   // Trong code Next.js
   console.log('Simple log');
   console.error('Error message');
   console.warn('Warning message');
   console.table(arrayData); // Hiển thị array/object dạng table
   console.group('Group Name'); // Nhóm logs
   console.log('Item 1');
   console.log('Item 2');
   console.groupEnd();
   ```

3. **Sources Tab**:
   - Tìm file trong `webpack://` > `.` > `app/`
   - Đặt breakpoint bằng cách click vào số dòng
   - Hoặc thêm `debugger;` trong code:
   
   ```javascript
   function handleClick() {
     debugger; // Code sẽ dừng tại đây
     console.log('Clicked!');
   }
   ```

4. **Network Tab**:
   - Xem tất cả HTTP requests
   - Filter theo type: `Fetch/XHR`, `JS`, `CSS`, `Img`
   - Click vào request để xem:
     - Headers (Request/Response headers)
     - Preview (Response preview)
     - Response (Raw response)
     - Timing (Performance)

5. **React DevTools** (Cài Extension):
   - Install: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
   - Tab "Components": Xem component tree, props, state
   - Tab "Profiler": Đo performance render

---

## 3. Debug Server-Side 🖥️

### Debug API Routes:

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('API called'); // Xem trong terminal, không phải browser console
  
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  // Đặt breakpoint ở đây khi dùng VS Code debugger
  console.log('Query param:', query);
  
  try {
    const data = await fetchSomeData(query);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error); // Log error
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### Debug Server Components:

```typescript
// app/dashboard/page.tsx (Server Component)
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  console.log('Server component rendering'); // Xem trong terminal
  
  const session = await getSession();
  
  if (!session) {
    console.log('No session, redirecting'); // Debug flow
    redirect('/login');
  }
  
  const data = await fetchData(); // Đặt breakpoint
  console.log('Fetched data:', data);
  
  return <div>{/* UI */}</div>;
}
```

**Lưu ý**: 
- Server logs xuất hiện trong **terminal** (nơi chạy `npm run dev`), KHÔNG phải browser console
- Dùng VS Code debugger "server-side" để đặt breakpoint và inspect variables

---

## 4. Debug Network Requests 🌐

### Debug Axios Requests:

```typescript
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor - log tất cả requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 Request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - log tất cả responses
api.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default api;
```

### Xem Network Trong Browser DevTools:

1. Mở DevTools > Network tab
2. Làm action để trigger request
3. Click vào request để xem chi tiết:
   - **Headers**: Request/Response headers, query params
   - **Payload**: Request body (POST/PUT)
   - **Preview**: Response data formatted
   - **Response**: Raw response
   - **Timing**: Thời gian từng phase (DNS, Connect, Wait, Download)

---

## 5. Debug Redux State 🔄

### Dùng Redux DevTools:

1. **Cài Extension**: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

2. **Setup trong code** (nếu chưa có):
   ```typescript
   // store/store.ts
   import { configureStore } from '@reduxjs/toolkit';
   
   export const store = configureStore({
     reducer: {
       // your reducers
     },
     devTools: process.env.NODE_ENV !== 'production', // Enable DevTools
   });
   ```

3. **Sử dụng**:
   - Mở DevTools > Redux tab
   - Xem:
     - **State**: State tree hiện tại
     - **Actions**: Lịch sử các actions đã dispatch
     - **Diff**: Xem state thay đổi như thế nào
     - **Trace**: Call stack của action

### Debug Actions & Reducers:

```typescript
// features/user/userSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, loading: false },
  reducers: {
    setUser: (state, action) => {
      console.log('🔄 Redux Action:', action.type);
      console.log('📦 Payload:', action.payload);
      console.log('📊 Previous State:', state);
      
      state.data = action.payload;
      state.loading = false;
      
      console.log('📊 New State:', state);
    },
  },
});
```

---

## 6. Tips & Tricks 💡

### 1. Debug Performance Issues:

```typescript
// Đo thời gian execution
console.time('fetchData');
await fetchData();
console.timeEnd('fetchData'); // Hiển thị: "fetchData: 125.432ms"

// React Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

### 2. Debug Conditional Logic:

```typescript
// Thay vì
if (user?.isAdmin) {
  doSomething();
}

// Debug
console.log('User:', user);
console.log('Is Admin?', user?.isAdmin);
if (user?.isAdmin) {
  console.log('✅ Admin access granted');
  doSomething();
} else {
  console.log('❌ Not admin');
}
```

### 3. Debug Async/Await:

```typescript
async function fetchUserData() {
  try {
    console.log('1️⃣ Starting fetch');
    
    const response = await fetch('/api/user');
    console.log('2️⃣ Response received:', response.status);
    
    const data = await response.json();
    console.log('3️⃣ Data parsed:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error in fetchUserData:', error);
    throw error;
  }
}
```

### 4. Debug Environment Variables:

```typescript
// Chỉ chạy trên client (browser)
if (typeof window !== 'undefined') {
  console.log('Public env vars:', {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  });
}

// Server-side
if (typeof window === 'undefined') {
  console.log('Server env vars:', {
    DATABASE_URL: process.env.DATABASE_URL,
    // KHÔNG log sensitive data trong production!
  });
}
```

### 5. Sử Dụng Source Maps:

Next.js đã enable source maps by default trong dev mode, nhưng nếu cần trong production:

```javascript
// next.config.js
module.exports = {
  productionBrowserSourceMaps: true, // Enable source maps in production
};
```

### 6. Debug Errors:

```typescript
// Error boundary
'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error caught by boundary:', error);
    console.error('📍 Error info:', errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong!</div>;
    }
    return this.props.children;
  }
}
```

---

## 🚀 Quick Start

**Cách nhanh nhất để bắt đầu debug:**

1. **Stop dev server hiện tại**: `Ctrl+C` trong terminal
2. **Mở Debug panel**: `Ctrl+Shift+D`
3. **Chọn**: "Next.js: debug full stack"
4. **Nhấn**: `F5`
5. **Đặt breakpoint** và bắt đầu debug!

---

## 📚 Tài Liệu Tham Khảo

- [Next.js Debugging](https://nextjs.org/docs/app/building-your-application/configuring/debugging)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Chúc bạn debug hiệu quả! 🎉**
