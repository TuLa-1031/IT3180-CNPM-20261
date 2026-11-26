-- ============================================================================
-- Migration UC00 (GĐ1) — tài khoản đăng nhập, phân quyền, mật khẩu BCrypt
-- Chạy một lần trên CSDL đã có dữ liệu:
--   mysql -u root -p bluemoon_db < database/migrations/20261127-uc00-auth.sql
--
-- Thay đổi:
--   1. users.role thêm TECHNICIAN, RESIDENT
--   2. users.status dùng ACTIVE / LOCKED
--   3. users.resident_id (nullable, unique) liên kết tài khoản cư dân với nhân khẩu
--   4. 5 tài khoản mẫu, mật khẩu 123456 đã băm BCrypt
-- ============================================================================

USE bluemoon_db;

ALTER TABLE users
    MODIFY COLUMN role ENUM('ADMIN', 'MANAGER', 'ACCOUNTANT', 'TECHNICIAN', 'RESIDENT')
        NOT NULL DEFAULT 'MANAGER';

ALTER TABLE users
    MODIFY COLUMN status ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE users
    ADD COLUMN resident_id INT NULL UNIQUE
        COMMENT 'Tài khoản cư dân gắn với nhân khẩu (nullable)' AFTER status;

ALTER TABLE users
    ADD CONSTRAINT fk_users_resident FOREIGN KEY (resident_id)
        REFERENCES residents(id) ON DELETE SET NULL;

-- ON DUPLICATE KEY UPDATE để máy đã có tài khoản plaintext cũng nhận mật khẩu băm.
INSERT INTO users (username, password, full_name, email, phone, role, status, resident_id) VALUES
('admin',   '$2a$10$TzKYYuitqbdA8YGsTxbbCueLFEENQ.p4mEXs53UNZI92ub8L3c4Cm', 'Nguyễn Văn Quản Lý', 'admin@bluemoon.vn',   '0901234567', 'ADMIN',      'ACTIVE', NULL),
('ketoan',  '$2a$10$.CGkt5LevEGoqjBJzCr9xOCTlF8s9EKeLOWBl0nhzpoUcc/6oAq9O', 'Trần Thị Thu Ngân',  'ketoan@bluemoon.vn',  '0912345678', 'ACCOUNTANT', 'ACTIVE', NULL),
('quanly',  '$2a$10$8ZD5/DhIF6M/ayM.VFX.Ke2hPfXHkTPZiD82r.ap54dfLr7ejnJ2K', 'Lê Quang Huy',       'quanly@bluemoon.vn',  '0923456789', 'MANAGER',    'ACTIVE', NULL),
('kythuat', '$2a$10$W/wskre34iLnAS/fRwOtvepIxmqoXNw5hJ57qsOklmV.39RLBB4im', 'Đỗ Minh Kỹ Thuật',   'kythuat@bluemoon.vn', '0934567890', 'TECHNICIAN', 'ACTIVE', NULL),
('cudan',   '$2a$10$QVYUx1EqfbA0loAQtr/pLuKBBahoMuXvKbH6NU/nTFiNv7qTYKZs6', 'Phạm Văn Thái',      'cudan@bluemoon.vn',   '0981112233', 'RESIDENT',   'ACTIVE', 1)
ON DUPLICATE KEY UPDATE
    password   = VALUES(password),
    full_name  = VALUES(full_name),
    email      = VALUES(email),
    phone      = VALUES(phone),
    role       = VALUES(role),
    status     = VALUES(status),
    resident_id = VALUES(resident_id);
