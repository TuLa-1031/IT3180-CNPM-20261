-- ============================================================================
-- TẬP LỆNH KHỞI TẠO CƠ SỞ DỮ LIỆU QUẢN LÝ CHUNG CƯ BLUEMOON (MySQL)
-- Phiên bản: v1.0 (Hộ khẩu, Nhân khẩu, Khoản thu, Thu phí) + v2.0 (Gửi xe, Thu hộ)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS bluemoon_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bluemoon_db;

-- ----------------------------------------------------------------------------
-- 1. Bảng tài khoản Ban quản trị (users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'MANAGER', 'ACCOUNTANT') NOT NULL DEFAULT 'MANAGER',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. Bảng hộ gia đình / hộ khẩu (households)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS households (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_code VARCHAR(20) NOT NULL UNIQUE,
    apartment_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL,
    area DECIMAL(8, 2) NOT NULL COMMENT 'Diện tích căn hộ (m2) dùng để tính phí dịch vụ & quản lý',
    owner_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    move_in_date DATE,
    status ENUM('ACTIVE', 'MOVED_OUT') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. Bảng nhân khẩu (residents)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT 'OTHER',
    identity_card VARCHAR(20) UNIQUE COMMENT 'Số CCCD/CMND (có thể NULL với trẻ nhỏ)',
    relationship_to_owner VARCHAR(50) NOT NULL,
    occupation VARCHAR(100),
    hometown VARCHAR(150),
    residence_status ENUM('PERMANENT', 'TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE', 'MOVED_OUT') NOT NULL DEFAULT 'PERMANENT',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_residents_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. Bảng biến đổi nhân khẩu: tạm trú, tạm vắng, chuyển đến/đi (residence_changes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS residence_changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    household_id INT NOT NULL,
    change_type ENUM('TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE', 'MOVE_IN', 'MOVE_OUT') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    destination_or_origin VARCHAR(255),
    reason TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_changes_resident FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
    CONSTRAINT fk_changes_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_changes_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. Bảng danh mục khoản thu / đợt đóng góp (fees)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fee_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    fee_type ENUM('SERVICE', 'MANAGEMENT', 'CONTRIBUTION', 'PARKING', 'UTILITY') NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'TRUE: bắt buộc hàng tháng, FALSE: đóng góp tự nguyện',
    calculation_method ENUM('PER_AREA', 'FIXED', 'BY_VEHICLE', 'BY_USAGE', 'VOLUNTARY') NOT NULL DEFAULT 'FIXED',
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Đơn giá (VD: đồng/m2 hoặc số tiền cố định)',
    billing_month TINYINT,
    billing_year SMALLINT,
    start_date DATE,
    due_date DATE,
    description TEXT,
    status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fees_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. Bảng thu phí / nộp tiền của các hộ gia đình (payments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    fee_id INT NOT NULL,
    amount_due DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_date DATETIME,
    payment_method ENUM('CASH', 'BANK_TRANSFER') DEFAULT 'CASH',
    status ENUM('UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
    collected_by INT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_household_fee (household_id, fee_id),
    CONSTRAINT fk_payments_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_fee FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_collector FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. Bảng phương tiện gửi xe - Phiên bản v2.0 (vehicles)
--    Xe máy: 70.000đ/xe/tháng | Ô tô: 1.200.000đ/xe/tháng
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    vehicle_type ENUM('MOTORBIKE', 'CAR') NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50),
    monthly_fee DECIMAL(12, 2) NOT NULL,
    registered_date DATE,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. Bảng hóa đơn thu hộ điện, nước, internet - Phiên bản v2.0 (utility_bills)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utility_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    household_id INT NOT NULL,
    fee_id INT,
    service_type ENUM('ELECTRICITY', 'WATER', 'INTERNET') NOT NULL,
    billing_month TINYINT NOT NULL,
    billing_year SMALLINT NOT NULL,
    previous_index INT NOT NULL DEFAULT 0,
    current_index INT NOT NULL DEFAULT 0,
    usage_amount INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    provider_name VARCHAR(100),
    payment_status ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    paid_at DATETIME,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_utility_period (household_id, service_type, billing_month, billing_year),
    CONSTRAINT fk_utility_household FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT fk_utility_fee FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================================
-- DỮ LIỆU MẪU BAN ĐẦU ĐỂ KIỂM THỬ
-- ============================================================================

INSERT IGNORE INTO users (id, username, password, full_name, email, phone, role, status) VALUES
(1, 'admin', '123456', 'Nguyễn Văn Quản Lý', 'admin@bluemoon.vn', '0901234567', 'ADMIN', 'ACTIVE'),
(2, 'ketoan', '123456', 'Trần Thị Thu Ngân', 'ketoan@bluemoon.vn', '0912345678', 'ACCOUNTANT', 'ACTIVE');

INSERT IGNORE INTO households (id, household_code, apartment_number, floor, area, owner_name, phone, move_in_date, status) VALUES
(1, 'BM-0601', '601', 6, 75.50, 'Phạm Văn Thái', '0981112233', '2023-05-10', 'ACTIVE'),
(2, 'BM-1002', '1002', 10, 92.00, 'Hồ Tú Toàn', '0982223344', '2023-06-15', 'ACTIVE'),
(3, 'BM-1504', '1504', 15, 110.00, 'Vũ Kim Thu', '0983334455', '2024-01-20', 'ACTIVE'),
(4, 'BM-K101', 'Kiot 01', 1, 60.00, 'Ngô Quang Minh', '0984445566', '2023-04-01', 'ACTIVE');

INSERT IGNORE INTO residents (id, household_id, full_name, date_of_birth, gender, identity_card, relationship_to_owner, occupation, hometown, residence_status) VALUES
(1, 1, 'Phạm Văn Thái', '1985-03-12', 'MALE', '001085012345', 'Chủ hộ', 'Kỹ sư xây dựng', 'Hà Nội', 'PERMANENT'),
(2, 1, 'Nguyễn Thị Lan', '1988-07-24', 'FEMALE', '001188054321', 'Vợ', 'Giáo viên', 'Nam Định', 'PERMANENT'),
(3, 1, 'Phạm Minh Khôi', '2016-09-05', 'MALE', NULL, 'Con', 'Học sinh', 'Hà Nội', 'PERMANENT'),
(4, 2, 'Hồ Tú Toàn', '1979-11-18', 'MALE', '001079098765', 'Chủ hộ', 'Kinh doanh', 'Nghệ An', 'PERMANENT'),
(5, 2, 'Lê Thu Hà', '1982-02-14', 'FEMALE', '001182067890', 'Vợ', 'Kế toán', 'Hà Nội', 'TEMPORARY_ABSENCE'),
(6, 3, 'Vũ Kim Thu', '1992-08-30', 'FEMALE', '001192011223', 'Chủ hộ', 'Nhân viên văn phòng', 'Hải Phòng', 'PERMANENT'),
(7, 4, 'Ngô Quang Minh', '1990-05-02', 'MALE', '001090033445', 'Chủ hộ', 'Chủ cửa hàng', 'Hà Nội', 'TEMPORARY_RESIDENCE');

INSERT IGNORE INTO residence_changes (id, resident_id, household_id, change_type, start_date, end_date, destination_or_origin, reason, created_by) VALUES
(1, 5, 2, 'TEMPORARY_ABSENCE', '2026-10-01', '2026-12-31', 'TP. Hồ Chí Minh', 'Đi công tác dài hạn', 1),
(2, 7, 4, 'TEMPORARY_RESIDENCE', '2026-09-15', '2027-09-15', 'Thanh Xuân, Hà Nội', 'Thuê kiot kinh doanh và sinh sống', 1);

INSERT IGNORE INTO fees (id, fee_code, name, fee_type, is_mandatory, calculation_method, unit_price, billing_month, billing_year, start_date, due_date, description, status, created_by) VALUES
(1, 'DV-2026-10', 'Phí dịch vụ chung cư tháng 10/2026', 'SERVICE', TRUE, 'PER_AREA', 5000.00, 10, 2026, '2026-10-01', '2026-10-15', 'Phí vệ sinh, bảo dưỡng cảnh quan và an ninh chung cư (5.000đ/m2)', 'OPEN', 1),
(2, 'QL-2026-10', 'Phí quản lý chung cư tháng 10/2026', 'MANAGEMENT', TRUE, 'PER_AREA', 7000.00, 10, 2026, '2026-10-01', '2026-10-15', 'Phí quản lý vận hành chung cư BlueMoon (7.000đ/m2)', 'OPEN', 1),
(3, 'QUY-NGHEO-2026', 'Quỹ vì người nghèo năm 2026', 'CONTRIBUTION', FALSE, 'VOLUNTARY', 0.00, NULL, 2026, '2026-10-01', '2026-10-30', 'Khoản đóng góp tự nguyện phối hợp cùng tổ dân phố', 'OPEN', 1),
(4, 'QUY-BIENDAO-2026', 'Quỹ vì biển đảo Việt Nam 2026', 'CONTRIBUTION', FALSE, 'VOLUNTARY', 0.00, NULL, 2026, '2026-10-01', '2026-10-30', 'Khoản đóng góp tự nguyện ủng hộ biển đảo', 'OPEN', 1);

INSERT IGNORE INTO payments (id, household_id, fee_id, amount_due, amount_paid, payment_date, payment_method, status, collected_by, note) VALUES
(1, 1, 1, 377500.00, 377500.00, '2026-10-05 09:30:00', 'BANK_TRANSFER', 'PAID', 2, '75.5m2 x 5.000đ'),
(2, 1, 2, 528500.00, 528500.00, '2026-10-05 09:30:00', 'BANK_TRANSFER', 'PAID', 2, '75.5m2 x 7.000đ'),
(3, 1, 3, 0.00, 100000.00, '2026-10-06 14:15:00', 'CASH', 'PAID', 2, 'Hộ gia đình tự nguyện đóng góp'),
(4, 2, 1, 460000.00, 0.00, NULL, 'CASH', 'UNPAID', NULL, 'Chưa thanh toán phí dịch vụ tháng 10/2026');

INSERT IGNORE INTO vehicles (id, household_id, vehicle_type, license_plate, brand, monthly_fee, registered_date, status, note) VALUES
(1, 1, 'MOTORBIKE', '29E1-123.45', 'Honda Vision', 70000.00, '2024-01-10', 'ACTIVE', 'Gửi hầm B1'),
(2, 2, 'CAR', '30A-678.90', 'Toyota Vios', 1200000.00, '2024-03-01', 'ACTIVE', 'Gửi hầm B2');

INSERT IGNORE INTO utility_bills (id, household_id, fee_id, service_type, billing_month, billing_year, previous_index, current_index, usage_amount, total_amount, provider_name, payment_status, paid_at, note) VALUES
(1, 1, NULL, 'ELECTRICITY', 10, 2026, 1250, 1430, 180, 450000.00, 'EVN Hà Nội', 'PAID', '2026-10-12 10:00:00', 'Thu hộ tiền điện tháng 10/2026'),
(2, 1, NULL, 'WATER', 10, 2026, 310, 325, 15, 135000.00, 'Nước sạch Hà Đông', 'UNPAID', NULL, 'Thu hộ tiền nước tháng 10/2026'),
(3, 2, NULL, 'INTERNET', 10, 2026, 0, 0, 1, 220000.00, 'VNPT', 'UNPAID', NULL, 'Gói cước cố định hàng tháng');

