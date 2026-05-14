DROP DATABASE IF EXISTS TradeDB;

CREATE DATABASE TradeDB
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE TradeDB;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_report_profit;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('guest', 'operator', 'admin') NOT NULL DEFAULT 'guest',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  last_login_at DATETIME NULL,
  previous_login_at DATETIME NULL,
  login_count INT UNSIGNED NOT NULL DEFAULT 0,
  remember_token_hash CHAR(64) NULL,
  remember_expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, status),
  KEY idx_users_remember_token_hash (remember_token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  boss_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  floor TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  supplier VARCHAR(180) NOT NULL,
  retail_price DECIMAL(10,2) NOT NULL,
  arrival_date DATE NOT NULL,
  department_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_products_department_id (department_id),
  CONSTRAINT fk_products_department
    FOREIGN KEY (department_id)
    REFERENCES departments (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  retail_price DECIMAL(10,2) NULL,
  sale_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  date DATE GENERATED ALWAYS AS (sale_date) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_sales_product_id (product_id),
  KEY idx_sales_sale_date (sale_date),
  CONSTRAINT fk_sales_product
    FOREIGN KEY (product_id)
    REFERENCES products (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, full_name, password_hash, role, status) VALUES
('admin', 'admin@example.com', 'Администратор системы', '$2y$10$NlZPCfyUg20ctZKUJ.n/s.gQzIE50A8hrChmBjjjAg3RKrOt/GIJW', 'admin', 'approved');

INSERT INTO departments (name, boss_name, phone, floor) VALUES
('Бытовая техника', 'Иванов И.И.', '+7 (900) 111-22-33', 1),
('Электроника', 'Петров П.П.', '+7 (900) 222-33-44', 2),
('Товары для дома', 'Сидорова А.А.', '+7 (900) 333-44-55', 3),
('Компьютерная техника', 'Кузнецов Д.С.', '+7 (900) 444-55-66', 2),
('Мелкая электроника', 'Орлова Н.В.', '+7 (900) 555-66-77', 1);

INSERT INTO products (name, supplier, retail_price, arrival_date, department_id) VALUES
('Чайник электрический', 'ООО ТехСнаб', 2990.00, '2026-03-20', 1),
('Смартфон X100', 'АО МобайлТрейд', 25990.00, '2026-03-22', 2),
('Пылесос Turbo', 'ООО ДомТехника', 8990.00, '2026-03-24', 1),
('Набор посуды', 'ООО ХозМаркет', 3490.00, '2026-03-25', 3),
('Ноутбук Pro 15', 'АО ТехИмпорт', 69990.00, '2026-03-26', 4),
('Наушники AirBeat', 'ООО СаундТрейд', 4990.00, '2026-03-27', 5),
('Микроволновка HeatUp', 'ООО ДомТехника', 9990.00, '2026-03-28', 1),
('Монитор 27"', 'АО ТехИмпорт', 17990.00, '2026-03-29', 4);

INSERT INTO sales (product_id, quantity, retail_price, sale_date) VALUES
(1, 5, 2990.00, '2026-03-26'),
(2, 3, 25990.00, '2026-03-27'),
(3, 2, 8990.00, '2026-03-28'),
(4, 4, 3490.00, '2026-03-29'),
(5, 2, 69990.00, '2026-04-01'),
(6, 6, 4990.00, '2026-04-02'),
(7, 3, 9990.00, '2026-04-03'),
(8, 2, 17990.00, '2026-04-04'),
(2, 1, 25490.00, '2026-04-05'),
(1, 4, 2890.00, '2026-04-06');

CREATE OR REPLACE VIEW v_report_profit AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  SUM(s.quantity) AS total_quantity,
  ROUND(SUM(p.retail_price * s.quantity), 2) AS total_revenue
FROM sales s
JOIN products p ON p.id = s.product_id
GROUP BY p.id, p.name
ORDER BY p.name;
