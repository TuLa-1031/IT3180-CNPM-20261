# Chi tiết công việc từng người

Tài liệu này đi kèm [kế hoạch chia việc](ke-hoach-chia-viec.md). Mỗi người chỉ đọc phần của mình; mã task dùng để đặt tên nhánh và ghi trong PR. Quy ước code ở [quy-uoc-code.md](quy-uoc-code.md).

## Mấy từ cần biết

- **API** là đường dẫn để giao diện lấy dữ liệu. Ví dụ `GET /api/households` trả danh sách hộ.
- **Database** là nơi lưu dữ liệu. Dự án dùng MySQL.
- **Migration** là một file SQL để tạo hoặc sửa bảng.
- **Controller** là hàm nhận yêu cầu từ giao diện. **Service** là hàm xử lý nghiệp vụ. **Repository** là hàm đọc/ghi database. **Entity** là class mô tả một bảng. **DTO** là class nhận/trả dữ liệu.
- **Postman** là công cụ gọi API để xem kết quả.
- **Token** là chuỗi giao diện gửi kèm mỗi lần gọi API, để không phải đăng nhập lại.
- **Commit** là một lần lưu thay đổi; **PR** là yêu cầu gộp nhánh của bạn vào bản chính, Lâm xem rồi gộp.
- **Mã lỗi HTTP:** 400 dữ liệu sai, 401 chưa đăng nhập/sai mật khẩu, 403 không có quyền, 404 không tìm thấy, 409 trùng dữ liệu.
- **Dữ liệu mẫu (seed)** là dữ liệu có sẵn để chạy thử.
- **Nhánh Git** là bản sao code để bạn làm việc; xong thì gửi Lâm gộp.
- **Build** là chạy lệnh kiểm tra code có lỗi không.

Thứ tự làm một việc: tạo bảng/migration → entity → repository → DTO → service → controller → gọi API bằng Postman → làm giao diện → chạy lại.

Quay lại [kế hoạch chia việc](ke-hoach-chia-viec.md) khi cần xem lịch, hạn, luật.

Mỗi đợt có 1 ngày cuối để dự phòng: 29/11, 03/12, 07/12, 10/12. Task giữ nguyên thứ tự, chỉ dời ngày theo đợt.

## Lâm — nền móng + tài liệu

File của bạn: `pom.xml`, `application.properties`, `security/`, `exception/`, `config/`, `enums/`, `dto/auth/`, `AuthService`, `AuthController`, `UserEntity`, `UserRepository`, `Notification*`, `HealthController`; `app/`, `lib/`, `components/ui.jsx`, `styles.css`, `App.jsx`, `main.jsx`, `vite.config.js`, `pages/Login.jsx`, `pages/Dashboard.jsx`, `pages/Statistics.jsx`, `pages/Account.jsx`, `features/_template/`, `features/notifications/`, `features/reports/`; `database/init_database.sql`, `migrations/*-uc00-auth.sql`, `migrations/*-notifications.sql`; `docs/`.

Không sửa file ngoài danh sách này.

### Đợt 1 · 26–29/11

**File làm việc:** `pom.xml`, `application.properties`, `security/`, `AuthController`, `AuthService`, `UserEntity`, `UserRepository`, `dto/auth/`, `exception/`, `config/CorsConfig`, `lib/auth.js`, `lib/apiClient.js`, `pages/Login.jsx`, `App.jsx`, `vite.config.js`, `app/`, `features/_template/`, `lib/resources.js`, `components/ui.jsx`, `lib/format.js`, `migrations/20261127-uc00-auth.sql`, `database/init_database.sql`, `docs/api-conventions.md`.

**Kết quả đầu ra:** `security/JwtTokenProvider.java`, `JwtAuthFilter.java`, `UserDetailsServiceImpl.java`, `SecurityConfig.java`, `AuthController.java`, `AuthService.java`, `dto/auth/*`, `exception/*`, `dto/ErrorResponse.java`, `config/CorsConfig.java`, `app/AdminLayout.jsx`, `app/ResidentLayout.jsx`, `features/_template/*`, `App.jsx`, `lib/auth.js`, `lib/apiClient.js`, `lib/resources.js`, `components/ui.jsx`, `lib/format.js`, `pages/Login.jsx`, `migrations/20261127-uc00-auth.sql`, `database/init_database.sql`, `docs/api-conventions.md`.

**G1-L1 · 26/11 (ngày 1) — Làm đăng nhập.**

Việc: thêm thư viện bảo mật; viết chỗ kiểm tra tài khoản và mật khẩu; làm API đăng nhập, xem thông tin mình, đổi mật khẩu; viết file SQL thêm cột cho bảng `users` và 5 tài khoản mẫu.

Cụ thể: `POST /api/auth/login` nhận `username`, `password`, trả `token` và `user`; `GET /api/auth/me`; `PUT /api/auth/password`. Bảng `users` thêm `resident_id`, vai trò `TECHNICIAN`/`RESIDENT`; sai mật khẩu 401, tài khoản khóa 403.

File: `pom.xml`, `security/`, `AuthController`, `AuthService`, `UserEntity`, `migrations/20261127-uc00-auth.sql`.

Xong khi: dùng Postman gọi `POST /api/auth/login` bằng tài khoản `admin`/`123456` nhận được token; sai mật khẩu trả lỗi 401.

**G1-L2 · 27/11 (ngày 2) — Chuẩn lỗi và làm trang đăng nhập.**

Việc: viết chỗ trả lỗi chung (400, 401, 403, 404, 409); bật CORS (cho phép giao diện gọi backend); làm trang đăng nhập gọi API thật; lưu token; chặn trang khi chưa đăng nhập; thêm cấu hình để giao diện gọi được backend khi chạy riêng.

Cụ thể: Lỗi trả `{status, code, message, fieldErrors}`; CORS cho `http://localhost:5173`. Form đăng nhập 2 ô, lỗi hiện dưới nút; token lưu để gắn vào mọi request.

File: `exception/`, `dto/ErrorResponse`, `config/CorsConfig`, `lib/auth.js`, `lib/apiClient.js`, `pages/Login.jsx`, `App.jsx`, `vite.config.js`.

Xong khi: mở `http://localhost:5173`, đăng nhập bằng 5 tài khoản; sai mật khẩu hiện thông báo; chưa đăng nhập thì bị đưa về trang login.

**G1-L3 · 28/11 (ngày 3) — Khung hai giao diện và hướng dẫn API.**

Việc: làm khung trang cho nhân viên và cho cư dân; làm trang mẫu; thêm toàn bộ route cho 5 nghiệp vụ và entry `resources` cho tất cả endpoint (GET/CRUD/action) theo spec §7.4; thêm nhãn trạng thái; viết `docs/api-conventions.md`.

Cụ thể: Menu nhân viên: Tổng quan, Cư dân, Thu phí, Phản ánh, Bảo trì, Gửi xe, Hệ thống. Menu cư dân: Hóa đơn, Phản ánh, Gửi xe, Thông báo. Trang mẫu có bảng, nút Thêm, modal 2 ô, ô tìm kiếm. Route đủ 5 UC; resources đủ endpoint, gồm notifications/stats; `StatusBadge` có nhãn mới.

File: `app/`, `features/_template/`, `App.jsx`, `lib/resources.js`, `components/ui.jsx`, `lib/format.js`.

Xong khi: nhân viên vào giao diện nhân viên, cư dân vào giao diện cư dân; trang mẫu chạy; build không lỗi.

### Đợt 2 · 30/11–03/12

**File làm việc:** `app/ResidentLayout.jsx`, `pages/Account.jsx`, `App.jsx`, `lib/resources.js`, `docs/api-conventions.md`.

**Kết quả đầu ra:** `app/ResidentLayout.jsx`, `pages/Account.jsx`; route/resources đã kiểm tra; `docs/api-conventions.md` cập nhật.

**G2-L1 · 30/11 (ngày 1) — Kiểm tra route/resources và xem code.**

Việc: kiểm tra route/resources đã có từ G1; chỉ bổ sung nếu thiếu; xem code mọi người gửi; sửa lỗi tích hợp.

Cụ thể: route `/feedbacks`, `/maintenance`, `/vehicles/registrations`, `/vehicles/cards` đã có; resources đủ endpoint; ghi lỗi thiếu vào PR.

File: `App.jsx`, `lib/resources.js`.

Xong khi: không còn trang/endpoint nào thiếu route/resources.

**G2-L2 · 01/12 (ngày 2) — Làm khung giao diện cư dân.**

Việc: làm menu cư dân; làm trang chờ cho hóa đơn, phản ánh, gửi xe, thông báo; làm trang đổi mật khẩu.

Cụ thể: Menu cư dân 4 mục; trang chờ cho từng mục; đổi mật khẩu gồm ô mật khẩu cũ, mới, xác nhận.

File: `app/ResidentLayout.jsx`, `pages/Account.jsx`.

Xong khi: cư dân đăng nhập thấy menu của mình.

**G2-L3 · 02/12 (ngày 3) — Chạy thử và sửa lỗi.**

Việc: chạy luồng thêm hộ, thêm nhân khẩu, tạo khoản thu, sinh hóa đơn, nộp tiền, duyệt tiền; sửa lỗi; cập nhật hướng dẫn API.

Cụ thể: Chạy luồng thêm hộ/nhân khẩu và tạo khoản thu/sinh hóa đơn/nộp/duyệt; kiểm 401 khi hết token, 403 khi sai quyền.

File: `docs/api-conventions.md`.

Xong khi: luồng của Đức Anh và Kiên chạy được từ đầu đến cuối.

### Đợt 3 · 04–07/12

**File làm việc:** `Notification*`, `migrations/*-notifications.sql`, `features/notifications/`, `features/reports/`, `app/ResidentHome.jsx`, `pages/Dashboard.jsx`, `pages/Statistics.jsx`.

**Kết quả đầu ra:** `NotificationEntity/Repository/Service/Controller`, `migrations/*-notifications.sql`, `app/ResidentHome.jsx`, `pages/Dashboard.jsx`, `pages/Statistics.jsx`, `features/notifications/`, `features/reports/`.

**G3-L1 · 04/12 (ngày 1) — Làm thông báo và thống kê.**

Việc: làm bảng thông báo và API đọc thông báo, đánh dấu đã đọc; làm API thống kê cơ bản.

Cụ thể: Bảng `notifications`: `user_id, type, title, content, link, is_read`. `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`; thống kê: `GET /api/stats/overview`, `/revenue`, `/debts`, `/feedbacks`, `/maintenance`, `/residents`. Route notifications/stats đã có từ G1.

File: `Notification*`, `migrations/*-notifications.sql`, `features/notifications/`, `features/reports/`.

Xong khi: có thông báo khi có việc mới; stats trả số liệu.

Nếu chậm, bỏ phần thông báo, giữ thống kê cơ bản. Không ảnh hưởng năm phần chính.

**G3-L2 · 05/12 (ngày 2) — Làm trang chủ cư dân và trang thống kê.**

Việc: làm trang chủ cư dân tổng hợp hóa đơn, phản ánh, đăng ký xe, thông báo; làm lại trang tổng quan và trang thống kê để lấy số liệu thật.

Cụ thể: Trang chủ cư dân 4 thẻ: hóa đơn sắp đến hạn, phản ánh đang xử lý, đăng ký xe, thông báo. Dashboard 4 số: hộ, thu tháng, nợ, phản ánh mới.

File: `app/ResidentHome.jsx`, `pages/Dashboard.jsx`, `pages/Statistics.jsx`.

Xong khi: cư dân thấy đúng dữ liệu của hộ mình; nhân viên thấy số liệu thật.

**G3-L3 · 06/12 (ngày 3) — Chạy cả năm luồng và sửa lỗi.**

Việc: chạy năm luồng chính; thử cư dân A xem dữ liệu hộ B (phải bị chặn); sửa lỗi; cập nhật tài liệu.

Cụ thể: Chạy 5 luồng; cư dân A mở hộ B phải 403; sửa lỗi; cập nhật tài liệu.

Xong khi: năm luồng chạy được, không lỗi chặn quyền.

### Đợt 4 · 08–10/12

**File làm việc:** `database/init_database.sql`, `docs/**`, `README.md`.

**Kết quả đầu ra:** `database/init_database.sql` hợp nhất 17 bảng; bộ tài liệu cuối; tag `v1.0`.

**G4-L1 · 08/12 (ngày 1) — Gộp database và chạy lại toàn bộ.**

Việc: gộp tất cả migration và dữ liệu mẫu vào `init_database.sql`; chạy trên MySQL sạch; chạy test backend; build frontend; sửa lỗi còn lại.

Cụ thể: Gộp 17 bảng + dữ liệu mẫu vào `init_database.sql`; chạy trên MySQL sạch; `mvn test`, `npm run build`.

Xong khi: máy sạch làm đúng hướng dẫn trong README; test và build không lỗi.

**G4-L2 · 09/12 (ngày 2) — Viết tài liệu, chạy thử demo, gắn phiên bản.**

Việc: hoàn thiện spec, hướng dẫn API, mô tả database, báo cáo test, kịch bản demo, hướng dẫn sử dụng, slide; chạy thử demo năm luồng; gắn phiên bản `v1.0`.

Cụ thể: Hoàn thiện spec, API, DB, test report, demo script, user guide, slide; chạy demo 5 luồng; tag `v1.0`.

Xong khi: tài liệu đủ; demo trơn.

## Đức Anh — UC02 thu phí, công nợ

File của bạn: `Fee*`, `Payment*`, `PaymentTransaction*`, `UtilityBill*`; `pages/Fees.jsx`, `pages/Payments.jsx`, `pages/Bills.jsx`, `features/fees/`; `migrations/*-uc02-*.sql`, `database/seed/uc02.sql`; `tests/postman/uc02.json`.

Không sửa file ngoài danh sách này.

### Đợt 1 · 26–29/11

**File làm việc:** `migrations/20261127-uc02-payment-transactions.sql`, `PaymentTransaction*`, `Fee*`, `Payment*`, `UtilityBill*`, `dto/fee/`, `dto/payment/`, `pages/Fees.jsx`, `pages/Payments.jsx`, `pages/Bills.jsx`, `features/fees/api.js`, `tests/postman/uc02.json`.

**Kết quả đầu ra:** `payment_transactions` table; `PaymentTransactionEntity/Repository`; `FeeController`, `PaymentController`, `UtilityBillController` (GET); `dto/fee/*`, `dto/payment/*`, `dto/utility/*`; 3 trang; `tests/postman/uc02.json`.

**G1-A1 · 26/11 (ngày 1) — Tạo bảng thanh toán (UC02).**

Việc: viết migration cho `payment_transactions`; viết class và repository.

Cụ thể: Bảng `payment_transactions`: `payment_id`, `amount`, `method`, `paid_at`, `status`, `recorded_by`, `approved_by`, `approved_at`, `note`; chỉ mục `(payment_id, status)`.

File: `migrations/20261127-uc02-payment-transactions.sql`, `PaymentTransaction*`.

Xong khi: chạy migration không lỗi; mở app, app nhận đúng bảng.

**G1-A2 · 27/11 (ngày 2) — Làm API đọc cho thu phí (UC02).**

Việc: viết phần nhận/trả dữ liệu và API đọc danh sách, xem chi tiết cho khoản thu, thanh toán, thu hộ. Lọc cơ bản theo trạng thái.

Cụ thể: `GET /api/fees?status&year&month`; `GET /api/payments?feeId&householdId&status`; `GET /api/utility-bills?householdId&month&year`; trả danh sách có phân trang.

File: `Fee*`, `Payment*`, `UtilityBill*`.

Xong khi: gọi `GET /api/fees`, `/api/payments`, `/api/utility-bills` thấy dữ liệu từ MySQL.

**G1-A3 · 27/11 (ngày 2, làm tiếp) — Nối 3 trang thu phí vào API (UC02).**

Việc: sửa 3 trang để lấy dữ liệu từ API thay vì dữ liệu mẫu.

Cụ thể: Trang Khoản thu: cột Mã, Tên, Loại, Đơn giá, Kỳ, Trạng thái. Trang Thu phí: Hộ, Khoản thu, Phải thu, Đã thu, Trạng thái. Trang Thu hộ: Hộ, Dịch vụ, Kỳ, Tiền, Trạng thái.

File: `pages/Fees.jsx`, `pages/Payments.jsx`, `pages/Bills.jsx`, `features/fees/api.js`.

Xong khi: mở 3 trang thấy dữ liệu thật; tắt backend thì báo lỗi, không tự hiện dữ liệu mẫu.

**G1-A4 · 28/11 (ngày 3) — Lọc, sửa lỗi, viết Postman (UC02).**

Việc: thêm lọc theo trạng thái và tháng; sửa lỗi hiển thị; viết bộ request Postman.

Cụ thể: Postman: login → 3 GET; thiếu token 401; lọc theo trạng thái/tháng.

File: `tests/postman/uc02.json`.

Xong khi: 3 trang và 3 API chạy ổn; build không lỗi.

### Đợt 2 · 30/11–03/12

**File làm việc:** `FeeService/Controller`, `PaymentService/Controller`, `PaymentTransaction*`, `UtilityBill*`, `dto/fee/`, `dto/payment/`, `pages/Fees.jsx`, `pages/Payments.jsx`, `pages/Bills.jsx`, `features/fees/pages/MyBills.jsx`, `tests/postman/uc02.json`.

**Kết quả đầu ra:** `FeeService/Controller`, `PaymentService/Controller`, `PaymentTransaction*`, `UtilityBill*`; form 3 trang; `MyBills.jsx`; `tests/postman/uc02.json`.

**G2-A1 · 30/11 (ngày 1) — Làm thêm, sửa, xóa khoản thu.**

Việc: làm API thêm, sửa, xóa khoản thu; làm API sinh hóa đơn cho tất cả hộ đang ở; làm API đóng khoản thu.

Cụ thể: `POST /api/fees`, `PUT/DELETE /api/fees/{id}`; `POST /api/fees/{id}/generate`, `POST /api/fees/{id}/close`. Mã không trùng, đơn giá ≥ 0, tháng 1-12; sinh theo diện tích / cố định / theo xe / tự nguyện; bỏ hộ đã có hóa đơn.

File: `FeeService`, `FeeController`, `dto/fee/`.

Xong khi: tạo một khoản thu, bấm sinh hóa đơn thì mỗi hộ đang ở có một dòng; bấm đóng thì không sinh thêm.

**G2-A2 · 01/12 (ngày 2) — Làm nộp tiền, duyệt tiền, tính công nợ.**

Việc: làm API ghi nhận nộp tiền, duyệt hoặc từ chối; tính còn nợ; chặn nộp vượt số nợ; làm phần thu hộ điện nước.

Cụ thể: `GET /api/payments/{id}`, `GET/POST /api/payments/{id}/transactions`, `PATCH /api/transactions/{id}/approve` hoặc `PATCH /api/transactions/{id}/reject`, `GET /api/fees/{id}/debts`; thu hộ: `POST /api/utility-bills`, `PUT/DELETE /api/utility-bills/{id}`, `PATCH /api/utility-bills/{id}/pay`. Giao dịch gồm `amount`, `method`, `note`; duyệt cộng `amount_paid`; vượt nợ 409.

File: `PaymentService`, `PaymentController`, `PaymentTransaction*`, `UtilityBill*`.

Xong khi: nộp một phần thì trạng thái là "nộp một phần"; duyệt đủ thì thành "đã nộp"; nộp vượt báo lỗi.

**G2-A3 · 02/12 (ngày 3) — Làm form và trang cư dân.**

Việc: làm form thêm, sửa, sinh, đóng trên trang khoản thu; làm form ghi nhận và duyệt tiền trên trang thu phí; làm trang thu hộ; làm trang cư dân xem hóa đơn và nộp tiền.

Cụ thể: Modal khoản thu: Mã, Tên, Loại, Đơn giá, Tháng, Năm, Hạn. Modal thu tiền: Số tiền, Phương thức, Ghi chú. Trang cư dân hiện hóa đơn và nút Nộp.

File: `pages/Fees.jsx`, `pages/Payments.jsx`, `pages/Bills.jsx`, `features/fees/pages/MyBills.jsx`.

Xong khi: làm được cả luồng trên màn hình, không phải gọi Postman; cập nhật `tests/postman/uc02.json`.

### Đợt 3 · 04–07/12

**File làm việc:** `PaymentService/Controller`, `PaymentTransaction*`, `features/fees/pages/MyBills.jsx`, `tests/postman/uc02.json`.

**Kết quả đầu ra:** Mã giao dịch + duyệt idempotent; lịch sử/biên lai cư dân; `tests/postman/uc02.json`.

**G3-A1 · 04/12 (ngày 1) — Hoàn thiện duyệt tiền và biên lai (UC02).**

Việc: kiểm tra lại luồng duyệt/từ chối giao dịch; thêm mã giao dịch; sửa lỗi cộng trừ công nợ.

Cụ thể: Duyệt lại không tạo giao dịch thứ hai; mỗi giao dịch có mã; công nợ = phải thu − đã thu; không duyệt quá số nợ.

File: `PaymentService`, `PaymentController`, `PaymentTransaction*`.

Xong khi: duyệt/từ chối đúng; công nợ sau mỗi giao dịch đúng; mỗi giao dịch có mã.

**G3-A2 · 05/12 (ngày 2) — Làm trang lịch sử giao dịch và biên lai cho cư dân (UC02).**

Việc: làm trang cư dân xem lịch sử các lần nộp, xem mã giao dịch và biên lai; kiểm tra cư dân chỉ thấy hộ mình.

Cụ thể: Trang cư dân: lịch sử gồm Ngày, Số tiền, Phương thức, Trạng thái, Mã giao dịch; xem biên lai.

File: `features/fees/pages/MyBills.jsx`, `PaymentController`.

Xong khi: cư dân xem được lịch sử và biên lai; chỉ thấy hộ mình.

**G3-A3 · 06/12 (ngày 3) — Chạy lại UC02 và hỗ trợ tích hợp.**

Việc: chạy lại toàn bộ luồng thu phí; sửa lỗi; cập nhật Postman; hỗ trợ Lâm kiểm tra.

Cụ thể: Chạy lại UC02; cập nhật `tests/postman/uc02.json`; hỗ trợ Lâm kiểm tra.

File: `tests/postman/uc02.json`.

Xong khi: UC02 chạy từ đầu đến cuối; Postman đủ.

### Đợt 4 · 08–10/12

**File làm việc:** `database/seed/uc02.sql`, `tests/postman/uc02.json`.

**Kết quả đầu ra:** `database/seed/uc02.sql` (6 khoản thu, 10 giao dịch); demo UC02.

**G4-A1 · 08/12 (ngày 1) — Chạy lại thu phí và công nợ (UC02).**

Việc: chạy lại các luồng; viết dữ liệu mẫu cho khoản thu, thanh toán; sửa lỗi.

Cụ thể: Chạy lại UC02; tạo dữ liệu mẫu 6 khoản thu, 10 giao dịch; sửa lỗi.

Xong khi: các luồng chạy ổn; dữ liệu mẫu đủ để demo.

**G4-A2 · 09/12 (ngày 2) — Demo phần thu phí và công nợ (UC02).**

Việc: chuẩn bị tài khoản, dữ liệu, kịch bản; demo.

Cụ thể: Demo UC02: tạo khoản thu → sinh → nộp một phần → duyệt → xem công nợ.

Xong khi: demo đúng luồng.

## Kiên — UC01 cư dân, căn hộ

File của bạn: `Household*`, `Resident*`, `ResidenceChange*`; `pages/Households.jsx`, `pages/Residents.jsx`, `pages/Changes.jsx`, `features/households/`; `migrations/*-uc01-*.sql`, `database/seed/uc01.sql`; `tests/postman/uc01.json`.

Không sửa file ngoài danh sách này.

### Đợt 1 · 26–29/11

**File làm việc:** `dto/household/`, `dto/resident/`, `dto/change/`, `Household*`, `Resident*`, `ResidenceChange*`, `pages/Households.jsx`, `pages/Residents.jsx`, `pages/Changes.jsx`, `features/households/api.js`, `tests/postman/uc01.json`.

**Kết quả đầu ra:** `dto/household/*`, `dto/resident/*`, `dto/change/*`; `HouseholdController`, `ResidentController`, `ResidenceChangeController` (GET); 3 trang; `tests/postman/uc01.json`.

**G1-K1 · 26/11 (ngày 1) — Đọc code và viết phần nhận/trả dữ liệu.**

Việc: đọc 3 bảng hộ, nhân khẩu, biến động; viết class nhận/trả dữ liệu cho 3 phần này.

Cụ thể: `HouseholdRequest`: `householdCode, apartmentNumber, floor, area, ownerName, phone, moveInDate, status`. `ResidentRequest`: `householdId, fullName, dateOfBirth, gender, identityCard, relationshipToOwner, occupation, hometown, residenceStatus, note`. `ResidenceChangeRequest`: `residentId, householdId, changeType, startDate, endDate, destinationOrOrigin, reason`.

File: `dto/household/`, `dto/resident/`, `dto/change/`.

Xong khi: code chạy được; bạn giải thích được một hộ có nhiều nhân khẩu, một nhân khẩu có nhiều biến động.

**G1-K2 · 27/11 (ngày 2) — Làm API đọc và nối 3 trang.**

Việc: viết API đọc danh sách, xem chi tiết, lọc; nối 3 trang vào API.

Cụ thể: `GET /api/households?q&status`; `/residents?householdId&q&residenceStatus`; `/residence-changes?householdId&changeType`. Trang Hộ: Mã, Căn hộ, Tầng, Diện tích, Chủ hộ, Số nhân khẩu, Trạng thái. Trang Nhân khẩu: Họ tên, CCCD, Quan hệ, Ngày sinh, Trạng thái. Trang Biến động: Nhân khẩu, Hộ, Loại, Từ ngày, Đến ngày.

File: `Household*`, `Resident*`, `ResidenceChange*`, `pages/Households.jsx`, `pages/Residents.jsx`, `pages/Changes.jsx`, `features/households/api.js`.

Xong khi: mở 3 trang thấy dữ liệu thật.

**G1-K3 · 28/11 (ngày 3) — Lọc và sửa lỗi.**

Việc: thêm lọc theo trạng thái và từ khóa; sửa lỗi hiển thị; viết Postman.

Cụ thể: Tìm theo tên/mã hộ/CCCD; lọc trạng thái; Postman 3 GET.

File: `features/households/constants.js`, `tests/postman/uc01.json`.

Xong khi: lọc chạy; build không lỗi.

### Đợt 2 · 30/11–03/12

**File làm việc:** `HouseholdService/Controller`, `ResidentService/Controller`, `ResidenceChangeService/Controller`, `dto/*`, `pages/Households.jsx`, `pages/Residents.jsx`, `pages/Changes.jsx`, `tests/postman/uc01.json`.

**Kết quả đầu ra:** `HouseholdService/Controller`, `ResidentService/Controller`, `ResidenceChangeService/Controller`; form 3 trang; `tests/postman/uc01.json`.

**G2-K1 · 30/11 (ngày 1) — Làm thêm, sửa, xóa hộ.**

Việc: làm API thêm, sửa, xóa hộ; kiểm tra trùng mã hộ; không cho xóa hộ đã có tiền hoặc nhân khẩu.

Cụ thể: `POST /api/households`, `PUT/DELETE /api/households/{id}`; mã hộ không trùng, tầng 1-50, diện tích > 0; không xóa hộ đã có nhân khẩu hoặc thanh toán.

File: `HouseholdService`, `HouseholdController`, `dto/household/`.

Xong khi: thêm được hộ mới; sửa được; trùng mã báo lỗi; xóa hộ đã có tiền bị chặn.

**G2-K2 · 01/12 (ngày 2) — Làm nhân khẩu và biến động.**

Việc: làm API thêm, sửa, xóa nhân khẩu; kiểm tra trùng CCCD; làm API ghi nhận tạm trú, tạm vắng, chuyển đến, chuyển đi.

Cụ thể: `POST /api/residents`, `PUT/DELETE /api/residents/{id}`; CCCD 9-12 số, không trùng; biến động có `changeType`, `startDate`, `endDate`, `reason`.

File: `ResidentService`, `ResidentController`, `ResidenceChangeService`, `ResidenceChangeController`.

Xong khi: thêm được nhân khẩu; trùng CCCD báo lỗi; ghi được một lần chuyển đi.

**G2-K3 · 02/12 (ngày 3) — Làm form hộ, nhân khẩu, biến động.**

Việc: làm form thêm, sửa, xóa trên trang hộ, nhân khẩu, biến động; thêm lọc.

Cụ thể: Modal hộ: mã, số căn, tầng, diện tích, chủ hộ, điện thoại, ngày vào ở. Modal nhân khẩu: họ tên, ngày sinh, giới tính, CCCD, quan hệ, nghề, quê, trạng thái. Modal biến động: nhân khẩu, loại, từ ngày, đến ngày, lý do.

File: `pages/Households.jsx`, `pages/Residents.jsx`, `pages/Changes.jsx`.

Xong khi: làm được trên màn hình, thông báo lỗi bằng tiếng Việt.

### Đợt 3 · 04–07/12

**File làm việc:** `pages/Changes.jsx`, `HouseholdService`, `features/households/pages/MyHousehold.jsx`, `tests/postman/uc01.json`.

**Kết quả đầu ra:** Trang biến động đầy đủ; quy tắc `MOVED_OUT`; `MyHousehold.jsx`; `tests/postman/uc01.json`.

**G3-K1 · 04/12 (ngày 1) — Làm trang biến động và quy tắc hộ chuyển đi.**

Việc: làm form biến động đầy đủ; chặn thao tác trên hộ đã chuyển đi; thêm tìm kiếm và phân trang.

Cụ thể: Trang Biến động có form đầy đủ; hộ `MOVED_OUT` không nhận hóa đơn mới; tìm theo tên/mã; phân trang 20 dòng.

File: `pages/Changes.jsx`, `HouseholdService`.

Xong khi: ghi được chuyển đi; hộ đã chuyển đi không nhận hóa đơn mới.

**G3-K2 · 05/12 (ngày 2) — Làm trang cư dân xem hộ mình.**

Việc: làm trang cư dân xem thông tin hộ và nhân khẩu của mình; sửa thông báo lỗi.

Cụ thể: Trang cư dân xem hộ mình: mã hộ, căn hộ, tầng, diện tích, danh sách nhân khẩu; chỉ đọc.

File: `features/households/pages/MyHousehold.jsx`.

Xong khi: cư dân chỉ thấy hộ mình.

**G3-K3 · 06/12 (ngày 3) — Chạy lại phần cư dân và căn hộ.**

Việc: chạy lại các luồng; sửa lỗi; viết Postman.

Cụ thể: Chạy lại UC01; Postman `uc01.json`; sửa lỗi.

File: `tests/postman/uc01.json`.

Xong khi: phần cư dân và căn hộ chạy ổn.

### Đợt 4 · 08–10/12

**File làm việc:** `database/seed/uc01.sql`.

**Kết quả đầu ra:** `database/seed/uc01.sql` (8 hộ, 13 nhân khẩu, 3 biến động); demo UC01.

**G4-K1 · 08/12 (ngày 1) — Chạy lại cư dân và căn hộ.**

Việc: chạy lại các luồng; viết dữ liệu mẫu cho hộ, nhân khẩu, biến động; sửa lỗi.

Cụ thể: Chạy lại UC01; tạo dữ liệu mẫu 8 hộ, 13 nhân khẩu, 3 biến động; sửa lỗi.

Xong khi: các luồng chạy ổn; dữ liệu mẫu đủ để demo.

**G4-K2 · 09/12 (ngày 2) — Demo phần cư dân và căn hộ.**

Việc: chuẩn bị kịch bản; demo.

Cụ thể: Demo UC01: thêm hộ, thêm nhân khẩu, sửa, chuyển đi.

Xong khi: demo đúng luồng.

## Đức — UC03 phản ánh + UC05 gửi xe

File của bạn: `Feedback*`, `Vehicle*`, `VehicleRegistration*`, `ParkingCard*`; `features/feedbacks/`, `features/vehicles/`, `pages/Vehicles.jsx`; `migrations/*-uc03-*.sql`, `migrations/*-uc05-*.sql`, `database/seed/uc03.sql`, `database/seed/uc05.sql`; `tests/postman/uc03.json`, `tests/postman/uc05.json`.

Không sửa file ngoài danh sách này.

### Đợt 1 · 26–29/11

**File làm việc:** `migrations/20261127-uc03-feedbacks.sql`, `Feedback*`, `features/feedbacks/api.js`, `features/feedbacks/constants.js`, `features/feedbacks/pages/FeedbackList.jsx`, `features/feedbacks/pages/FeedbackDetail.jsx`, `tests/postman/uc03.json`, `migrations/20261127-uc05-vehicle-registrations.sql`, `VehicleRegistration*`, `ParkingCard*`.

**Kết quả đầu ra:** `FeedbackEntity/Repository`, `FeedbackController/Service` (POST/GET), `FeedbackList/Detail`; `tests/postman/uc03.json`; `VehicleRegistrationEntity/Repository`, `ParkingCardEntity/Repository`.

**G1-D1 · 26/11 (ngày 1) — Tạo bảng phản ánh (UC03).**

Việc: viết migration cho bảng `feedbacks`; viết class và repository.

Cụ thể: Bảng `feedbacks`: `household_id, resident_id, category, priority, content, status, response, responded_by, responded_at, merged_into_id, attachment_url`; chỉ mục `(status, created_at)`.

File: `migrations/20261127-uc03-feedbacks.sql`, `Feedback*`.

Xong khi: chạy migration; app nhận đúng bảng.

**G1-D2 · 27/11 (ngày 2) — Làm API gửi và đọc phản ánh (UC03).**

Việc: viết API gửi phản ánh, đọc danh sách, xem chi tiết; lọc theo trạng thái và loại. Làm trang danh sách.

Cụ thể: `POST /api/feedbacks` nhận `category, priority, content`; `GET /api/feedbacks?status&category&from&to`; `GET /api/feedbacks/{id}`. Trang danh sách: Mã, Hộ, Người gửi, Loại, Ưu tiên, Trạng thái, Ngày.

File: `Feedback*`, `features/feedbacks/api.js`, `features/feedbacks/constants.js`, `features/feedbacks/pages/FeedbackList.jsx`.

Xong khi: gửi một phản ánh bằng Postman; mở trang thấy phản ánh đó.

**G1-D3 · 27/11 (ngày 2, làm tiếp) — Trang chi tiết và Postman (UC03).**

Việc: làm trang xem chi tiết; viết Postman; sửa lỗi.

Cụ thể: Trang chi tiết: nội dung, trạng thái, người trả lời, nội dung trả lời; nút Nhận xử lý, Phản hồi.

File: `features/feedbacks/pages/FeedbackDetail.jsx`, `tests/postman/uc03.json`.

Xong khi: xem chi tiết được; Postman chạy; build không lỗi.

**G1-D4 · 28/11 (ngày 3) — Tạo 2 bảng gửi xe (UC05).**

Việc: viết migration cho `vehicle_registrations`, `parking_cards`; viết class và repository.

Cụ thể: Bảng `vehicle_registrations`: `household_id, vehicle_id, license_plate, vehicle_type, brand, owner_name, status, reject_reason, requested_by, processed_by, processed_at`. Bảng `parking_cards`: `vehicle_id, card_code, status, issued_date, locked_reason, replaced_by_id`.

File: `migrations/20261127-uc05-vehicle-registrations.sql`, `VehicleRegistration*`, `ParkingCard*`.

Xong khi: chạy migration; app nhận đúng 2 bảng.

### Đợt 2 · 30/11–03/12

**File làm việc:** `FeedbackService/Controller`, `features/feedbacks/pages/FeedbackDetail.jsx`, `features/feedbacks/pages/FeedbackList.jsx`, `features/feedbacks/pages/FeedbackStats.jsx`, `VehicleRegistrationService/Controller`, `ParkingCardService/Controller`, `VehicleService/Controller`, `tests/postman/uc03.json`.

**Kết quả đầu ra:** `FeedbackService/Controller`, 3 trang feedback; `VehicleRegistrationService/Controller`, `ParkingCardService/Controller`, `VehicleService/Controller`; `tests/postman/uc03.json`.

**G2-D1 · 30/11 (ngày 1) — Làm đổi trạng thái và trả lời phản ánh.**

Việc: làm API đổi trạng thái (mới, đang xử lý, đã xử lý, từ chối); làm API trả lời, lưu người trả lời và thời gian.

Cụ thể: `PATCH /api/feedbacks/{id}/status` nhận `status`; chỉ cho `NEW → IN_PROGRESS → RESOLVED/REJECTED`. `POST /api/feedbacks/{id}/respond` nhận `response`, lưu người và thời gian.

File: `FeedbackService`, `FeedbackController`.

Xong khi: đổi trạng thái được; trả lời xong thì phản ánh có nội dung trả lời.

**G2-D2 · 01/12 (ngày 2) — Làm gộp phản ánh và thống kê quý.**

Việc: làm API gộp các phản ánh giống nhau; làm API đếm theo trạng thái trong một quý; làm form trả lời, giao diện chọn nhiều để gộp và bảng thống kê.

Cụ thể: `POST /api/feedbacks/merge` nhận `ids` và `targetId`; `GET /api/stats/feedbacks?year&quarter`. Giao diện: chọn nhiều dòng, nút Gộp; bảng thống kê theo trạng thái.

File: `FeedbackService`, `FeedbackController`, `features/feedbacks/pages/FeedbackDetail.jsx`, `features/feedbacks/pages/FeedbackList.jsx`, `features/feedbacks/pages/FeedbackStats.jsx`.

Xong khi: gộp được trên màn hình; thống kê hiện đúng.

**G2-D3 · 02/12 (ngày 3) — Làm đăng ký gửi xe (UC05).**

Việc: làm API gửi yêu cầu đăng ký; duyệt thì tạo xe và cấp thẻ; từ chối thì bắt buộc nhập lý do; làm API khóa thẻ và cấp lại thẻ; làm API thêm, sửa, xóa xe.

Cụ thể: `POST /api/vehicle-registrations`; `PATCH /api/vehicle-registrations/{id}/approve` hoặc `PATCH /api/vehicle-registrations/{id}/reject`; `POST /api/parking-cards`; `PATCH /api/parking-cards/{id}/lock` hoặc `PATCH /api/parking-cards/{id}/reissue`; `POST /api/vehicles`, `PUT/DELETE /api/vehicles/{id}`. Duyệt tạo xe + thẻ; từ chối cần lý do; duyệt lại 409.

File: `VehicleRegistrationService`, `VehicleRegistrationController`, `ParkingCardService`, `ParkingCardController`, `VehicleService`, `VehicleController`.

Xong khi: duyệt một yêu cầu thì có xe và thẻ; duyệt lại yêu cầu đã duyệt bị chặn; từ chối không có lý do bị chặn.

### Đợt 3 · 04–07/12

**File làm việc:** `features/feedbacks/pages/MyFeedbacks.jsx`, `tests/postman/uc03.json`, `features/vehicles/pages/VehicleRegistrations.jsx`, `features/vehicles/pages/ParkingCards.jsx`, `features/vehicles/pages/MyRegistration.jsx`, `pages/Vehicles.jsx`, `features/vehicles/api.js`, `tests/postman/uc05.json`.

**Kết quả đầu ra:** `MyFeedbacks.jsx`; 3 trang UC05 + nối trang Phương tiện; `tests/postman/uc03.json`, `tests/postman/uc05.json`.

**G3-D1 · 04/12 (ngày 1) — Làm trang cư dân gửi và theo dõi phản ánh (UC03).**

Việc: làm form gửi phản ánh; làm danh sách phản ánh của chính mình; hiện trạng thái và trả lời; chạy lại UC03.

Cụ thể: Trang cư dân: form gửi gồm Loại, Ưu tiên, Nội dung; danh sách của mình gồm Mã, Loại, Trạng thái, Ngày, Trả lời.

File: `features/feedbacks/pages/MyFeedbacks.jsx`, `tests/postman/uc03.json`.

Xong khi: cư dân gửi được; chỉ thấy phản ánh của mình; UC03 chạy ổn.

**G3-D2 · 05/12 (ngày 2) — Làm 3 trang quản lý và trang cư dân gửi xe (UC05).**

Việc: làm trang danh sách yêu cầu, trang thẻ gửi xe; nối trang Phương tiện vào API; làm trang cư dân đăng ký xe và xem trạng thái.

Cụ thể: Trang Yêu cầu: Mã, Hộ, Biển số, Loại xe, Trạng thái, Lý do từ chối; nút Duyệt/Từ chối. Trang Thẻ: Mã thẻ, Biển số, Trạng thái, Ngày cấp; nút Khóa/Cấp lại. Trang Phương tiện: Biển số, Loại xe, Hãng, Chủ xe, Phí tháng, Trạng thái, dữ liệu từ `GET /api/vehicles`. Trang cư dân: form biển số, loại xe, hãng, chủ xe.

File: `features/vehicles/pages/VehicleRegistrations.jsx`, `features/vehicles/pages/ParkingCards.jsx`, `features/vehicles/pages/MyRegistration.jsx`, `pages/Vehicles.jsx`, `features/vehicles/api.js`.

Xong khi: cư dân gửi được; ban quản lý duyệt được; thẻ hiện đúng trạng thái; trang Phương tiện hiện dữ liệu thật.

**G3-D3 · 06/12 (ngày 3) — Chạy thử và viết Postman (UC05).**

Việc: chạy lại cả luồng; sửa lỗi; viết Postman.

Cụ thể: Chạy luồng gửi → duyệt → cấp thẻ → khóa; Postman `uc05.json`; sửa lỗi.

File: `tests/postman/uc05.json`.

Xong khi: luồng gửi xe chạy từ đầu đến cuối.

### Đợt 4 · 08–10/12

**File làm việc:** `database/seed/uc03.sql`, `database/seed/uc05.sql`.

**Kết quả đầu ra:** `database/seed/uc03.sql` (3 phản ánh), `database/seed/uc05.sql` (2 đăng ký, 2 thẻ); demo UC03 + UC05.

**G4-D1 · 08/12 (ngày 1) — Chạy lại phản ánh và gửi xe (tách 2 nhánh: UC03 và UC05).**

Việc: chạy lại các luồng; viết dữ liệu mẫu cho phản ánh, xe, đăng ký, thẻ; sửa lỗi.

Cụ thể: Chạy lại UC03 + UC05; tạo dữ liệu mẫu 3 phản ánh, 2 đăng ký, 2 thẻ; sửa lỗi.

Xong khi: các luồng chạy ổn; dữ liệu mẫu đủ để demo.

**G4-D2 · 09/12 (ngày 2) — Demo phần phản ánh và gửi xe (mỗi UC một nhánh).**

Việc: chuẩn bị kịch bản; demo.

Cụ thể: Demo UC03 + UC05: gửi phản ánh, phản hồi, đăng ký xe, duyệt, khóa thẻ.

Xong khi: demo đúng luồng.

## Sơn — UC04 bảo trì

File của bạn: `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`; `features/maintenance/`; `migrations/*-uc04-*.sql`, `database/seed/uc04.sql`; `tests/postman/uc04.json`.

Không sửa file ngoài danh sách này.

### Đợt 1 · 26–29/11

**File làm việc:** `migrations/20261127-uc04-maintenance.sql`, `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`, `features/maintenance/api.js`, `features/maintenance/pages/EquipmentList.jsx`, `features/maintenance/pages/ScheduleList.jsx`, `features/maintenance/pages/TaskList.jsx`, `tests/postman/uc04.json`.

**Kết quả đầu ra:** `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`; `EquipmentController`, `MaintenanceScheduleController`, `MaintenanceTaskController` (GET); 3 trang; `tests/postman/uc04.json`.

**G1-S1 · 26/11 (ngày 1) — Tạo 4 bảng bảo trì.**

Việc: viết migration cho `equipment`, `maintenance_schedules`, `maintenance_tasks`, `technicians`; viết class và repository.

Cụ thể: Bảng `equipment`: `name, location, status, installed_at, note`; `maintenance_schedules`: `equipment_id, planned_date, frequency, status`; `maintenance_tasks`: `equipment_id, schedule_id, technician_id, title, description, priority, start_date, end_date, status, result, accepted_by, accepted_at`; `technicians`: `full_name, specialty, phone, status, user_id`.

File: `migrations/20261127-uc04-maintenance.sql`, `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`.

Xong khi: chạy migration; app nhận đúng 4 bảng.

**G1-S2 · 27/11 (ngày 2) — Làm API đọc và trang thiết bị.**

Việc: viết API đọc danh sách, xem chi tiết cho thiết bị, lịch, công việc; làm trang danh sách thiết bị.

Cụ thể: `GET /api/equipment?status&q`; `/maintenance-schedules?equipmentId&from&to`; `/maintenance-tasks?technicianId&status`. Trang Thiết bị: Mã, Tên, Vị trí, Trạng thái, Ngày lắp.

File: `features/maintenance/api.js`, `features/maintenance/pages/EquipmentList.jsx`.

Xong khi: mở trang thấy dữ liệu thật.

**G1-S3 · 28/11 (ngày 3) — Khung lịch và công việc.**

Việc: làm khung trang lịch bảo trì và trang công việc; viết Postman.

Cụ thể: Trang Lịch: Thiết bị, Ngày, Tần suất, Trạng thái. Trang Công việc: Thiết bị, Tiêu đề, Kỹ thuật, Bắt đầu, Trạng thái.

File: `features/maintenance/pages/ScheduleList.jsx`, `features/maintenance/pages/TaskList.jsx`, `tests/postman/uc04.json`.

Xong khi: 3 trang chạy; build không lỗi.

Cuối đợt 1, Lâm tạo database sạch, chạy `init_database.sql` và tất cả migration, chạy test backend và build frontend; đăng nhập 5 tài khoản; gọi 5 nhóm API đọc. Nếu lỗi, đợt 2 bắt đầu bằng sửa lỗi.

### Đợt 2 · 30/11–03/12

**File làm việc:** `EquipmentService/Controller`, `MaintenanceScheduleService/Controller`, `MaintenanceTaskService/Controller`, `TechnicianService/Controller`, `features/maintenance/pages/EquipmentList.jsx`, `features/maintenance/pages/ScheduleList.jsx`, `features/maintenance/pages/TaskList.jsx`, `tests/postman/uc04.json`.

**Kết quả đầu ra:** `EquipmentService/Controller`, `MaintenanceScheduleService/Controller`, `MaintenanceTaskService/Controller`, `TechnicianService/Controller`; form 3 trang; `tests/postman/uc04.json`.

**G2-S1 · 30/11 (ngày 1) — Làm thiết bị và lịch bảo trì.**

Việc: làm API thêm, sửa, xóa thiết bị; làm API tạo lịch bảo trì cho thiết bị.

Cụ thể: `POST /api/equipment`, `PUT/DELETE /api/equipment/{id}`; `/maintenance-schedules`; lịch phải có thiết bị và ngày; trạng thái thiết bị `ACTIVE/BROKEN/MAINTENANCE`.

File: `EquipmentService`, `MaintenanceScheduleService`, `EquipmentController`, `MaintenanceScheduleController`.

Xong khi: thêm được thiết bị; tạo được lịch cho thiết bị đó.

**G2-S2 · 01/12 (ngày 2) — Làm công việc và giao việc.**

Việc: làm API thêm, sửa, xóa công việc; giao việc cho kỹ thuật; đổi trạng thái; quản lý danh sách kỹ thuật viên.

Cụ thể: `POST /api/maintenance-tasks`, `PUT/DELETE /api/maintenance-tasks/{id}`; `PATCH /api/maintenance-tasks/{id}/assign` nhận `technicianId`; `PATCH /api/maintenance-tasks/{id}/status` nhận `status`; `GET/POST /api/technicians`, `PUT /api/technicians/{id}`.

File: `MaintenanceTaskService`, `MaintenanceTaskController`, `TechnicianService`, `TechnicianController`.

Xong khi: tạo được việc; giao được cho một kỹ thuật viên; đổi trạng thái được.

**G2-S3 · 02/12 (ngày 3) — Làm form thiết bị, lịch, công việc.**

Việc: làm form thêm, sửa, giao việc trên trang thiết bị, lịch, công việc.

Cụ thể: Modal thiết bị: tên, vị trí, trạng thái, ngày lắp. Modal lịch: thiết bị, ngày, tần suất. Modal việc: thiết bị, tiêu đề, mô tả, ưu tiên, kỹ thuật.

File: `features/maintenance/pages/EquipmentList.jsx`, `features/maintenance/pages/ScheduleList.jsx`, `features/maintenance/pages/TaskList.jsx`.

Xong khi: làm được trên màn hình.

Cuối đợt 2, Lâm chạy lại luồng hộ, nhân khẩu, khoản thu, hóa đơn, nộp tiền, duyệt tiền và kiểm tra công nợ.

### Đợt 3 · 04–07/12

**File làm việc:** `features/maintenance/pages/MyTasks.jsx`, `features/maintenance/pages/MaintenanceHistory.jsx`, `MaintenanceTaskService/Controller`, `tests/postman/uc04.json`.

**Kết quả đầu ra:** `MyTasks.jsx`; nghiệm thu + lịch sử; `tests/postman/uc04.json`.

**G3-S1 · 04/12 (ngày 1) — Làm trang kỹ thuật nhận việc.**

Việc: làm trang "Việc của tôi" cho kỹ thuật; cho cập nhật trạng thái từ "đang làm" sang "xong".

Cụ thể: Trang Việc của tôi: Tiêu đề, Thiết bị, Ưu tiên, Bắt đầu, Trạng thái; nút Bắt đầu/Hoàn thành.

File: `features/maintenance/pages/MyTasks.jsx`, `MaintenanceTaskController`.

Xong khi: kỹ thuật chỉ thấy việc của mình; cập nhật được trạng thái.

**G3-S2 · 05/12 (ngày 2) — Làm nghiệm thu và lịch sử.**

Việc: làm API nghiệm thu việc đã xong; làm trang lịch sử bảo trì.

Cụ thể: `POST /api/maintenance-tasks/{id}/accept`; trang lịch sử: Thiết bị, Việc, Kỹ thuật, Ngày xong, Người nghiệm thu.

File: `MaintenanceTaskService`, `features/maintenance/pages/MaintenanceHistory.jsx`.

Xong khi: quản lý nghiệm thu được; lịch sử hiện đúng.

**G3-S3 · 06/12 (ngày 3) — Chạy lại phần bảo trì.**

Việc: chạy lại các luồng; sửa lỗi; viết Postman.

Cụ thể: Chạy lại UC04; Postman `uc04.json`; sửa lỗi.

File: `tests/postman/uc04.json`.

Xong khi: phần bảo trì chạy ổn.

Cuối đợt 3, Lâm chạy cả năm luồng và kiểm tra quyền: cư dân chỉ thấy dữ liệu của mình, kỹ thuật chỉ thấy việc của mình.

### Đợt 4 · 08–10/12

**File làm việc:** `database/seed/uc04.sql`.

**Kết quả đầu ra:** `database/seed/uc04.sql` (4 thiết bị, 3 lịch, 3 việc); demo UC04.

**G4-S1 · 08/12 (ngày 1) — Chạy lại bảo trì.**

Việc: chạy lại các luồng; viết dữ liệu mẫu cho thiết bị, lịch, công việc; sửa lỗi.

Cụ thể: Chạy lại UC04; tạo dữ liệu mẫu 4 thiết bị, 3 lịch, 3 việc; sửa lỗi.

Xong khi: các luồng chạy ổn; dữ liệu mẫu đủ để demo.

**G4-S2 · 09/12 (ngày 2) — Demo phần bảo trì.**

Việc: chuẩn bị kịch bản; demo.

Cụ thể: Demo UC04: tạo thiết bị, lập lịch, giao việc, kỹ thuật cập nhật, nghiệm thu.

Xong khi: demo đúng luồng.

Nếu task nào chưa rõ, nhắn Lâm kèm mã task. Không tự thêm bảng, API, màn hình hay thư viện ngoài spec.
