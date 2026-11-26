# features/_template — khung màn hình chuẩn

Thư mục này là mẫu để tạo một phân hệ mới. Không import trực tiếp giữa các `features/`.

## Có gì trong đây

| File | Việc |
|---|---|
| `pages/TemplatePage.jsx` | Trang mẫu: bảng, ô tìm kiếm, nút Thêm, modal 2 ô, trạng thái rỗng |
| `api.js` | Lớp gọi API mẫu: `list/get/create/update/remove/action` qua `apiClient` + `resources.js` |

## Tạo phân hệ mới

1. Tạo `features/<domain>/` với `api.js`, `constants.js`, `pages/`, `components/`.
2. Đổi `RESOURCE` trong `api.js` sang key có sẵn ở `lib/resources.js`; nếu thiếu endpoint thì bổ sung entry ở đó trước.
3. Sao chép `pages/TemplatePage.jsx`, thay dữ liệu mẫu bằng `api.js`, giữ `PageHead`, `Toolbar`, `Modal`, `StatusBadge`.
4. Gửi Lâm `path + component` để thêm route vào `App.jsx`; không tự sửa route dùng chung.
5. Mỗi màn hình phải có 3 trạng thái: đang tải, rỗng, lỗi.
