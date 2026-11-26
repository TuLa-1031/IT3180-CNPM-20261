# Hướng dẫn API — BlueMoon

Tài liệu này là hợp đồng giữa backend (`/api`) và frontend. Spec sản phẩm ở
[`kien-truc-he-thong.md`](kien-truc-he-thong.md) §7; quy ước code ở
[`quy-uoc-code.md`](quy-uoc-code.md). Khi hai tài liệu lệch nhau, spec quyết định sản phẩm.

## 1. Nguyên tắc chung

| Quy tắc | Cách làm |
|---|---|
| Base path | `/api`, không version hóa URL |
| Tài nguyên | danh từ số nhiều, `kebab-case`: `/api/vehicle-registrations` |
| Phương thức | `GET` đọc, `POST` tạo, `PUT` thay toàn bộ, `PATCH` sửa một phần/hành động, `DELETE` xóa |
| Hành động | `PATCH /{id}/{action}`: `/approve`, `/reject`, `/close`, `/lock`, `/assign`, `/accept` |
| JSON | `camelCase`; ngày `YYYY-MM-DD`; thời gian ISO-8601; tiền là số (không chuỗi) |
| Null | Trả `null` cho trường không có; không bỏ field tùy tiện |
| Content-Type | `application/json; charset=UTF-8` cho request có body |
| Auth | `Authorization: Bearer <token>` cho mọi endpoint trừ login/register/health |
| Phân trang | `page` (bắt đầu 0), `size` (mặc định 20, tối đa 100), `sort` |
| Idempotent | Duyệt lại yêu cầu/giao dịch đã duyệt trả `409`, không tạo bản ghi thứ hai |

Không trả entity thô (đặc biệt `password`), không đặt động từ trong URL CRUD, không đổi shape
response của endpoint đã có người dùng.

## 2. Xác thực

### 2.1 Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "admin", "password": "123456" }
```

Thành công `200`:

```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Nguyễn Văn Quản Lý",
    "email": "admin@bluemoon.vn",
    "phone": "0901234567",
    "role": "ADMIN",
    "status": "ACTIVE",
    "residentId": null,
    "createdAt": "2026-11-26T12:00:00"
  }
}
```

Token chứa `sub` (username), `role`, `userId`, `residentId` (nếu có), `iat`, `exp`; hạn 8 giờ.
Sai tài khoản/mật khẩu trả `401 INVALID_CREDENTIALS`; tài khoản `LOCKED` trả `403 ACCOUNT_LOCKED`.

### 2.2 Các endpoint tài khoản

| Endpoint | Việc | Quyền |
|---|---|---|
| `POST /api/auth/login` | Trả token + hồ sơ | Công khai |
| `POST /api/auth/register` | Đăng ký tài khoản cư dân | Công khai |
| `GET /api/auth/me` | Hồ sơ của chính mình | Đã đăng nhập |
| `PUT /api/auth/password` | Đổi mật khẩu (`oldPassword`, `newPassword`) | Đã đăng nhập |

`GET /api/auth/me` trả đúng object `user` như trên. `PUT /api/auth/password` trả `204`.
Mật khẩu mới tối thiểu 6 ký tự; sai mật khẩu cũ trả `400 VALIDATION_ERROR` với
`fieldErrors: [{ "field": "oldPassword", ... }]`.

### 2.3 Lỗi xác thực

- Token thiếu/hỏng/hết hạn: `401 INVALID_CREDENTIALS`.
- Thiếu quyền hoặc truy cập dữ liệu hộ khác: `403 FORBIDDEN`.
- Cư dân bị khóa: `403 ACCOUNT_LOCKED`.

### 2.4 Phân quyền theo vai trò

Backend chặn quyền thô theo nhóm endpoint trong `SecurityConfig`; frontend ẩn menu và chặn URL
tương ứng, nhưng **backend mới là nơi quyết định**. Quyền sở hữu dữ liệu (hộ của cư dân, việc của
kỹ thuật) sẽ được kiểm trong service khi endpoint của UC đó được làm ở GĐ2/GĐ3.

| Nhóm endpoint | ADMIN | MANAGER | ACCOUNTANT | TECHNICIAN | RESIDENT |
|---|:--:|:--:|:--:|:--:|:--:|
| `/api/users/**` | F | — | — | — | — |
| `/api/households/**`, `/api/residents/**`, `/api/residence-changes/**` | F | F | R | — | — |
| `/api/fees/**`, `/api/payments/**`, `/api/utility-bills/**` | F | R | F | — | — |
| `/api/transactions/**` | F | R | F | — | — |
| `/api/stats/**` | F | F | F | — | — |
| `/api/feedbacks/**` | F | F | — | R | — |
| `/api/equipment/**`, `/api/maintenance-schedules/**` | F | F | — | R | — |
| `/api/maintenance-tasks/**` | F | F | — | O + cập nhật | — |
| `/api/technicians/**` | F | F | — | — | — |
| `/api/vehicle-registrations/**`, `/api/parking-cards/**` | F | F | R | — | — |
| `/api/vehicles/**` | F | F | R | — | — |
| `/api/notifications/**` | O | O | O | O | O |

Ký hiệu: **F** toàn quyền, **R** chỉ đọc, **O** dữ liệu của mình, **—** không có quyền.
Kỹ thuật không đọc được dữ liệu tài chính/nhân khẩu; kế toán không đọc phản ánh/bảo trì. Vi phạm
trả `403 FORBIDDEN`.

Ở GĐ1, cổng cư dân mới có khung trang nên các dòng cư dân để `—`; khi UC tương ứng có endpoint
lọc theo hộ, backend sẽ mở `O`/`R` và lấy `householdId` từ token, không tin client gửi lên.

## 3. Định dạng phản hồi

### 3.1 Thành công

Trả trực tiếp object/array của tài nguyên, không bọc thêm `data`:

```json
{ "id": 12, "licensePlate": "29E1-123.45", "status": "APPROVED" }
```

Danh sách có phân trang trả `PageResponse<T>`:

```json
{
  "content": [ { "id": 1 } ],
  "page": 0,
  "size": 20,
  "totalElements": 42,
  "totalPages": 3
}
```

`POST` tạo mới trả `201` kèm object vừa tạo; `DELETE` trả `204`; cập nhật trả `200`.

### 3.2 Lỗi

Mọi lỗi dùng cùng một khuôn:

```json
{
  "timestamp": "2026-11-26T10:15:30",
  "status": 409,
  "code": "LICENSE_PLATE_EXISTS",
  "message": "Biển số đã được đăng ký",
  "path": "/api/vehicle-registrations",
  "fieldErrors": [ { "field": "licensePlate", "message": "đã tồn tại" } ]
}
```

- `timestamp`: thời điểm lỗi, ISO-8601.
- `status`: mã HTTP, trùng với status thực tế.
- `code`: mã ổn định để frontend xử lý, không đổi theo câu chữ.
- `message`: tiếng Việt, ngắn, không lộ stack trace.
- `path`: đường dẫn gây lỗi.
- `fieldErrors`: mảng rỗng nếu lỗi không gắn với trường cụ thể.

### 3.3 Mã lỗi nghiệp vụ (spec §7.5)

| Mã | HTTP | Khi nào |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Thiếu/sai định dạng trường bắt buộc |
| `INVALID_CREDENTIALS` | 401 | Sai tài khoản/mật khẩu hoặc token không hợp lệ |
| `ACCOUNT_LOCKED` | 403 | Tài khoản bị khóa |
| `FORBIDDEN` | 403 | Không đủ quyền hoặc truy cập dữ liệu hộ khác |
| `NOT_FOUND` | 404 | Không tìm thấy bản ghi |
| `DUPLICATE_CODE` | 409 | Trùng mã hộ, mã khoản thu, biển số, mã thẻ |
| `HOUSEHOLD_INACTIVE` | 409 | Thao tác trên hộ đã chuyển đi |
| `FEE_CLOSED` | 409 | Sinh hóa đơn cho khoản thu đã đóng |
| `PAYMENT_OVERPAY` | 409 | Số tiền vượt quá dư nợ |
| `TRANSACTION_ALREADY_APPROVED` | 409 | Duyệt lại giao dịch đã duyệt |
| `REGISTRATION_NOT_PENDING` | 409 | Duyệt/từ chối yêu cầu không ở trạng thái chờ |
| `CARD_ALREADY_LOCKED` | 409 | Khóa thẻ đã khóa |
| `TASK_INVALID_STATE` | 409 | Chuyển trạng thái công việc không hợp lệ |
| `INTERNAL_ERROR` | 500 | Lỗi không mong đợi, không lộ chi tiết |

Không tự đặt mã mới nếu chưa cập nhật spec và bảng này.

## 4. Danh mục endpoint và registry frontend

`frontend/src/lib/resources.js` là nơi duy nhất khai báo path/action. Mọi HTTP đi qua
`apiClient`; component không gọi `fetch` trực tiếp.

| Key | Path | Hành động (`actions`) | Quyền chính |
|---|---|---|---|
| `auth` | `/auth` | `login`, `register`, `me`, `password` | Công khai / đã đăng nhập |
| `users` | `/users` | `status` | ADMIN |
| `households` | `/households` | `residents` | ADMIN, MANAGER; cư dân xem hộ mình |
| `residents` | `/residents` | `changes` | ADMIN, MANAGER |
| `residenceChanges` | `/residence-changes` | — | ADMIN, MANAGER |
| `fees` | `/fees` | `generate`, `close`, `debts` | ADMIN, ACCOUNTANT; MANAGER đọc |
| `payments` | `/payments` | `transactions`, `createTransaction` | ACCOUNTANT; cư dân xem/tạo của mình |
| `transactions` | `/transactions` | `approve`, `reject` | ACCOUNTANT |
| `utilityBills` | `/utility-bills` | `pay` | ADMIN, ACCOUNTANT |
| `feedbacks` | `/feedbacks` | `status`, `respond`, `merge` | MANAGER/ADMIN; cư dân tạo và xem của mình |
| `equipment` | `/equipment` | — | ADMIN, MANAGER |
| `maintenanceSchedules` | `/maintenance-schedules` | — | ADMIN, MANAGER |
| `maintenanceTasks` | `/maintenance-tasks` | `assign`, `status`, `accept` | MANAGER/ADMIN; kỹ thuật cập nhật việc của mình |
| `technicians` | `/technicians` | — | ADMIN, MANAGER |
| `vehicleRegistrations` | `/vehicle-registrations` | `approve`, `reject` | Cư dân tạo; MANAGER/ADMIN duyệt |
| `vehicles` | `/vehicles` | `status` | ADMIN, MANAGER |
| `parkingCards` | `/parking-cards` | `lock`, `reissue` | ADMIN, MANAGER; cư dân xem của mình |
| `notifications` | `/notifications` | `read`, `readAll` | Đã đăng nhập (của mình) |
| `stats` | `/stats` | `overview`, `revenue`, `debts`, `feedbacks`, `maintenance`, `residents` | ADMIN, MANAGER, ACCOUNTANT |
| `health` | `/health` | — | Công khai |

Helper đi kèm:

```js
import { listPath, entityPath, actionPath, actionMethod, normalizeMany } from '../../lib/resources'

listPath('fees', { status: 'OPEN', page: 0, size: 20 }) // /fees?status=OPEN&page=0&size=20
entityPath('fees', 3)                                  // /fees/3
actionPath('fees', 'close', 3)                         // /fees/3/close
actionMethod('fees', 'close')                          // POST
normalizeMany('fees', response)                        // mảng row đã chuẩn hóa
```

## 5. Quy ước dữ liệu

- **Tiền**: số (VND), ví dụ `377500`, không kèm ký hiệu trong JSON.
- **Ngày**: `YYYY-MM-DD`; **thời gian**: `YYYY-MM-DDTHH:mm:ss` (múi giờ `Asia/Ho_Chi_Minh`).
- **Trạng thái**: chữ HOA, đúng enum trong spec §3.3; thêm giá trị phải sửa cả SQL và Java.
- **Phân trang**: `page` bắt đầu từ 0; service không tự ghép `LIMIT`.
- **Lọc**: đặt trong query string (`status`, `householdId`, `from`, `to`…), không dùng body cho `GET`.
- **Sở hữu dữ liệu**: cư dân không gửi `householdId` cho hành động của mình; backend lấy từ token.
- **Audit**: `createdAt`, `updatedAt` do Hibernate gán; hành động quan trọng ghi `processedBy`,
  `approvedBy`, `collectedBy`.

## 6. Cách frontend gọi API

### 6.1 Route giao diện

Nhân viên dùng chung khung `AdminLayout`, cư dân dùng `ResidentLayout`. Route nhân viên đặt phẳng
(không tiền tố) để khớp path từng UC; route cư dân nằm dưới `/resident`.

| Vai trò | Path | Màn hình |
|---|---|---|
| Công khai | `/login` | Đăng nhập |
| Nhân viên | `/admin` | Tổng quan |
| Nhân viên | `/statistics` | Thống kê |
| Nhân viên | `/households`, `/residents`, `/changes` | UC01 |
| Nhân viên | `/fees`, `/payments`, `/bills` | UC02 |
| Nhân viên | `/feedbacks` | UC03 |
| Nhân viên | `/equipment`, `/maintenance`, `/maintenance-schedules`, `/maintenance-tasks` | UC04 |
| Nhân viên | `/vehicles`, `/vehicles/registrations`, `/vehicles/cards` | UC05 |
| Nhân viên | `/account`, `/template` | Tài khoản, trang mẫu |
| Cư dân | `/resident/bills`, `/resident/feedbacks`, `/resident/vehicles`, `/resident/notifications` | Cổng cư dân |

Route guard chỉ điều hướng; quyền thật vẫn kiểm ở backend. Menu nhân viên được lọc theo vai trò: kỹ thuật chỉ thấy Phản ánh/Bảo trì, kế toán không thấy Phản ánh/Bảo trì.

```js
// features/fees/api.js
import { apiClient } from '../../lib/apiClient'
import { listPath, entityPath, actionPath, actionMethod, normalizeMany } from '../../lib/resources'

export const feesApi = {
  list: (params) => apiClient.request(listPath('fees', params)).then((payload) => normalizeMany('fees', payload)),
  close: (id) => apiClient.request(actionPath('fees', 'close', id), { method: actionMethod('fees', 'close') }),
  create: (body) => apiClient.request(entityPath('fees'), { method: 'POST', body })
}
```

- `apiClient` tự gắn `Authorization: Bearer <token>` từ `lib/auth.js`, tự parse lỗi thành `ApiError`
  (`status`, `code`, `fieldErrors`), tự xóa token và phát sự kiện `bluemoon:unauthorized` khi gặp `401`.
- Không lưu dữ liệu nghiệp vụ vào `localStorage`; chỉ lưu token ở key `bluemoon_token`.
- Mỗi màn hình xử lý 3 trạng thái: đang tải, rỗng, lỗi; hiển thị `fieldErrors` từ server dưới đúng ô.
- Route guard chỉ để điều hướng; quyền thật kiểm ở backend bằng `@PreAuthorize` và kiểm tra sở hữu.

## 7. Chạy thử nhanh

```bash
# Backend + MySQL
mysql -u root -p < database/init_database.sql
mvn -f backend/pom.xml spring-boot:run

# Đăng nhập
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123456"}'

# Gọi endpoint cần token
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer <token>"
```

Tài khoản demo (mật khẩu `123456`): `admin` (ADMIN), `quanly` (MANAGER), `ketoan` (ACCOUNTANT),
`kythuat` (TECHNICIAN), `cudan` (RESIDENT, gắn nhân khẩu 1).

## 8. Khi thay đổi API

1. Cập nhật spec §7 và bảng mã lỗi trước.
2. Cập nhật controller/service/DTO, giữ `code` ổn định.
3. Cập nhật entry trong `lib/resources.js` cùng lúc.
4. Ghi rõ trong PR nếu thay đổi phá vỡ tương thích; không đổi shape endpoint đang dùng.
5. Chạy lại Postman/curl và `mvn test`, `npm run build`.
