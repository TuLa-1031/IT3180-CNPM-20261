# Kế hoạch chia việc — BlueMoon (26/11–06/12)

Mục tiêu: hoàn thiện 5 nghiệp vụ (cư dân, thu phí, phản ánh, bảo trì, gửi xe), đăng nhập/phân quyền và cổng cư dân trong 11 ngày. Năm người, mỗi người một phần; Lâm làm nền móng và tài liệu, Đức Anh làm thu phí, Kiên làm cư dân, Đức làm phản ánh + gửi xe, Sơn làm bảo trì.

**Hạn cuối: 06/12/2026. Demo: 06/12.**

## 1. Lịch

| Đợt | Ngày | Hạn chốt | Việc chung |
|---|---|---|---|
| 1 | 26–28/11 | 28/11 | Đăng nhập, tạo bảng, mỗi người có một màn hình đọc dữ liệu thật |
| 2 | 29/11–01/12 | 01/12 | Thêm, sửa, xóa; làm form; cư dân xem hóa đơn |
| 3 | 02–04/12 | 04/12 | Duyệt, đổi trạng thái, cư dân gửi phản ánh/đăng ký xe, kỹ thuật nhận việc |
| 4 | 05–06/12 | 06/12 | Chạy lại tất cả, sửa lỗi, viết tài liệu, demo |

## 2. Ai làm gì

| Người | Phần việc | File chính |
|---|---|---|
| Lâm | Nền móng: đăng nhập, phân quyền, khung hai giao diện, nối các phần, tài liệu | `pom.xml`, `application.properties`, `security/`, `Auth*`, `User*`, `Notification*`, `app/`, `lib/`, `App.jsx`, `vite.config.js`, `pages/Login.jsx`, `Dashboard.jsx`, `Statistics.jsx`, `Account.jsx`, `docs/` |
| Đức Anh | UC02 thu phí, công nợ | `Fee*`, `Payment*`, `PaymentTransaction*`, `UtilityBill*`, `features/fees/`, `pages/Fees.jsx`, `Payments.jsx`, `Bills.jsx` |
| Kiên | UC01 cư dân, căn hộ | `Household*`, `Resident*`, `ResidenceChange*`, `features/households/`, `pages/Households.jsx`, `Residents.jsx`, `Changes.jsx` |
| Đức | UC03 phản ánh + UC05 gửi xe | `Feedback*`, `Vehicle*`, `VehicleRegistration*`, `ParkingCard*`, `features/feedbacks/`, `features/vehicles/`, `pages/Vehicles.jsx` |
| Sơn | UC04 bảo trì | `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`, `features/maintenance/` |

Dấu `*` là entity, repository, service, controller, DTO cùng tên. Danh sách file đầy đủ ở `docs/chi-tiet-cong-viec.md`, phần "File của bạn" của từng người.

## 3. Ngày đầu 26/11

| Ai | Việc | Xong khi |
|---|---|---|
| Lâm | G1-L1 — làm đăng nhập, phân quyền, bảng `users` | Đăng nhập 5 tài khoản; sai mật khẩu trả 401 |
| Đức Anh | G1-A1 — tạo bảng `payment_transactions` | Migration chạy; app nhận đúng bảng |
| Kiên | G1-K1 — viết class nhận/trả dữ liệu hộ, nhân khẩu, biến động | Code chạy; giải thích được quan hệ hộ → nhân khẩu |
| Đức | G1-D1 — tạo bảng `feedbacks` | Migration chạy; app nhận đúng bảng |
| Sơn | G1-S1 — tạo 4 bảng thiết bị, lịch, công việc, kỹ thuật viên | Migration chạy; app nhận đủ 4 bảng |

Các ngày sau, mỗi người xem nhóm việc theo ngày ở file chi tiết.

## 4. Luật ngắn

1. Chỉ sửa file của mình. File dùng chung (`App.jsx`, `main.jsx`, `lib/`, `components/ui.jsx`, `styles.css`, `vite.config.js`, `pom.xml`, `application.properties`, `init_database.sql`, `docs/`) chỉ Lâm sửa.
2. Mỗi đợt một nhánh (Đức tách 2 nhánh cho UC03/UC05); mỗi task ít nhất một commit; PR không quá 400 dòng; Lâm gộp.
3. Dữ liệu lấy từ API; không dùng dữ liệu mẫu hay `localStorage`.
4. Xong khi: chạy được với MySQL thật, có request Postman, `mvn test` và `npm run build` pass, không sửa file ngoài danh sách.
5. Trễ một ngày phải báo Lâm.

## 5. Đọc ở đâu

- **Việc của bạn, từng ngày:** [`docs/chi-tiet-cong-viec.md`](chi-tiet-cong-viec.md) — mở đúng tên mình. Mỗi đợt có **File làm việc**, **Kết quả đầu ra**, rồi từng task với mã, việc, file, cụ thể, xong khi.
- **Sản phẩm làm ra cái gì:** `docs/kien-truc-he-thong.md` — phạm vi, dữ liệu, API, quyền.
- **Cách làm, SCOPE, dùng AI:** `AGENTS.md`.

## 6. Chạy thử

```bash
# Database
mysql -u root -p < database/init_database.sql
for f in database/migrations/*.sql; do mysql -u root -p bluemoon_db < "$f"; done
for f in database/seed/*.sql; do mysql -u root -p bluemoon_db < "$f"; done

# Backend
mvn -f backend/pom.xml spring-boot:run
curl -s http://localhost:8080/api/health

# Frontend
cd frontend && npm install && npm run dev
npm run build
```

Tài khoản demo (mật khẩu `123456`): `admin`, `quanly`, `ketoan`, `kythuat`, `cudan`.

## 7. Demo 06/12

Năm luồng: thêm hộ/nhân khẩu; tạo khoản thu → sinh hóa đơn → nộp → duyệt; gửi phản ánh → phản hồi; tạo thiết bị → giao việc → nghiệm thu; đăng ký xe → duyệt → cấp thẻ. Chi tiết từng việc ở file chi tiết, đợt 4.

## 8. Nếu trễ

Cắt theo thứ tự: thông báo trong ứng dụng → biểu đồ thống kê → gộp phản ánh trùng → cấp lại thẻ gửi xe. Không cắt 5 luồng chính, đăng nhập/phân quyền, CRUD, duyệt yêu cầu.
