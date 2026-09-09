import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { hashPassword } from '@/lib/auth';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/data';

export async function POST() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'market_biru';

  let conn;
  try {
    // 1. Connect without selecting database first
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    // 2. Create database
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${dbName}\`;`);

    // 3. Create tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'petugas', 'kasir', 'siswa') DEFAULT 'siswa',
        \`nisn\` VARCHAR(30) NULL,
        \`student_class\` VARCHAR(50) NULL,
        \`whatsapp\` VARCHAR(30) NULL,
        \`avatar\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`slug\` VARCHAR(100) NOT NULL UNIQUE,
        \`description\` TEXT NULL,
        \`icon\` VARCHAR(50) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`products\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`category_id\` VARCHAR(50) NOT NULL,
        \`name\` VARCHAR(150) NOT NULL,
        \`slug\` VARCHAR(150) NOT NULL UNIQUE,
        \`description\` TEXT NULL,
        \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0,
        \`stock\` INT NOT NULL DEFAULT 0,
        \`image\` VARCHAR(255) NULL,
        \`unit\` VARCHAR(30) DEFAULT 'pcs',
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`orders\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`order_code\` VARCHAR(50) NOT NULL UNIQUE,
        \`user_id\` INT NULL,
        \`student_name\` VARCHAR(100) NOT NULL,
        \`student_class\` VARCHAR(50) NOT NULL,
        \`whatsapp_number\` VARCHAR(30) NOT NULL,
        \`delivery_method\` ENUM('pickup', 'delivery') DEFAULT 'pickup',
        \`delivery_fee\` DECIMAL(12, 2) DEFAULT 0,
        \`delivery_address\` TEXT NULL,
        \`payment_method\` ENUM('cash', 'transfer') DEFAULT 'cash',
        \`payment_status\` ENUM('unpaid', 'paid') DEFAULT 'unpaid',
        \`payment_proof_url\` VARCHAR(255) NULL,
        \`notes\` TEXT NULL,
        \`total_price\` DECIMAL(12, 2) NOT NULL,
        \`status\` ENUM('pending', 'processing', 'ready_for_pickup', 'delivering', 'completed', 'cancelled') DEFAULT 'pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`order_items\` (
        \`id\` VARCHAR(50) PRIMARY KEY,
        \`order_id\` VARCHAR(50) NOT NULL,
        \`product_id\` VARCHAR(50) NOT NULL,
        \`product_name\` VARCHAR(150) NOT NULL,
        \`price\` DECIMAL(12, 2) NOT NULL,
        \`quantity\` INT NOT NULL,
        \`subtotal\` DECIMAL(12, 2) NOT NULL,
        FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Seed Default Users
    const defaultPassword = await hashPassword('admin123');
    
    await conn.query(`
      INSERT INTO \`users\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password\`, \`role\`, \`nisn\`, \`student_class\`, \`whatsapp\`)
      VALUES 
      (1, 'Administrator Koperasi', 'admin', 'admin@smkn11bdg.sch.id', ?, 'admin', NULL, NULL, '081234567890'),
      (2, 'Petugas Kasir 11', 'kasir', 'kasir@smkn11bdg.sch.id', ?, 'kasir', NULL, NULL, '081234567891'),
      (3, 'Nayra Aulia Khoirunnisa', 'nayra', 'nayra@smkn11bdg.sch.id', ?, 'siswa', '0061234567', 'X PPLG 1', '081223344556'),
      (4, 'Muhammad Fahri Ismail', 'fahri', 'fahri@smkn11bdg.sch.id', ?, 'siswa', '0069876543', 'XI TKJ', '081399887766')
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `, [defaultPassword, defaultPassword, defaultPassword, defaultPassword]);

    // 5. Seed Categories
    const validCatIds = INITIAL_CATEGORIES.map(c => c.id);
    await conn.query(`DELETE FROM \`categories\` WHERE \`id\` NOT IN (${validCatIds.map(() => '?').join(',')})`, validCatIds);

    for (const cat of INITIAL_CATEGORIES) {
      await conn.query(`
        INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`icon\`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`description\` = VALUES(\`description\`);
      `, [cat.id, cat.name, cat.slug, cat.description || '', cat.icon || 'Tag']);
    }

    // 6. Seed Products
    const validProdIds = INITIAL_PRODUCTS.map(p => p.id);
    await conn.query(`DELETE FROM \`products\` WHERE \`id\` NOT IN (${validProdIds.map(() => '?').join(',')})`, validProdIds);

    for (const p of INITIAL_PRODUCTS) {
      await conn.query(`
        INSERT INTO \`products\` (\`id\`, \`category_id\`, \`name\`, \`slug\`, \`description\`, \`price\`, \`stock\`, \`image\`, \`unit\`, \`is_active\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`), \`price\` = VALUES(\`price\`), \`stock\` = VALUES(\`stock\`), \`category_id\` = VALUES(\`category_id\`), \`unit\` = VALUES(\`unit\`);
      `, [p.id, p.categoryId, p.name, p.slug, p.description || '', p.price, p.stock, p.image || '', p.unit || 'pcs', p.isActive ? 1 : 0]);
    }

    await conn.end();

    return NextResponse.json({
      success: true,
      message: `Database '${dbName}' beserta tabel users, categories, products, orders, dan order_items berhasil diinisialisasi di Laragon!`,
    });
  } catch (error: any) {
    if (conn) await conn.end();
    console.error('Error DB Init:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Gagal inisialisasi database: ${error.message}. Pastikan Laragon MySQL sudah berjalan (Start All).`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
