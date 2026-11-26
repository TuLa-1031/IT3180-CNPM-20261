# IT3180-CNPM-20261 - Phần mềm Quản lý Chung cư BlueMoon

Dự án môn Nhập môn Công nghệ Phần mềm (IT3180) hỗ trợ Ban quản trị chung cư BlueMoon quản lý hộ khẩu, nhân khẩu và thu các khoản phí, đóng góp.

## Cấu trúc thư mục

```text
IT3180_blue_moon/
├── backend/       # Mã nguồn Web Java (Maven + Spring Boot + Spring Data JPA)
├── database/      # Tập lệnh SQL khởi tạo cơ sở dữ liệu MySQL
├── docs/          # Kiến trúc, kế hoạch, quy ước code
├── frontend/      # Giao diện React 19 + Vite 8
├── AGENTS.md      # Quy trình làm việc, SCOPE, ranh giới
├── .env.example   # File mẫu cấu hình biến môi trường kết nối MySQL
└── README.md
```

## Tài liệu

Bắt đầu ở [`docs/README.md`](docs/README.md). Các file chính:

| Tài liệu | Nội dung |
|---|---|
| [`docs/kien-truc-he-thong.md`](docs/kien-truc-he-thong.md) | Kiến trúc, dữ liệu, API, quyền, NFR |
| [`docs/ke-hoach-chia-viec.md`](docs/ke-hoach-chia-viec.md) | Lịch 15 ngày, phân công, hạn |
| [`docs/chi-tiet-cong-viec.md`](docs/chi-tiet-cong-viec.md) | Task từng người, file làm việc, kết quả đầu ra |
| [`docs/quy-uoc-code.md`](docs/quy-uoc-code.md) | Quy ước backend, frontend, database, test, Git |
| [`AGENTS.md`](AGENTS.md) | Quy trình 8 bước, SCOPE, review, AI |

## Hướng dẫn cài đặt và chạy thử

### 1. Khởi tạo cơ sở dữ liệu MySQL
- Mở MySQL Workbench hoặc terminal MySQL (mặc định cổng `3306`).
- Chạy file `database/init_database.sql` để tạo database `bluemoon_db`, các bảng và dữ liệu mẫu.

### 2. Cấu hình kết nối DB ở máy cá nhân
- Tạo file `.env` ở thư mục gốc dự án dựa trên `.env.example` và điền mật khẩu MySQL của bạn:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=bluemoon_db
  DB_USER=root
  DB_PASS=mat_khau_cua_ban
  ```
- *(Lưu ý: File `.env` đã được thêm vào `.gitignore` để không đẩy mật khẩu lên GitHub.)*

### 3. Chạy Backend (Java 21 + Maven)
- Mở thư mục `backend/` bằng IntelliJ IDEA và chạy hàm `main` trong `com.bluemoon.BlueMoonApplication`, hoặc chạy bằng Maven:
  ```bash
  mvn -f backend/pom.xml spring-boot:run
  ```
- Kiểm tra server và kết nối MySQL tại: `http://localhost:8080/api/health`

### 4. Chạy Frontend (React 19 + Vite 8)
- Cài đặt và chạy:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Truy cập `http://localhost:5173`; build bản production bằng `npm run build`.
- Mặc định dùng dữ liệu mẫu. Khi backend chạy ở cổng `8080` hoặc thêm `?api=1`,
  giao diện tự gọi các API `/api/...`. Xem chi tiết trong `frontend/README.md`.
