# OCR Frontend Plan — Trang quản lý & giám sát OCR (Next.js Admin)

> Mục tiêu: Bổ sung khu vực **OCR** vào admin web để upload tài liệu, theo dõi job realtime, xem kết quả OCR (text + overlay bbox trên PDF), tìm kiếm/copy/xuất file và xem thống kê.

Stack hiện có tận dụng: **Next.js 15 (App Router) + React 19 + Redux Toolkit + axios + socket.io-client + react-dropzone + pdfjs-dist + @tanstack/react-table + apexcharts + react-hook-form + zod + Radix/Tailwind + next-intl + sonner**.

---

## 0. Điểm tích hợp

- Backend API: `POST /ocr/jobs`, `GET /ocr/jobs`, `GET /ocr/jobs/:id`, `GET /ocr/jobs/:id/result`, `GET /ocr/jobs/:id/assets`, `POST /ocr/jobs/:id/export`.
- Kết quả mỗi trang kèm `images[]` (figure/ảnh nhúng) và `tables[]` (bbox + html + imageUrl).
- Realtime: socket event `ocr.job.updated` (đã có `socket.io-client`).
- Render PDF + overlay bbox: `pdfjs-dist` (đã có sẵn trong deps).

---

## Phase 1 — Nền tảng module OCR (P3/P4)

- [ ] Tạo route khu vực OCR theo App Router: `src/app/[locale]/(dashboard)/ocr/` (hoặc theo cấu trúc dashboard hiện tại) — trang `page.tsx` (danh sách job) + `[id]/page.tsx` (chi tiết).
- [ ] Thêm mục menu “OCR” vào sidebar + phân quyền `OCR_READ`/`OCR_CREATE`.
- [ ] `src/services/ocr.service.ts` (axios) — `createJob(formData)`, `getJobs(params)`, `getJob(id)`, `getResult(id, page)`, `exportJob(id, format)`.
- [ ] Redux slice `src/store/ocrSlice.ts` — state job list/filter/paging + chi tiết job + kết quả theo trang.
- [ ] Định nghĩa type/zod schema cho `OcrJob`, `OcrPage`, `OcrLine{ text, confidence, bbox }`, `OcrAsset{ type:'image'|'figure'|'table', bbox, imageUrl, tableHtml? }`.
- **DoD:** Vào được trang OCR, gọi `GET /ocr/jobs` hiển thị dữ liệu thật.

## Phase 2 — Upload tài liệu (P4)

- [ ] Component `OcrUploadDialog` dùng `react-dropzone` (kéo-thả PDF/ảnh) + `react-hook-form` + `zod` (chọn `lang`: vi/en/auto + switch `extractImages` tách ảnh/figure/table).
- [ ] Hiển thị tiến độ upload (axios `onUploadProgress`), toast `sonner` khi tạo job thành công.
- [ ] Sau khi tạo job → thêm vào đầu danh sách với trạng thái `queued`.
- **DoD:** Upload 1 file → job xuất hiện trong list, có `jobId`.

## Phase 3 — Danh sách job + realtime (P4/P5)

- [ ] Bảng job bằng `@tanstack/react-table`: cột tên file, ngôn ngữ, trạng thái (badge), tiến độ `processedPages/totalPages`, thời gian, hành động (xem/xuất/xoá).
- [ ] Filter theo `status`, search, phân trang server-side.
- [ ] Kết nối `socket.io-client` nghe `ocr.job.updated` → cập nhật dòng tương ứng (progress bar realtime), toast khi `done/failed`.
- **DoD:** Trạng thái job tự cập nhật không cần reload.

## Phase 4 — Xem kết quả OCR (P5)

- [ ] Trang chi tiết `ocr/[id]`: bố cục 2 cột — **trái** render trang PDF/ảnh bằng `pdfjs-dist` + **overlay bbox** (scale theo `width/height` trả về), **phải** panel text theo trang.
- [ ] Click vùng bbox ↔ highlight dòng text tương ứng (2 chiều).
- [ ] Điều hướng trang, zoom, nhảy trang; lazy-load `GET /ocr/jobs/:id/result?page=`.
- [ ] Tìm kiếm trong tài liệu (highlight match), copy text, copy cả trang.
- **DoD:** Mở job `done` → thấy ảnh + overlay text đúng vị trí, search/copy hoạt động.

## Phase 4b — Hiển thị ảnh / figure / table đã tách (P5)

- [ ] Overlay `pdfjs`: vẽ thêm khung `figure`/`table` (màu khác text); hover hiện loại, click mở ảnh (modal Radix dialog).
- [ ] Tab/panel **"Assets"** ở trang chi tiết: grid ảnh đã tách (`GET /ocr/jobs/:id/assets`), lọc theo `type` và `page`, tải/sao chép từng ảnh.
- [ ] `table`: render `tableHtml` (đã có `@tanstack/react-table`/HTML) cho phép copy sang Excel; hoặc xem ảnh crop.
- [ ] Toggle bật/tắt lớp overlay figure/table.
- **DoD:** Trang có hình → admin xem được figure/table tách riêng, đúng vị trí, tải được ảnh.

## Phase 5 — Export & thống kê (P6)

- [ ] Nút export `.txt` / **searchable PDF** gọi `POST /ocr/jobs/:id/export` → tải file.
- [ ] Dashboard nhỏ bằng `apexcharts`: số job theo ngày, tỉ lệ done/failed, thời gian xử lý trung bình, số trang OCR.
- [ ] (Tùy chọn) Hiển thị `confidence` trung bình mỗi trang, cảnh báo trang OCR kém.
- **DoD:** Tải được file export; dashboard hiển thị số liệu thật.

## Phase 6 — i18n & hoàn thiện

- [ ] Thêm key dịch `next-intl` cho cả `vi`/`en` (nhãn, trạng thái, thông báo lỗi).
- [ ] Trạng thái rỗng/loading/skeleton, xử lý lỗi bằng toast, retry job failed.
- [ ] Kiểm tra responsive + dark mode (`next-themes`).
- **DoD:** Đầy đủ song ngữ, UX mượt, không hardcode chuỗi.

---

## Cấu trúc thư mục đề xuất

```
src/
├── app/[locale]/(dashboard)/ocr/
│   ├── page.tsx                 # danh sách job
│   └── [id]/page.tsx            # chi tiết + viewer
├── components/ocr/
│   ├── OcrUploadDialog.tsx
│   ├── OcrJobTable.tsx
│   ├── OcrStatusBadge.tsx
│   ├── OcrPdfViewer.tsx         # pdfjs-dist + overlay bbox (text + figure/table)
│   ├── OcrAssetGallery.tsx      # grid ảnh/figure/table đã tách
│   ├── OcrTableView.tsx         # render tableHtml
│   └── OcrStatsCharts.tsx       # apexcharts
├── services/ocr.service.ts
├── store/ocrSlice.ts
└── types/ocr.ts
```

## Ghi chú kỹ thuật

- **Overlay bbox**: bbox là toạ độ theo ảnh OCR (`width/height` từ API). Khi vẽ trên canvas pdf.js, scale = kích thước render hiện tại / kích thước ảnh OCR.
- **Realtime**: join room theo `userId` hoặc `jobId`; cleanup socket khi unmount.
- **Hiệu năng**: chỉ tải kết quả trang đang xem; cache theo trang trong Redux.
