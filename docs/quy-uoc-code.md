# Quy ước code — BlueMoon

Tài liệu này quy định **cách viết code** cho dự án BlueMoon. Cách tổ chức tham khảo từ repo
HR_Chan, nhưng nội dung đã đổi sang Spring Boot + React + MySQL.

Đọc kèm:

- **Sản phẩm làm ra cái gì:** [`kien-truc-he-thong.md`](kien-truc-he-thong.md)
- **Ai làm gì, khi nào:** [`ke-hoach-chia-viec.md`](ke-hoach-chia-viec.md)
- **Chi tiết từng việc:** [`chi-tiet-cong-viec.md`](chi-tiet-cong-viec.md)
- **Quy trình, SCOPE, cách phối hợp:** [`AGENTS.md`](../AGENTS.md)

Khi tài liệu lệch nhau: spec quyết định sản phẩm, tài liệu này quyết định cách viết code,
`AGENTS.md` quyết định cách làm việc. Chỉ đạo trực tiếp của Lâm thắng cả ba.

---

## 1. Kiến trúc và ranh giới

### 1.1 Stack

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 3.4, Spring Data JPA, Maven |
| Database | MySQL 8, `utf8mb4`, InnoDB |
| Frontend | React 19, Vite 8, React Router (HashRouter), CSS hiện có |
| Auth | JWT, BCrypt, phân quyền theo vai trò |
| Test | JUnit 5, MockMvc, Postman; frontend kiểm tra tay |

### 1.2 Luồng request

```text
Trình duyệt (React)
   │  JSON + Bearer token
   ▼
Controller  →  Service  →  Repository  →  MySQL
   │             │
   │             └─ nghiệp vụ, @Transactional
   └─ chỉ nhận/trả HTTP, @Valid
```

### 1.3 Trách nhiệm từng lớp

| Lớp | Được làm | Không được làm |
|---|---|---|
| Controller | Nhận request, `@Valid`, gọi service, trả `ResponseEntity` | Truy vấn DB, xử lý nghiệp vụ, trả entity thô |
| Service | Nghiệp vụ, kiểm tra quyền sở hữu, mở transaction, map DTO | Nhận `HttpServletRequest`, trả `ResponseEntity` |
| Repository | Truy vấn dữ liệu, `Pageable`, `@Query` JPQL | Chứa nghiệp vụ, gọi service khác |
| Entity | Ánh xạ bảng, trường dữ liệu | Logic nghiệp vụ, serialize trực tiếp ra API |
| DTO | Nhận/trả dữ liệu, validation | Chứa logic, trả password |
| Security | JWT, `SecurityConfig`, kiểm tra vai trò | Chứa nghiệp vụ |
| Exception | Lỗi có mã, format lỗi chung | Trả stack trace ra client |

### 1.4 Phân vùng nghiệp vụ

| Nghiệp vụ | Backend | Frontend |
|---|---|---|
| Auth | `security/`, `AuthController`, `AuthService`, `UserEntity` | `app/`, `lib/auth.js`, `pages/Login.jsx` |
| UC01 cư dân, căn hộ | `Household*`, `Resident*`, `ResidenceChange*` | `features/households/`, `pages/Households.jsx`, `Residents.jsx`, `Changes.jsx` |
| UC02 thu phí, công nợ | `Fee*`, `Payment*`, `PaymentTransaction*`, `UtilityBill*` | `features/fees/`, `pages/Fees.jsx`, `Payments.jsx`, `Bills.jsx` |
| UC03 phản ánh | `Feedback*` | `features/feedbacks/` |
| UC04 bảo trì | `Equipment*`, `MaintenanceSchedule*`, `MaintenanceTask*`, `Technician*` | `features/maintenance/` |
| UC05 gửi xe | `Vehicle*`, `VehicleRegistration*`, `ParkingCard*` | `features/vehicles/`, `pages/Vehicles.jsx` |
| Thông báo, thống kê | `Notification*`, stats | `features/notifications/`, `features/reports/`, `pages/Dashboard.jsx`, `Statistics.jsx` |

**Quy tắc:** backend giữ package theo lớp (`controller`, `service`, `repository`, `entity`, `dto`);
mỗi nghiệp vụ gom theo tiền tố tên (`Fee*`, `Payment*`). Frontend mới đặt theo `features/<domain>/`;
các trang cũ trong `pages/` giữ nguyên cho đến khi có task chuyển.

Không đổi kiến trúc, thư viện, cách chia package trong một task lẻ. Muốn đổi thì viết đề xuất riêng.

---

## 2. Quy ước chung

### 2.1 Ngôn ngữ và đặt tên

- Code, tên biến, commit: **tiếng Anh**. Giao diện, thông báo lỗi, toast: **tiếng Việt**.
- Comment chỉ viết khi cần giải thích “vì sao”; không comment lại điều code đã nói rõ.
- Tên file: ASCII, không dấu, `kebab-case` cho tài liệu, `PascalCase` cho component.

| Đối tượng | Quy ước | Ví dụ |
|---|---|---|
| Java class | `PascalCase` | `FeeService`, `PaymentController` |
| Java method, biến | `camelCase` | `generateInvoices`, `amountDue` |
| Hằng số | `UPPER_SNAKE_CASE` | `MAX_PAGE_SIZE` |
| Package | chữ thường | `com.bluemoon.service` |
| Bảng | `snake_case`, số nhiều | `payment_transactions` |
| Cột | `snake_case` | `amount_paid`, `billing_month` |
| Khóa ngoại | `<bảng>_id` | `household_id`, `fee_id` |
| Chỉ mục | `idx_<bảng>_<cột>` | `idx_feedbacks_status` |
| Unique | `uk_<bảng>_<cột>` | `uk_household_fee` |
| API path | danh từ số nhiều, `kebab-case` | `/api/vehicle-registrations` |
| JSON field | `camelCase` | `licensePlate`, `amountDue` |
| Query param | `camelCase` | `?householdId=1&status=ACTIVE` |
| Enum | `UPPER_SNAKE_CASE` | `PENDING`, `IN_PROGRESS` |
| React component | `PascalCase.jsx` | `FeeForm.jsx` |
| Hook | `useXxx.js` | `useFees.js` |
| Nhánh Git | `feat/g<đợt>-<tên>-<uc>` | `feat/g2-kien-uc01` |
| Commit | `<loại>(<uc>): <mô tả>` | `feat(uc01): validate duplicate household code` |

### 2.2 Phạm vi thay đổi

- Mỗi đợt một nhánh/người; mỗi task ít nhất một commit. Không gộp việc của người khác.
- Chỉ sửa file trong phần của mình. File dùng chung chỉ Lâm sửa.
- Không format lại, đổi tên, xóa code “trông thừa” ngoài phạm vi.
- Không đổi shape response, route, field JSON, mã lỗi của endpoint đang có người dùng.
- Không thêm dependency, bảng, cột, endpoint, trạng thái ngoài spec. Thiếu thì hỏi Lâm.

### 2.3 Cấu hình và bí mật

- Không commit `.env`, mật khẩu, token, dữ liệu cá nhân thật.
- `.env.example` chỉ chứa giá trị mẫu an toàn.
- Biến môi trường đọc qua `${...:mặc định}` trong `application.properties`.
- Biến `VITE_*` là công khai, không dùng để chứa bí mật.
- Không log mật khẩu, token, CCCD, số điện thoại đầy đủ.

### 2.4 Tài liệu

- Hành vi/API/schema đổi thì cập nhật spec hoặc tài liệu liên quan trong cùng PR.
- Một quy tắc chỉ nằm ở một tài liệu; nơi khác link tới, không chép lại.
- Tài liệu viết tiếng Việt; code và comment viết tiếng Anh.

---

## 3. Backend

### 3.1 Cấu trúc gói

```text
backend/src/main/java/com/bluemoon/
├── config/          # CORS, JPA auditing, seed
├── controller/      # HTTP
├── dto/             # *Request, *Response, PageResponse
├── entity/          # ánh xạ bảng
├── enums/           # vai trò, trạng thái
├── exception/       # lỗi chung, mã lỗi
├── repository/      # Spring Data JPA
├── security/        # JWT, filter, UserDetails, SecurityConfig
└── service/         # nghiệp vụ
```

### 3.2 Controller

- Chỉ ánh xạ HTTP; nhận `@Valid` request DTO; trả response DTO.
- Không gọi repository, không trả entity, không chứa `if` nghiệp vụ.
- Đặt quyền bằng `@PreAuthorize`; kiểm tra sở hữu dữ liệu ở service.
- Dùng `ResponseEntity` và đúng status: `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`.

```java
@RestController
@RequestMapping("/api/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService feeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','ACCOUNTANT')")
    public ResponseEntity<PageResponse<FeeResponse>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(feeService.list(status, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ACCOUNTANT')")
    public ResponseEntity<FeeResponse> create(@Valid @RequestBody FeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feeService.create(request));
    }
}
```

### 3.3 Service

- Là nơi duy nhất mở transaction: `@Transactional` cho thao tác ghi.
- Kiểm tra nghiệp vụ, quyền sở hữu, trạng thái trước khi ghi.
- Map entity ↔ DTO thủ công; không dùng MapStruct.
- Ném `BusinessException` với `code` ổn định; không trả `null` mơ hồ.

```java
@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeRepository feeRepository;

    @Transactional
    public FeeResponse create(FeeRequest request) {
        if (feeRepository.existsByFeeCode(request.feeCode())) {
            throw new BusinessException("DUPLICATE_CODE", HttpStatus.CONFLICT, "Mã khoản thu đã tồn tại");
        }
        FeeEntity entity = new FeeEntity();
        entity.setFeeCode(request.feeCode());
        entity.setName(request.name());
        entity.setUnitPrice(request.unitPrice());
        return toResponse(feeRepository.save(entity));
    }

    private FeeResponse toResponse(FeeEntity entity) {
        return new FeeResponse(entity.getId(), entity.getFeeCode(), entity.getName());
    }
}
```

### 3.4 Repository

- Dùng truy vấn dẫn xuất: `findBy...`, `existsBy...`, `countBy...`.
- Truy vấn thống kê phức tạp dùng `@Query` JPQL; tránh native SQL nếu không cần.
- Phân trang bằng `Pageable`; không tự viết `LIMIT` trong service.

```java
public interface FeeRepository extends JpaRepository<FeeEntity, Integer> {
    boolean existsByFeeCode(String feeCode);
    Page<FeeEntity> findByStatus(String status, Pageable pageable);
}
```

### 3.5 Entity

- `@Entity`, `@Table(name = "...")`, `@Column(name = "...")` rõ ràng.
- Dùng `@Getter/@Setter/@NoArgsConstructor` cho entity mới; không dùng `@Data` vì `equals/hashCode` dễ sai.
- Không đặt logic nghiệp vụ trong entity.
- Audit bằng `@CreationTimestamp`, `@UpdateTimestamp`.
- Giữ khóa ngoại dạng cột ID như code hiện tại; tránh `@ManyToOne` nếu chưa cần.

```java
@Entity
@Table(name = "fees")
@Getter
@Setter
@NoArgsConstructor
public class FeeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fee_code", nullable = false, unique = true, length = 30)
    private String feeCode;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
```

### 3.6 DTO và validation

- Request/response tách khỏi entity.
- Dùng `record` cho DTO mới; validation bằng Jakarta (`@NotBlank`, `@NotNull`, `@Positive`, `@Min`, `@Max`, `@Size`).
- Không trả `password`; không trả entity thô.
- Tên field JSON giữ `camelCase`.

```java
public record FeeRequest(
        @NotBlank @Size(max = 30) String feeCode,
        @NotBlank @Size(max = 150) String name,
        @NotNull FeeType feeType,
        @PositiveOrZero BigDecimal unitPrice,
        @Min(1) @Max(12) Integer billingMonth
) {}
```

### 3.7 Lỗi

- Lỗi nghiệp vụ có `code` ổn định; message tiếng Việt; không lộ stack trace.
- `GlobalExceptionHandler` bắt validation, lỗi nghiệp vụ, lỗi không mong đợi.
- Response lỗi theo spec §7.3:

```json
{
  "timestamp": "2026-11-26T10:15:30",
  "status": 409,
  "code": "DUPLICATE_CODE",
  "message": "Mã khoản thu đã tồn tại",
  "path": "/api/fees",
  "fieldErrors": []
}
```

- Mã lỗi dùng đúng bảng spec §7.5; không tự đặt mã mới nếu chưa cập nhật spec.

### 3.8 Bảo mật

- JWT stateless; mật khẩu BCrypt; không lưu token phía server.
- `SecurityConfig` chặn mọi endpoint trừ login/register/health; bật `@EnableMethodSecurity`.
- Kiểm tra quyền ở backend; frontend chỉ ẩn/hiện.
- Cư dân không được gửi `householdId` cho hành động của mình; backend lấy từ token.
- `@PreAuthorize` theo vai trò; kiểm tra sở hữu (hộ của cư dân, việc của kỹ thuật) trong service.

### 3.9 Phân trang

- Trả `PageResponse<T>`: `content`, `page`, `size`, `totalElements`, `totalPages`.
- Mặc định 20 bản ghi/trang; tối đa 100.
- Query param: `page`, `size`, `sort`.

### 3.10 Logging

- Dùng `@Slf4j`; log thay đổi trạng thái quan trọng ở mức `info`.
- Không log mật khẩu, token, CCCD đầy đủ, dữ liệu cá nhân.
- Lỗi không mong đợi log stack trace ở server; client chỉ nhận message chung.

### 3.11 Test backend

- Unit test service bằng JUnit 5 + Mockito cho quy tắc nghiệp vụ.
- Integration test controller bằng `@SpringBootTest` + MockMvc; cần MySQL `bluemoon_db`.
- Không dùng H2 thay MySQL nếu hành vi phụ thuộc MySQL.
- Tên test mô tả hành vi: `create_duplicateFeeCode_throws409`.

```java
@ExtendWith(MockitoExtension.class)
class FeeServiceTest {

    @Mock FeeRepository feeRepository;
    @InjectMocks FeeService feeService;

    @Test
    void create_duplicateFeeCode_throws409() {
        when(feeRepository.existsByFeeCode("PARKING")).thenReturn(true);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> feeService.create(new FeeRequest("PARKING", "Phí gửi xe", FeeType.PARKING,
                        BigDecimal.valueOf(70000), 11)));
        assertEquals("DUPLICATE_CODE", ex.getCode());
    }
}
```

---

## 4. API

| Quy tắc | Cách làm |
|---|---|
| Base path | `/api`, không version hóa URL |
| Tài nguyên | danh từ số nhiều, `kebab-case`: `/api/vehicle-registrations` |
| Phương thức | `GET` đọc, `POST` tạo, `PUT` thay toàn bộ, `PATCH` sửa/hành động, `DELETE` xóa |
| Hành động | `PATCH /{id}/approve`, `/reject`, `/close`, `/assign`, `/accept` |
| Status | `200` đọc/sửa, `201` tạo, `204` xóa, `400` sai dữ liệu, `401` chưa đăng nhập, `403` sai quyền, `404` không thấy, `409` trùng/trạng thái |
| JSON | `camelCase`; ngày `YYYY-MM-DD`; thời gian ISO; tiền là số |
| Null | Trả `null` cho trường không có; không bỏ field tùy tiện |
| Lỗi | `{status, code, message, path, fieldErrors}` |
| Danh sách | `PageResponse<T>` |
| Auth | `Authorization: Bearer <token>` |
| Idempotent | Duyệt lại yêu cầu/giao dịch đã duyệt trả `409`, không tạo bản ghi thứ hai |

Không trả entity thô, không đặt động từ trong URL CRUD, không đổi shape response của endpoint đang dùng.

---

## 5. Frontend

### 5.1 Cấu trúc

```text
frontend/src/
├── app/                 # provider, layout, route guard
├── components/          # UI kit dùng chung
├── features/
│   ├── fees/
│   │   ├── api.js
│   │   ├── constants.js
│   │   ├── pages/
│   │   └── components/
│   └── ...
├── lib/                 # apiClient, resources, format, auth
├── pages/               # trang cũ, giữ nguyên đến khi chuyển
└── styles.css           # design system
```

### 5.2 Feature

- Mỗi feature tự chứa `api.js`, `constants.js`, `pages/`, `components/`.
- Không import chéo giữa các feature; dữ liệu dùng chung lấy qua hook của feature sở hữu.
- Trang mới đặt trong `features/<domain>/pages/`; trang cũ trong `pages/` không tự ý chuyển.

### 5.3 Gọi API

- Mọi HTTP đi qua `lib/apiClient.js`; path và chuẩn hóa response ở `lib/resources.js`.
- Component không gọi `fetch` trực tiếp; không hardcode base URL.
- Feature `api.js` chỉ gọi transport và trả dữ liệu đã chuẩn hóa.

```js
// features/fees/api.js
import { apiClient } from '../../lib/apiClient'
import { RESOURCES } from '../../lib/resources'

export const feesApi = {
  list: (params) => apiClient.request(`${RESOURCES.fees.path}?${new URLSearchParams(params)}`),
  create: (body) => apiClient.request(RESOURCES.fees.path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
}
```

- Nếu `apiClient` chưa có helper cho JSON/token, Lâm bổ sung một lần; không tự viết `fetch` trong feature.

### 5.4 State và auth

- `AuthProvider` giữ user/token; `Toast` cho thông báo.
- Dữ liệu nghiệp vụ lấy từ API; không đọc `useApp().data` trong code mới.
- Không dùng `localStorage` cho dữ liệu nghiệp vụ; chỉ lưu token và tuỳ chọn giao diện.
- Không thêm Zustand/Redux/thư viện state mới.
- Route guard chỉ là điều hướng; backend mới là nơi quyết định quyền.

### 5.5 Form và trạng thái màn hình

- Dùng `Field`, `SelectField`, `TextArea`, `Modal` có sẵn.
- Validate phía client cho lỗi cơ bản; vẫn hiển thị `fieldErrors` từ server.
- Mỗi màn hình có 3 trạng thái: đang tải, rỗng, lỗi. Không fallback im lặng sang dữ liệu mẫu.
- Thông báo lỗi tiếng Việt, ngắn, chỉ rõ trường sai.

### 5.6 Style

- Dùng design system trong `styles.css`; class hiện có trước, thêm class mới khi thật cần.
- Không thêm Tailwind, UI library hay CSS framework mới.
- CSS riêng của feature đặt trong `features/<domain>/<domain>.css`; không sửa `styles.css` (Lâm giữ).
- Responsive: kiểm tra 360px, 768px, 1280px; không làm vỡ layout bảng.

### 5.7 Routing

- Giữ `HashRouter`; route theo vai trò.
- Lâm giữ `App.jsx` và danh sách route; feature gửi path + component.
- Không tự thêm route công khai cho trang cần đăng nhập.

### 5.8 Accessibility

- Mỗi input có label; nút có `aria-label` khi chỉ có icon.
- Hỗ trợ bàn phím: tab, enter, escape đóng modal.
- Giữ skip link, `aria-current`, `aria-expanded` như code hiện có.
- Không dùng màu làm tín hiệu duy nhất; kiểm tra tương phản.

### 5.9 Kiểm tra frontend

- Chạy `npm run build`; mở app kiểm tra luồng chính.
- Không có test runner frontend; không tự thêm Vitest/Playwright nếu chưa được duyệt.
- Kiểm tra 3 trạng thái màn hình, lỗi API, quyền theo vai trò.

---

## 6. Database

### 6.1 Quy ước chung

- MySQL 8, `utf8mb4_unicode_ci`, InnoDB.
- Khóa chính `INT AUTO_INCREMENT`; khóa ngoại cùng kiểu.
- Tiền `DECIMAL(12,2)`; diện tích `DECIMAL(8,2)`.
- Trạng thái `ENUM` chữ HOA; thêm giá trị phải sửa cả SQL và Java.
- Thời gian `TIMESTAMP`/`DATETIME`, múi giờ `Asia/Ho_Chi_Minh`.
- Audit `created_at`, `updated_at`.
- Không xóa cứng dữ liệu đã phát sinh tài chính; dùng trạng thái.

### 6.2 Migration

- Mỗi thay đổi schema là một file mới trong `database/migrations/`:
  `YYYYMMDD-ucXX-mo-ta.sql`.
- Không sửa file migration đã chạy; không sửa `init_database.sql` (trừ Lâm).
- Không dùng `ddl-auto=update`; giữ `none`.
- Lâm chạy migration trên DB sạch ở cuối mỗi đợt.
- Migration phải chạy được một lần, có ghi chú đầu file.

### 6.3 Seed

- Dữ liệu mẫu đặt trong `database/seed/ucXX.sql`.
- Dùng `INSERT IGNORE` để chạy lại không lỗi.
- Không dùng dữ liệu cá nhân thật.
- Đủ dữ liệu demo 5 nghiệp vụ theo spec §6.5.

### 6.4 Chỉ mục và ràng buộc

- Khóa ngoại cho quan hệ bắt buộc; `ON DELETE` rõ ràng.
- Unique cho mã hộ, mã khoản thu, biển số, mã thẻ, CCCD.
- Chỉ mục cho cột lọc/phân trang: `status`, `created_at`, `household_id`, `technician_id`.
- Không thêm chỉ mục tràn lan; mỗi chỉ mục phải có truy vấn dùng đến.

---

## 7. Testing và xác minh

| Phạm vi | Kiểm tra bắt buộc |
|---|---|
| Backend | `mvn -f backend/pom.xml test`; Postman cho endpoint mới; `GET /api/health` |
| Frontend | `npm run build`; mở app kiểm tra luồng chính, 3 trạng thái |
| Database | Chạy migration trên DB sạch; kiểm tra seed; không sửa tay dữ liệu demo |
| Docs | Link nội bộ, bảng markdown, `git diff --check`, đọc lại thay đổi |
| Cả hai | Chạy cả hai phía; `git diff --name-only` khớp SCOPE |

- Dán output thật khi báo xong; không nói “chắc là chạy được”.
- Nếu không chạy được (không có MySQL, thiếu `.env`), ghi rõ đã bỏ qua bước nào và vì sao.
- Không dùng kết quả test cũ làm bằng chứng mới.

---

## 8. Git và review

### 8.1 Nhánh

- Mỗi đợt một nhánh/người: `feat/g<đợt>-<tên>-<uc>`.
- Đức tách hai nhánh cho UC03 và UC05.
- Task lớn tách nhánh riêng; không gộp hai UC vào một nhánh.

### 8.2 Commit

- `<loại>(<uc>): <mô tả>` — `feat(uc01): validate duplicate household code`.
- Loại: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`.
- Mỗi task ít nhất một commit; không commit file sinh tự động, `.env`, `node_modules`, `target`.

### 8.3 PR

- PR ≤ 400 dòng; lớn hơn thì tách.
- Mô tả 3 dòng: làm gì; kiểm thế nào; còn gì chưa làm.
- Ảnh chụp màn hình nếu là UI.
- Reviewer: Lâm; Lâm merge, không tự merge PR của mình.

### 8.4 Review checklist

- [ ] Diff chỉ có file trong SCOPE.
- [ ] Không format lại, đổi tên, xóa code ngoài phạm vi.
- [ ] Không đổi shape response/route/mã lỗi đang dùng.
- [ ] Có validation và kiểm tra quyền ở backend.
- [ ] Có test/Postman hoặc checklist tay đã chạy.
- [ ] Không có `.env`, mật khẩu, token trong diff.
- [ ] Tài liệu liên quan đã cập nhật.

---

## 9. Làm việc với AI

- Đưa AI đúng tên task, file được sửa, mục spec/quy ước liên quan.
- Yêu cầu AI in SCOPE trước khi sửa; không sửa file ngoài danh sách.
- Không để AI tự thêm dependency, bảng, cột, endpoint, trạng thái ngoài spec.
- Đọc lại diff; chạy test bằng tay; không tin câu “đã chạy pass”.
- Không để AI merge, push `main`, commit `.env`.
- Nếu AI đề xuất đổi kiến trúc hoặc thêm thư viện, dừng lại hỏi Lâm.

---

## 10. Checklist

**Trước khi bắt đầu**

- [ ] Đọc spec mục liên quan + quy ước này + code sẽ sửa.
- [ ] Xác định task ID, file sẽ sửa, file chỉ đọc.
- [ ] Viết SCOPE.
- [ ] Tạo nhánh đúng tên từ `main` mới nhất.

**Trước khi mở PR**

- [ ] `git diff --name-only` khớp SCOPE.
- [ ] Không có format lại, đổi tên, xóa code ngoài phạm vi.
- [ ] `mvn test` và `npm run build` pass; output đã dán.
- [ ] Postman/curl endpoint mới đã chạy.
- [ ] Luồng chính chạy trên MySQL thật; có kiểm quyền và lỗi.
- [ ] PR ≤ 400 dòng, mô tả 3 dòng, ảnh nếu là UI.

**Trước khi merge (Lâm)**

- [ ] PR không chứa file ngoài phần của người làm.
- [ ] Không có dependency/bảng/cột/endpoint/trạng thái ngoài spec.
- [ ] Đã rebase `main`, build + test lại sau rebase.
- [ ] Không có `.env`, mật khẩu, token trong diff.
