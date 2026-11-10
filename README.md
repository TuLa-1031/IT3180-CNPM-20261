# IT3180-CNPM-20261 - Phần mềm Quản lý Chung cư BlueMoon

Dự án môn Nhập môn Công nghệ Phần mềm (IT3180) hỗ trợ Ban quản trị chung cư BlueMoon quản lý hộ khẩu, nhân khẩu và thu các khoản phí, đóng góp.

## Cấu trúc thư mục

```text
IT3180_blue_moon/
├── backend/       # Mã nguồn Web Java (Maven + Spring Boot Web + JDBC)
├── database/      # Tập lệnh SQL khởi tạo cơ sở dữ liệu MySQL
├── frontend/      # Mã nguồn giao diện người dùng
├── .env.example   # File mẫu cấu hình biến môi trường kết nối MySQL
└── README.md
```

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
