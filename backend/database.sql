CREATE DATABASE IF NOT EXISTS bengkel_gemilang;
USE bengkel_gemilang;

-- Drop tables if they exist to avoid conflict
DROP TABLE IF EXISTS payroll_details;
DROP TABLE IF EXISTS payrolls;
DROP TABLE IF EXISTS sale_details;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS purchase_details;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS service_details;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS motorcycles;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS spareparts;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE spareparts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    supplier_id INT NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    sell_price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE motorcycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    police_no VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    customer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(50) NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(20) UNIQUE NOT NULL,
    motorcycle_id INT NOT NULL,
    mechanic_id INT,
    status ENUM('Menunggu', 'Proses', 'Selesai') DEFAULT 'Menunggu',
    complaint TEXT,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE service_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    sparepart_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (sparepart_id) REFERENCES spareparts(id) ON DELETE RESTRICT
);

CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT
);

CREATE TABLE purchase_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    sparepart_id INT NOT NULL,
    quantity INT NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
    FOREIGN KEY (sparepart_id) REFERENCES spareparts(id) ON DELETE RESTRICT
);

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE sale_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    sparepart_id INT NOT NULL,
    quantity INT NOT NULL,
    sell_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (sparepart_id) REFERENCES spareparts(id) ON DELETE RESTRICT
);

CREATE TABLE payrolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payroll_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT NOT NULL,
    employee_id INT NOT NULL,
    base_salary DECIMAL(10, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0,
    total_salary DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Seeders
INSERT INTO roles (role_name) VALUES ('Admin'), ('Kasir'), ('Mekanik');
-- Admin: admin123
INSERT INTO users (username, password, role_id) VALUES ('admin', '$2b$10$Cjzj56tUTTghKYXOznWCSeNhLo/BegGPF8diN6N.sUBs/GXN9XgFe', 1);

INSERT INTO suppliers (code, name, address, phone) VALUES 
('SUP-01', 'CV Mitra Jaya', 'Jl. Pasar Rebo No. 12, Jakarta', '021-7891234'),
('SUP-02', 'PT Honda Parts', 'Jl. Gatot Subroto Kav. 9', '021-5221900'),
('SUP-03', 'PT Yuasa Battery', 'Jl. MT. Haryono No. 5', '021-8291122'),
('SUP-04', 'CV Spare Utama', 'Jl. Otista Raya No. 45', '021-3312456');

INSERT INTO spareparts (code, name, supplier_id, buy_price, sell_price, stock) VALUES
('SP-001', 'Oli Mesin Yamalube 1L', 1, 38000, 52000, 145),
('SP-002', 'Filter Oli Honda', 2, 18000, 28000, 87),
('SP-003', 'Busi NGK C6HSA', 1, 12000, 22000, 12),
('SP-004', 'Aki Yuasa 5Ah', 3, 145000, 195000, 23);

INSERT INTO customers (code, name, phone, address) VALUES
('CUST-001', 'Budi Santoso', '081234567890', 'Jl. Merdeka No. 1'),
('CUST-002', 'Rina Amelia', '089876543210', 'Jl. Sudirman No. 12');

INSERT INTO motorcycles (police_no, type, customer_id) VALUES
('B 1234 ABC', 'Vario 125', 1),
('B 5678 DEF', 'Beat 2022', 2);

INSERT INTO employees (code, name, position, base_salary) VALUES
('KRY-001', 'Eko Prasetyo', 'Mekanik', 3000000),
('KRY-002', 'Slamet R.', 'Mekanik', 3000000),
('KRY-003', 'Agus Budi', 'Mekanik', 2800000);

INSERT INTO services (invoice_no, motorcycle_id, mechanic_id, status, complaint, service_fee, total_amount) VALUES
('SV-089', 1, 1, 'Selesai', 'Service Rutin & Ganti Oli', 50000, 102000),
('SV-090', 2, 2, 'Proses', 'Ganti Aki', 25000, 220000);

INSERT INTO service_details (service_id, sparepart_id, quantity, price, subtotal) VALUES
(1, 1, 1, 52000, 52000),
(2, 4, 1, 195000, 195000);
