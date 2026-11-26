# AGENTS.md — Cách làm việc chung của nhóm BlueMoon

File này áp dụng cho **mọi người làm việc trong repo này**: 5 thành viên trong nhóm và mọi công
cụ AI được dùng để viết code. Nó không yêu cầu cài thêm gì — từng bước dưới đây làm được bằng
Git, GitHub và terminal.

Ba tài liệu, ba vai trò:

| Tài liệu | Vai trò |
|---|---|
| `docs/kien-truc-he-thong.md` | **Spec** — sản phẩm làm ra cái gì (dữ liệu, API, quyền, quy ước) |
| `docs/ke-hoach-chia-viec.md` | **Kế hoạch** — lịch, ai làm gì, hạn, luật ngắn |
| `docs/chi-tiet-cong-viec.md` | **Chi tiết** — task ID, việc, file, xong khi |
| `AGENTS.md` (file này) | **Cách làm** — trình tự, ranh giới, cách phối hợp |

Khi hai tài liệu lệch nhau: spec quyết định sản phẩm, phân công quyết định ai làm gì, file này
quyết định cách làm. Chỉ đạo trực tiếp của nhóm trưởng thắng cả ba.

---

## 0. Đọc gì trước khi bắt đầu

| Đọc | Nội dung | Khi nào |
|---|---|---|
| `README.md`, `frontend/README.md` | Cài đặt, cổng, cách chạy, cách lớp gọi API được nối | Ngay lần đầu |
| `docs/kien-truc-he-thong.md` | Phạm vi, 5 nghiệp vụ, vai trò, mô hình dữ liệu, API, §7.5 mã lỗi | Trước mọi task |
| `docs/ke-hoach-chia-viec.md` | Lịch, ai làm gì, hạn, luật ngắn | Trước mọi task |
| `docs/chi-tiet-cong-viec.md` | Task ID, việc, file, cụ thể, xong khi | Trước khi làm |
| Code hiện tại của phần bạn sửa | Cách phần đó đang chạy, ai đang dùng nó | Trước khi sửa |

Vài sự thật về repo để khỏi mất thời gian phát hiện lại:

- Code hiện tại mới có **API `GET`** (9 controller, 0 mapping ghi); frontend còn đọc dữ liệu mẫu
  `src/lib/data.js` và ghi vào `localStorage`. Đây là khung tạm, không phải thiết kế cuối.
- Các package `enums/`, `exception/`, `security/`, `app/`, `features/` **chưa tồn tại** — chỉ tạo
  cái mà task của bạn cần.
- Test backend là `@SpringBootTest`, cần MySQL đang chạy với `bluemoon_db`. Frontend **không có**
  test runner — đừng dựng thêm, hãy chạy app để kiểm.
- `docs/` đã được đẩy lên GitHub cùng code. `.agents/` (skill riêng của Lâm) bị `.gitignore` và
  không commit; không cần — và không được — sửa `.agents/` để "cho tiện".

---

## 1. Năm nguyên tắc bắt buộc

**1. Đọc trước khi viết.** Trước khi sửa, phải giải thích được phần đó đang chạy thế nào và thay
đổi của bạn chạm vào đâu. Không hiểu thì chưa được sửa.

**2. Mỗi giai đoạn một nhánh/người; mỗi task một commit.** Đức tách hai nhánh cho UC03/UC05.
Task lớn tách nhánh riêng. PR ≤ 400 dòng; lớn hơn thì tách.

**3. Không sửa file của người khác — dù chỉ một dòng.** Không dọn dẹp, không format lại, không
đổi thứ tự import, không đổi tên biến, không xóa code "trông thừa". Chỉ thêm mới hoặc sửa đúng
phần của mình.

**4. Chỉ làm trong lát cắt của mình.** Việc cần làm mà nằm ngoài lát cắt thì báo, không tự làm.
Thấy lỗi ngoài lát cắt thì ghi lại một dòng, không sửa.

**5. "Xong" là phải có bằng chứng.** Chạy lệnh thật, dán output thật. "Chắc là chạy được" không
phải là kiểm tra.

---

## 2. Ai sở hữu phần nào

Bảng dưới là bản rút gọn; danh sách file đầy đủ ở `docs/chi-tiet-cong-viec.md`, phần "File của bạn" của từng người. Ký hiệu
`X*` = entity + repository + service + controller + DTO cùng tên.

| Người | Nghiệp vụ | File chính |
|---|---|---|
| **Lâm** (nhóm trưởng) | Hạ tầng, auth, tích hợp, tài liệu | `pom.xml`, `security/**`, `exception/**`, `config/**`, `enums/**`, auth + notification + stats; `app/**`, `lib/**`, `components/ui.jsx`, `styles.css`, `App.jsx`, `main.jsx`, `features/_template/**`, `pages/Login.jsx`, `Dashboard.jsx`, `Statistics.jsx`, `Account.jsx` |
| **Đức Anh** | UC02 thu phí — công nợ | `Fee*`, `Payment*`, `PaymentTransaction*`, `UtilityBill*`; `features/fees/**`, `pages/Fees.jsx`, `Payments.jsx`, `Bills.jsx` |
| **Kiên** | UC01 cư dân — căn hộ | `Household*`, `Resident*`, `ResidenceChange*`; `features/households/**`, `pages/Households.jsx`, `Residents.jsx`, `Changes.jsx` |
| **Đức** | UC03 phản ánh; UC05 gửi xe — thẻ | `Feedback*`, `Vehicle*`, `VehicleRegistration*`, `ParkingCard*`; `features/feedbacks/**`, `features/vehicles/**`, `pages/Vehicles.jsx` |
| **Sơn** | UC04 bảo trì — vận hành | `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*`; `features/maintenance/**` |

Đường dẫn trong bảng viết tắt: file `.jsx`/`.js` nằm trong `frontend/src/`, file Java trong
`backend/src/main/java/com/bluemoon/`, file SQL trong `database/`, file cấu hình ở gốc repo hoặc
thư mục tương ứng.

**File dùng chung chỉ Lâm sửa:** `App.jsx`, `main.jsx`, `lib/**`, `components/ui.jsx`,
`styles.css`, `vite.config.js`, `pom.xml`, `application.properties`, `init_database.sql`,
`docs/**`, `README.md`, `.gitignore`. Cần đổi → nhắn Lâm, không tự sửa.

**Migration thì mỗi người tự lo:** tạo file riêng trong `database/migrations/`, tên duy nhất
(`YYYYMMDD-<uc>-<mô-tả>.sql`). Trừ Lâm, **không ai sửa `init_database.sql`**. Lâm chạy tất cả
theo thứ tự trên DB sạch ở cuối mỗi giai đoạn.

---

## 3. Quy trình 8 bước

Làm đúng thứ tự này cho mọi task, kể cả task nhỏ. Bỏ bước là lỗi, không phải tối ưu.

| Bước | Việc | Sản phẩm | Qua bước khi |
|---|---|---|---|
| 1 | Nhận việc | Task ID + danh sách file + mục spec liên quan | Trả lời được "làm gì, sửa file nào, đọc mục nào" |
| 2 | Đọc | Ghi chú 5 dòng: hiện tại chạy thế nào, thay đổi chạm vào đâu | Giải thích được luồng hiện tại bằng lời của mình |
| 3 | Chốt cách làm | 5 dòng vào chat/issue + 1 người đồng ý | Việc > 4 giờ hoặc đụng API/schema/route dùng chung thì phải có người thứ hai đọc |
| 4 | Chốt phạm vi | Khối `SCOPE` (mục 4) | Mọi file sẽ sửa đều có tên trong SCOPE |
| 5 | Code | Nhánh riêng, commit nhỏ, chạy được ở máy mình | Từng mốc (API → UI) chạy được trước khi sang mốc sau |
| 6 | Tự kiểm | Output lệnh thật, Postman, `git diff --name-only` | Mục 7 "Xong nghĩa là gì" đã đủ |
| 7 | Mở PR | PR ≤ 400 dòng, mô tả 3 dòng, ảnh nếu là UI | Lâm (hoặc người được giao) bắt đầu review |
| 8 | Review → merge | Sửa theo comment trong 1 ngày, rebase `main` | PR được duyệt và **Lâm merge** |

### Bước 1 — Nhận việc

- Lấy task trong `docs/chi-tiet-cong-viec.md` (mã dạng `G2-K1`), đọc đủ: việc, file, điều kiện "xong khi".
- Chưa rõ file nào được sửa, hoặc task cần thứ ngoài spec → hỏi Lâm trước khi làm bất cứ gì.
- Không nhận hai UC trong cùng một nhánh.

### Bước 2 — Đọc

Đọc spec đúng phần của mình, rồi đọc code mình sẽ sửa:

| Người | Spec | Code nên đọc |
|---|---|---|
| Lâm | Toàn bộ, nhất là §4, §6, §7, §8 | `App.jsx`, `lib/**`, `pom.xml`, `init_database.sql` |
| Đức Anh | §3 UC02, §6 bảng liên quan, §7.4 | `FeeEntity`, `PaymentEntity`, `UtilityBillEntity`, 3 trang Fees/Payments/Bills |
| Kiên | §3 UC01, §6 households/residents, §7.4 | `HouseholdEntity`, `ResidentEntity`, `ResidenceChangeEntity`, 3 trang UC01 |
| Đức | §3 UC03 + UC05, §6 feedbacks/vehicles, §7.4 | `components/ui.jsx` (Modal, Field, Badge), trang `Households.jsx` làm mẫu, `VehicleEntity` |
| Sơn | §3 UC04, §6 equipment/maintenance, §7.4 | `components/ui.jsx`, trang mẫu `Households.jsx`, `VehicleEntity` làm mẫu entity |

Quy tắc đọc: mở cả tầng trên và tầng dưới của file mình sửa (controller → service → repository →
entity; trang → `lib` → API). Nếu spec mô tả thứ chưa có trong code, đó là **đích đến**, không
phải lỗi — đừng "sửa" bằng cách viết lại code đang chạy.

### Bước 3 — Chốt cách làm

- Task ≤ 4 giờ, chỉ một file, không đổi API/schema: ghi 2 dòng trong mô tả PR, làm luôn.
- Task lớn hơn, hoặc đụng API/schema/route dùng chung: viết vào chat/issue 5 dòng:
  1. mục tiêu một câu; 2. cách làm chọn; 3. hai cách khác và lý do loại; 4. file dự kiến sửa;
  5. câu hỏi mở (nếu có).
- Chờ người thứ hai (Lâm, hoặc người dùng chung API đó) trả lời rồi mới code. Quá một ngày không
  ai trả lời: chọn phương án an toàn nhất, ghi rõ "chưa được duyệt, chọn vì an toàn" trong PR.
- Không tự thêm bảng, cột, endpoint, trạng thái hay thư viện ngoài spec. Thiếu thì hỏi.

### Bước 4 — Chốt phạm vi

Dán khối `SCOPE` (mục 4) vào chat trước khi sửa file đầu tiên. Không viết được SCOPE nghĩa là
chưa có phạm vi — dừng lại, hỏi.

### Bước 5 — Code

Thứ tự làm (đi từ dữ liệu ra giao diện, mỗi mốc một commit):

1. Migration + entity + repository → app khởi động, Hibernate map đúng.
2. DTO → service → controller → chạy được bằng `curl`/Postman.
3. `features/<domain>/api.js` → trang/màn hình → chạy được trên trình duyệt.
4. Request Postman vào `tests/postman/<uc>.json` (dùng seed có sẵn, không sửa dữ liệu tay).

Tên nhánh: `feat/g<so>-<ten>-<uc>` — ví dụ `feat/g2-kien-uc01`.
Commit: `<loại>(<uc>): <mô tả>` — ví dụ `feat(uc01): validate duplicate household code`.

### Bước 6 — Tự kiểm

Chạy và dán output thật:

```bash
# Backend
mvn -f backend/pom.xml test
curl -s http://localhost:8080/api/health            # status UP, dbConnected true

# Frontend
cd frontend && npm run build

# Kiểm tra phạm vi — bắt buộc trước khi mở PR
git diff --name-only origin/main...HEAD
```

Ngoài lệnh, tự kiểm bằng tay:

- Luồng chính chạy được với **MySQL thật**, không có `localStorage` hay dữ liệu mẫu xen vào.
- Trường hợp lỗi theo spec §7.5 trả đúng mã (`409` trùng, `403` sai hộ, `401` hết token…).
- Quyền được kiểm ở **backend**: cư dân A không đọc được dữ liệu hộ B.
- Giao diện có đủ 3 trạng thái: đang tải, rỗng, lỗi.

### Bước 7 — Mở PR

Tiêu đề: `G<so> · <Tên> · <UC>` — ví dụ `G2 · Kiên · UC01 CRUD`.
Mô tả 3 dòng: làm gì; kiểm thế nào (lệnh + kết quả); còn gì chưa làm.
Ảnh chụp màn hình nếu có thay đổi giao diện. Reviewer: Lâm. PR ≤ 400 dòng.

### Bước 8 — Review và merge

- Người làm sửa theo comment trong vòng 1 ngày làm việc, trả lời từng comment.
- Trước khi merge: `git fetch origin && git rebase origin/main`, chạy lại build + test.
- **Chỉ Lâm merge.** Không tự merge PR của mình, không tự đẩy lên `main`.
- Sau khi merge: xóa nhánh, đánh dấu task xong trong kế hoạch chia việc, báo nhóm một dòng.

---

## 4. Khối SCOPE — bắt buộc trước khi sửa file

```text
SCOPE
- Task: <mã task + một câu mô tả, ví dụ "G2-K1 — CRUD hộ gia đình">
- Sẽ sửa: <danh sách file chính xác, hoặc "chỉ tạo file mới trong features/feedbacks/">
- Chỉ đọc: <file cần xem để hiểu, không sửa>
- Ngoài phạm vi: <phần liền kề sẽ không chạm vào>
```

Ví dụ thật:

```text
SCOPE
- Task: G2-K1 — CRUD hộ gia đình
- Sẽ sửa: backend/.../service/HouseholdService.java, .../controller/HouseholdController.java,
  .../dto/household/HouseholdRequest.java, .../dto/household/HouseholdResponse.java
- Chỉ đọc: HouseholdEntity, HouseholdRepository, frontend/src/lib/resources.js
- Ngoài phạm vi: nhân khẩu, biến động, route/menu (của Lâm)
```

Nếu bạn dùng AI mà nó không nhận được SCOPE, nó phải hỏi lại — không được tự đoán.

---

## 5. File dùng chung, migration, xung đột

**Cần đổi file dùng chung:** nhắn Lâm mô tả thay đổi, chờ Lâm sửa (hoặc cho phép). Không tự sửa
rồi báo sau.

**Route và `lib/resources.js`:** Lâm chốt toàn bộ route và entry resources ở GĐ1; nếu thiếu thì
bổ sung trước khi người khác bắt đầu dùng. Trước ngày cuối giai đoạn trước, gửi Lâm danh sách
`path + component` và `endpoint + shape response` của phần bạn làm.

**Migration:** mỗi người một file riêng, không sửa file đã chạy. Seed đặt trong
`database/seed/uc0X.sql`, dùng `INSERT IGNORE` để chạy lại không lỗi.

**Xung đột:**

- Rebase nhánh mình lên `origin/main`; xung đột trong file của mình thì tự giải rồi chạy lại build.
- Xung đột ở file dùng chung: dừng, nhắn Lâm và người vừa sửa file đó. Không tự chọn "ours" hay
  "theirs" cho code của người khác.
- Không `git push --force` lên nhánh người khác, không `reset`/`revert` commit của người khác,
  không sửa lịch sử đã đẩy lên `main`.

**Phát hiện lỗi ngoài phạm vi:** ghi lại theo mẫu, không sửa:

```text
NGOÀI PHẠM VI — <file>:<dòng> — <mô tả một dòng> — không sửa vì <lý do>
```

---

## 6. Quy ước code

**Chung:** code và tên biến bằng tiếng Anh; chữ hiển thị, thông báo lỗi, toast bằng tiếng Việt.
Không commit `.env`, `node_modules/`, `target/`, dữ liệu cá nhân thật.

**Backend (Java 21, Spring Boot 3.4):**

- Controller chỉ ánh xạ HTTP: nhận DTO `@Valid`, trả DTO, không trả entity thô, không chứa nghiệp vụ.
- Service giữ nghiệp vụ và là nơi duy nhất mở transaction.
- Repository dùng truy vấn dẫn xuất; thống kê phức tạp dùng `@Query` JPQL, tránh native SQL.
- DTO ↔ entity map tay trong service, không thêm MapStruct.
- Lỗi theo spec §7.5: có `code` ổn định, không lộ stack trace.
- Phân quyền kiểm ở backend; frontend chỉ ẩn/hiện cho đúng trải nghiệm.
- Không đổi shape response của endpoint đã có người dùng.

**Frontend (React 19 + Vite 8, HashRouter):**

- Code mới theo `src/features/<domain>/`; các trang cũ trong `src/pages/` giữ nguyên vị trí.
- Mọi HTTP đi qua `lib/apiClient.js`; path và chuẩn hóa response nằm trong `lib/resources.js`.
- Không import chéo giữa các `features/`; dữ liệu dùng chung lấy qua hook của phân hệ sở hữu.
- Dữ liệu nghiệp vụ lấy từ API; không đọc `useApp().data`, không ghi `localStorage`.
- Không thêm thư viện UI/state; dùng component và CSS có sẵn.

**Database:** tiền `DECIMAL(12,2)`; trạng thái là `ENUM` chữ HOA; thêm giá trị `ENUM` phải sửa cả
script SQL và enum Java; không xóa cứng dữ liệu đã phát sinh tài chính.

---

## 7. "Xong" nghĩa là gì

Một task chỉ được coi là xong khi có đủ 6 điều:

1. API và/hoặc màn hình chạy end-to-end với **MySQL thật**, không dùng dữ liệu mẫu/`localStorage`.
2. Có kiểm tra quyền và validation ở backend.
3. Có request Postman trong `tests/postman/<uc>.json` (hoặc test service) và đã chạy.
4. `mvn -f backend/pom.xml test` và `npm run build` đều pass.
5. `git diff --name-only` chỉ có file trong SCOPE.
6. PR được review và Lâm merge.

Lệnh chạy chung:

```bash
# DB sạch (máy mới)
mysql -u root -p < database/init_database.sql

# Đang phát triển: chạy migration + seed của từng nghiệp vụ
for f in database/migrations/*.sql; do mysql -u root -p bluemoon_db < "$f"; done
for f in database/seed/*.sql;        do mysql -u root -p bluemoon_db < "$f"; done

# Backend
mvn -f backend/pom.xml spring-boot:run
mvn -f backend/pom.xml test

# Frontend
cd frontend && npm install && npm run dev      # http://localhost:5173
npm run build
```

Tài khoản demo (mật khẩu `123456`): `admin` (ADMIN), `quanly` (MANAGER), `ketoan` (ACCOUNTANT),
`kythuat` (TECHNICIAN), `cudan` (RESIDENT).

Nếu có bước không chạy được (không có MySQL, thiếu `.env`…), ghi rõ **đã bỏ qua bước nào và vì
sao**. Không biến bước bị bỏ qua thành bước đã pass.

---

## 8. Làm việc với AI

AI **không** có sẵn skill như máy của Lâm, nên file này là thứ duy nhất nó cần đọc. Nếu công cụ
của bạn tự nạp `AGENTS.md`, không phải dán lại; nếu không, dán khối lệnh dưới cùng với task.

### 8.1 Câu lệnh mẫu

```text
Bạn làm task <mã task> của <tên>. Trước khi sửa bất cứ gì, đọc:
- AGENTS.md (quy trình và ranh giới)
- docs/kien-truc-he-thong.md mục <số mục>
- <các file liên quan cần hiểu>

Chỉ được sửa: <danh sách file chính xác>.
Không sửa file ngoài danh sách, không thêm dependency/bảng/cột/endpoint/trạng thái ngoài spec,
không format lại code có sẵn, không xóa code của người khác.

Trước khi sửa: in ra khối SCOPE theo AGENTS.md mục 4.
Sau khi sửa: chạy <lệnh test/build>, dán output thật, rồi in `git diff --name-only`.
Nếu cần thứ ngoài danh sách: dừng lại và hỏi, không tự làm.
```

### 8.2 Kiểm tra bài của AI trước khi mở PR

- `git diff --name-only` so với SCOPE: có file lạ là dừng.
- Đọc `git diff` của từng file AI sửa: có format lại, đổi tên, xóa code không liên quan là yêu cầu
  làm lại.
- Chạy lại lệnh build/test **bằng tay**; không tin câu "đã chạy pass".
- Kiểm xem có dependency/bảng/cột/endpoint mới nào ngoài spec không.
- AI không được merge, không được push `main`, không được commit `.env`.

Nếu máy bạn có sẵn skill agent (`.agents/skills/`): dùng được để làm nhanh hơn, nhưng 8 bước ở
mục 3 và các ranh giới ở mục 2 vẫn là chuẩn — skill không thay đổi được phạm vi công việc.

---

## 9. Checklist

**Trước khi bắt đầu**

- [ ] Đã đọc spec mục liên quan + code mình sẽ sửa
- [ ] Task có mã, có danh sách file, có điều kiện "xong khi"
- [ ] Đã chốt cách làm với người thứ hai (nếu việc > 4 giờ hoặc đụng API/schema dùng chung)
- [ ] Đã dán SCOPE
- [ ] Nhánh đặt đúng tên, tách từ `main` mới nhất

**Trước khi mở PR**

- [ ] `git diff --name-only` khớp SCOPE, không có file lạ
- [ ] Không có format lại, đổi tên, xóa code ngoài phạm vi
- [ ] `mvn test` và `npm run build` pass, output đã dán
- [ ] Postman/curl của endpoint mới đã chạy
- [ ] Luồng chính chạy trên MySQL thật, có kiểm quyền và trường hợp lỗi
- [ ] PR ≤ 400 dòng, mô tả 3 dòng, ảnh nếu là UI

**Trước khi merge (Lâm)**

- [ ] PR không chứa file ngoài lát cắt của người làm
- [ ] Không có dependency/bảng/cột/endpoint/trạng thái ngoài spec
- [ ] Đã rebase `origin/main`, build + test trên nhánh sau rebase
- [ ] Không có `.env`, mật khẩu, token trong diff

---

## 10. Khi nào dừng lại và hỏi

Dừng trước khi sửa và nhắn Lâm khi:

- Task cần thứ spec không định nghĩa (bảng, cột, endpoint, trạng thái, quyền).
- Cần sửa file dùng chung, hoặc cần thêm dependency.
- Cần đổi schema mà chưa có migration, hoặc đổi shape response của endpoint đang dùng.
- Task mơ hồ đến mức không viết được SCOPE.
- Build/test fail vì lý do ngoài phần mình làm — báo, đừng đuổi theo sửa.
- Cần quyền/mật khẩu CSDL mà bạn không có.
- Định xóa hoặc đổi tên thứ mình không tạo ra.

Hỏi luôn rẻ hơn sửa lại. Ghi đè việc của người khác thì không sửa lại được.
