# Tài liệu dự án BlueMoon

Thư mục này là nơi tra cứu chung của nhóm. `README.md` ở gốc để cài đặt và chạy;
`AGENTS.md` để biết cách phối hợp; các file dưới đây chia theo đúng việc bạn cần.

## Đọc lần đầu

1. [`README.md`](../README.md) — cài đặt, cổng, chạy backend/frontend.
2. [`kien-truc-he-thong.md`](kien-truc-he-thong.md) — sản phẩm làm ra cái gì.
3. [`ke-hoach-chia-viec.md`](ke-hoach-chia-viec.md) — lịch, ai làm gì, hạn.
4. [`chi-tiet-cong-viec.md`](chi-tiet-cong-viec.md) — task của bạn, từng ngày.
5. [`quy-uoc-code.md`](quy-uoc-code.md) — cách viết backend, frontend, database, test.
6. [`api-conventions.md`](api-conventions.md) — hợp đồng API, mã lỗi, registry endpoint.
7. [`AGENTS.md`](../AGENTS.md) — quy trình 8 bước, SCOPE, ranh giới.

## Bảng tài liệu

| Tài liệu | Vai trò | Đọc khi |
|---|---|---|
| [`kien-truc-he-thong.md`](kien-truc-he-thong.md) | **Spec** — phạm vi, 5 nghiệp vụ, dữ liệu, API, quyền, NFR | Trước mọi task |
| [`ke-hoach-chia-viec.md`](ke-hoach-chia-viec.md) | **Kế hoạch** — lịch 15 ngày, phân công, hạn, luật ngắn | Trước mọi task |
| [`chi-tiet-cong-viec.md`](chi-tiet-cong-viec.md) | **Chi tiết** — task ID, file làm việc, kết quả đầu ra, xong khi | Trước khi làm |
| [`quy-uoc-code.md`](quy-uoc-code.md) | **Quy ước** — kiến trúc, naming, backend, API, frontend, DB, test, Git | Trước khi viết code |
| [`api-conventions.md`](api-conventions.md) | **Hợp đồng API** — auth, lỗi, phân trang, registry endpoint | Khi gọi/thêm API |
| [`AGENTS.md`](../AGENTS.md) | **Cách làm** — 8 bước, SCOPE, file ownership, review, AI | Trước mọi task |
| [`README.md`](../README.md) | **Cài đặt** — MySQL, backend, frontend, tài khoản demo | Lần đầu và khi dựng máy |
| [`frontend/README.md`](../frontend/README.md) | **Frontend** — cách chạy, cấu trúc, lớp gọi API | Khi sửa giao diện |

## Khi tài liệu lệch nhau

- **Spec** quyết định sản phẩm: dữ liệu, API, quyền, hành vi.
- **Quy ước code** quyết định cách viết: lớp nào làm gì, đặt tên, lỗi, test.
- **Kế hoạch/chi tiết** quyết định ai làm gì, khi nào, file nào.
- **AGENTS.md** quyết định cách phối hợp: SCOPE, nhánh, PR, review.
- Chỉ đạo trực tiếp của Lâm thắng các tài liệu; nếu vẫn mâu thuẫn, hỏi Lâm trước khi sửa.

## Cập nhật tài liệu

- Hành vi, API, schema đổi → cập nhật spec và quy ước liên quan trong cùng PR.
- Ngày, người, task đổi → cập nhật kế hoạch và chi tiết.
- Quy trình, ranh giới, SCOPE đổi → cập nhật `AGENTS.md`.
- Thêm tài liệu mới → thêm một dòng vào bảng trên; không để file mồ côi.
- Tài liệu viết tiếng Việt; code, tên file, identifier viết tiếng Anh.
