# Giao diện quản lý chung cư BlueMoon (React + Vite)

Frontend viết bằng React 19 + Vite 8, dùng react-router-dom để điều hướng theo hash.

## Cài đặt và chạy

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất ra frontend/dist
npm run preview  # xem bản build
```

Bản thiết kế HTML/CSS/JS thuần trước đó được giữ nguyên trong `frontend tmp/`.

## Kết nối backend

Mặc định dùng dữ liệu mẫu trùng với `database/init_database.sql` khi backend không chạy.
Khi được phục vụ từ Spring Boot cùng cổng `8080`, ứng dụng tự gọi các API `/api/...`.

Cấu hình tập trung trong `src/lib/config.js`, ưu tiên theo thứ tự:

1. `VITE_API_BASE_URL` (xem `.env.example`, copy sang `.env.local`)
2. `window.BM_CONFIG.apiBase`
3. `?api=1` trên URL
4. Cùng origin, cổng `8080`

### Mở rộng API sau này

Lớp gọi API được tách thành 4 phần, mỗi phần một trách nhiệm:

| File | Việc cần sửa khi mở rộng |
| --- | --- |
| `src/lib/config.js` | Đổi base URL, timeout, bật `writesEnabled` |
| `src/lib/apiClient.js` | Thêm header/auth, retry, xử lý lỗi chung |
| `src/lib/resources.js` | **Thêm resource mới / đổi path / đổi shape response ở đây** |
| `src/lib/data.js` | Chỉ giữ seed và điều phối tải dữ liệu |

- Mỗi resource tải độc lập: một endpoint lỗi chỉ fallback resource đó sang dữ liệu mẫu.
- Response được chuẩn hóa tại `resources.js` (`normalize`), component không phụ thuộc raw JSON.
- Mọi thao tác ghi đều đi qua `commit(resource, mutation)` trong `App.jsx`. Khi backend có
  `POST/PUT/DELETE`, chỉ cần gọi API tại đây dùng `writePath(resource, id)` rồi áp dụng mutation —
  không sửa ở 8 trang.

Backend hiện chỉ có API `GET`, nên thao tác thêm/sửa/thu tiền được lưu trong `localStorage`
(`src/lib/storage.js`).

## Tài khoản dùng thử

- `admin` / `123456`
- `ketoan` / `123456`

Có thể đăng ký tài khoản mới từ màn hình đăng nhập.

## Cấu trúc

```text
src/
├── main.jsx, App.jsx        # entry, provider, router, shell
├── styles.css               # design system (đã tinh chỉnh chống AI-slop)
├── lib/data.js              # dữ liệu mẫu + lớp gọi API
├── lib/format.js            # định dạng tiền/ngày, nhãn enum
├── components/              # Icons, Modal, Toast, UI dùng chung
└── pages/                   # 10 màn hình + đăng nhập
```

## Nguyên tắc thiết kế

- Copy phẳng, đúng nghiệp vụ; không slogan hay câu chữ cảm tính.
- Một hệ thống: bo góc 8/12/20px, một màu hành động, thẻ viền mảnh, không đổ bóng nút, không nhãn VIẾT HOA.
- Chuyển động tiết chế: hero vào một lần khi tải, nút phản hồi con trỏ; tôn trọng `prefers-reduced-motion`.
- Mỗi màn hình giữ một hành động chính; bỏ thành phần trang trí không có chức năng.
- Hỗ trợ bàn phím: skip link, `aria-current`, `aria-expanded`, nhãn trường liên kết ô nhập, `<th scope="col">`.
