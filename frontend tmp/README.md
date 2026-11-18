# Giao diện quản lý chung cư BlueMoon

Giao diện web thuần HTML/CSS/JavaScript, không cần bước build.

## Chạy giao diện

- Cách 1: mở trực tiếp `frontend/index.html` trong trình duyệt.
- Cách 2: chạy máy chủ tĩnh tại thư mục `frontend`, ví dụ `python -m http.server 4173`,
  rồi truy cập `http://localhost:4173`.

## Kết nối backend

- Mặc định dùng dữ liệu mẫu (trùng với dữ liệu khởi tạo trong `database/init_database.sql`).
- Khi được phục vụ từ Spring Boot cùng cổng `8080`, giao diện tự động gọi các API
  `/api/...`. Có thể ép dùng API bằng cách thêm `?api=1` vào URL hoặc khai báo
  `window.BM_CONFIG = { apiBase: "http://localhost:8080/api" }` trước các script.
- Backend hiện mới chỉ có các API `GET`, nên các thao tác thêm/sửa/thu tiền được lưu
  tại `localStorage` của trình duyệt (để demo luồng nghiệp vụ).

## Tài khoản dùng thử

- `admin` / `123456`
- `ketoan` / `123456`

Có thể đăng ký tài khoản mới từ màn hình đăng nhập.

## Nguyên tắc thiết kế

- Copy phẳng, nói đúng nghiệp vụ; không slogan hay câu chữ cảm tính.
- Một hệ thống: bo góc 8/12/20px, một màu hành động, bảng và thẻ viền mảnh,
  không đổ bóng nút, không nhãn VIẾT HOA, không dấu `·` làm meta.
- Chuyển động có tiết chế: vào trang một lần, vòng tỷ lệ thu đếm một lần khi tải,
  nút/phản hôi theo con trỏ; tôn trọng `prefers-reduced-motion`.
- Bỏ các thành phần trang trí không có chức năng; mỗi màn hình chỉ giữ một
  hành động chính và các thao tác cần thiết cho nghiệp vụ.
- Hỗ trợ bàn phím: skip link, `aria-current`, `aria-expanded`, nhãn trường liên kết
  với ô nhập, tiêu đề bảng có `scope="col"`.
