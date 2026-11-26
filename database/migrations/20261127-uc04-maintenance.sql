-- ============================================================================
-- UC04: Equipment and maintenance tables
-- Date: 2026-11-27
-- Run after database/init_database.sql on bluemoon_db.
-- This migration creates the four UC04 tables only.
-- ============================================================================

USE bluemoon_db;

CREATE TABLE IF NOT EXISTS equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255),
    status ENUM('ACTIVE', 'BROKEN', 'MAINTENANCE') NOT NULL,
    installed_at DATE,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS technicians (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(150),
    phone VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    user_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_technicians_user_id UNIQUE (user_id),
    CONSTRAINT fk_technicians_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    planned_date DATE NOT NULL,
    frequency ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY')
        NOT NULL DEFAULT 'MONTHLY',
    note TEXT,
    status ENUM('PLANNED', 'DONE', 'CANCELLED') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenance_schedules_equipment_id (equipment_id),
    CONSTRAINT fk_maintenance_schedules_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT NOT NULL,
    schedule_id INT NULL,
    technician_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    start_date DATE,
    end_date DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED') NOT NULL,
    result TEXT,
    accepted_by INT NULL,
    accepted_at DATETIME,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenance_tasks_equipment_id (equipment_id),
    INDEX idx_maintenance_tasks_technician_status (technician_id, status),
    CONSTRAINT fk_maintenance_tasks_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_tasks_schedule
        FOREIGN KEY (schedule_id) REFERENCES maintenance_schedules(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_tasks_technician
        FOREIGN KEY (technician_id) REFERENCES technicians(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_maintenance_tasks_accepted_by
        FOREIGN KEY (accepted_by) REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
