-- Database: market_biru
-- SMKN 11 Bandung - Koperasi Siswa Market Biru
-- Import file ini ke Laragon (HeidiSQL atau phpMyAdmin)

CREATE DATABASE IF NOT EXISTS `market_biru` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `market_biru`;

-- 1. Tabel Users (Admin, Petugas, Kasir, Siswa)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'petugas', 'kasir', 'siswa') DEFAULT 'siswa',
  `nisn` VARCHAR(30) NULL,
  `student_class` VARCHAR(50) NULL,
  `whatsapp` VARCHAR(30) NULL,
  `avatar` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `icon` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `category_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `price` DECIMAL(12, 2) NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NULL,
  `unit` VARCHAR(30) DEFAULT 'pcs',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `order_code` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `student_name` VARCHAR(100) NOT NULL,
  `student_class` VARCHAR(50) NOT NULL,
  `whatsapp_number` VARCHAR(30) NOT NULL,
  `delivery_method` ENUM('pickup', 'delivery') DEFAULT 'pickup',
  `delivery_fee` DECIMAL(12, 2) DEFAULT 0,
  `delivery_address` TEXT NULL,
  `payment_method` ENUM('cash', 'transfer') DEFAULT 'cash',
  `payment_status` ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  `payment_proof_url` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `total_price` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('pending', 'processing', 'ready_for_pickup', 'delivering', 'completed', 'cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabel Order Items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` VARCHAR(50) PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `price` DECIMAL(12, 2) NOT NULL,
  `quantity` INT NOT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- AKUN RESMI PETUGAS & PERWAKILAN KELAS SISWA SMKN 11 BANDUNG
-- Password default: admin123
-- ============================================================

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `nisn`, `student_class`, `whatsapp`)
VALUES 
-- Pengurus / Petugas Koperasi
(1, 'Administrator Koperasi', 'admin', 'admin@smkn11bdg.sch.id', 'admin123', 'admin', NULL, NULL, '081234567890'),
(2, 'Petugas Kasir Koperasi 11', 'kasir', 'kasir@smkn11bdg.sch.id', 'admin123', 'kasir', NULL, NULL, '081234567891'),

-- Siswa Perwakilan Kelas X & XI Resmi SMKN 11 Bandung
(3, 'Aqila Qisya H.', 'aqila', 'aqila@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061010001', 'X AKL 1', '081200000001'),
(4, 'Alzena Syalwiah', 'alzena', 'alzena@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061010002', 'X AKL 2', '081200000002'),
(5, 'Zahira Khoirunnisa', 'zahira', 'zahira@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061010003', 'X AKL 3', '081200000003'),
(6, 'Ahmad Anugrah Mahesa', 'anugrah', 'anugrah@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061020001', 'X MPLB 1', '081200000004'),
(7, 'Mentari Febriani', 'mentari', 'mentari@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061020002', 'X MPLB 2', '081200000005'),
(8, 'Nadita Marsyagina', 'nadita', 'nadita@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061020003', 'X MPLB 3', '081200000006'),
(9, 'Dara Ramadani', 'dara', 'dara@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061020004', 'X MPLB 4', '081200000007'),
(10, 'Salma Supri Salsabila', 'salma', 'salma@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061020005', 'X MPLB 5', '081200000008'),
(11, 'Keisya Afifah', 'keisya', 'keisya@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061030001', 'X PM 1', '081200000009'),
(12, 'Almaira Putri Ramadhany', 'almaira', 'almaira@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061030002', 'X PM 2', '081200000010'),
(13, 'Selky Aulia Agustin', 'selky', 'selky@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061030003', 'X PM 3', '081200000011'),
(14, 'Nayra Aulia Khoirunnisa', 'nayra', 'nayra@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061040001', 'X PPLG 1', '081200000012'),
(15, 'Khansa Khairunnisa', 'khansa', 'khansa@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061040002', 'X PPLG 2', '081200000013'),
(16, 'Qatrinnada Maswahid', 'qatrinnada', 'qatrinnada@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061050002', 'X DKV 2', '081200000014'),
(17, 'Muhamad Raisa Prayoga', 'raisa', 'raisa@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061060001', 'X TJKT', '081200000015'),
(18, 'Syifa Cinta Aulia', 'syifa', 'syifa@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061110001', 'XI AK 1', '081200000016'),
(19, 'Anggita Dwi Putri', 'anggita', 'anggita@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061110002', 'XI AK 2', '081200000017'),
(20, 'Nurul Aulia Akhwati', 'nurul', 'nurul@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061110003', 'XI AK 3', '081200000018'),
(21, 'Zya Agnia Khoirunnisa', 'zya', 'zya@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061120001', 'XI MP 1', '081200000019'),
(22, 'Melisa', 'melisa', 'melisa@siswa.smkn11bdg.sch.id', 'admin123', 'siswa', '0061120002', 'XI MP 2', '081200000020')

ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `email` = VALUES(`email`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`),
  `student_class` = VALUES(`student_class`),
  `nisn` = VALUES(`nisn`),
  `whatsapp` = VALUES(`whatsapp`);

-- ============================================================
-- KATEGORI PRODUK RESMI
-- ============================================================
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`)
VALUES
('cat-1', 'Seragam & Atribut Resmi', 'seragam-atribut-resmi', 'Topi upacara, dasi, ikat pinggang, dan kaos kaki resmi SMKN 11 Bandung.', 'Tag'),
('cat-2', 'Pakaian & Seragam Sekolah', 'pakaian-seragam-sekolah', 'Jas almamater (almet), baju batik identitas, dan setelan seragam olahraga SMKN 11 Bandung.', 'Shirt')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

-- ============================================================
-- DAFTAR PRODUK KATALOG (7 ITEM RESMI SMKN 11 BANDUNG)
-- ============================================================
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `image`, `unit`, `is_active`)
VALUES
('prod-1', 'cat-1', 'Topi Upacara Bordir SMKN 11 Bandung', 'topi-upacara-bordir-smkn-11-bandung', 'Topi upacara resmi hari Senin warna abu-abu kombinasi biru tua dengan bordir identitas SMKN 11 Bandung. Bagian belakang dilengkapi perekat velcro fleksibel.', 18000.00, 95, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80', 'pcs', 1),
('prod-2', 'cat-1', 'Sabuk / Ikat Pinggang Gesper Logam SMKN 11 Bandung', 'sabuk-ikat-pinggang-gesper-logam-smkn-11-bandung', 'Ikat pinggang sekolah standar tata tertib SMKN 11 Bandung dengan kepala gesper kuningan timbul logo sekolah, tali nylon hitam tebal awet.', 20000.00, 85, 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80', 'pcs', 1),
('prod-3', 'cat-1', 'Dasi Abu-Abu Resmi SMKN 11 Bandung (Bordir Logo)', 'dasi-abu-abu-resmi-smkn-11-bandung', 'Dasi sekolah resmi warna abu-abu SMA/SMK dengan bordir komputer emblem logo SMKN 11 Bandung. Bahan twist halus, rapi, dan mudah disetrika.', 15000.00, 120, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', 'pcs', 1),
('prod-4', 'cat-1', 'Kaos Kaki Putih Telapak Hitam Bordir SMKN 11', 'kaos-kaki-putih-telapak-hitam-smkn-11', 'Kaos kaki panjang di atas mata kaki standar tata tertib sekolah, terdapat rajutan logo SMKN 11 Bandung di samping. Bahan katun PE tebal dan menyerap keringat.', 15000.00, 100, 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80', 'pasang', 1),
('prod-5', 'cat-2', 'Jas Almamater (Almet) Resmi SMKN 11 Bandung', 'jas-almamater-almet-resmi-smkn-11-bandung', 'Jas almamater (almet) resmi SMKN 11 Bandung warna biru khas dengan bordir logo sekolah di dada kiri dan kancing timbul berlogo.', 135000.00, 75, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', 'pcs', 1),
('prod-6', 'cat-2', 'Baju Batik Khas SMKN 11 Bandung', 'baju-batik-khas-smkn-11-bandung', 'Kain batik motif resmi identitas SMKN 11 Bandung untuk seragam hari Kamis dan Jumat. Bahan katun sanforized adem dan nyaman.', 85000.00, 80, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'pcs', 1),
('prod-7', 'cat-2', 'Setelan Seragam Olahraga SMKN 11 Bandung', 'setelan-seragam-olahraga-smkn-11-bandung', 'Setelan kaos olahraga lengan pendek dan celana training resmi SMKN 11 Bandung. Bahan elastis, adem, dan menyerap keringat dengan baik.', 95000.00, 80, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 'set', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `price` = VALUES(`price`), `stock` = VALUES(`stock`), `unit` = VALUES(`unit`);

