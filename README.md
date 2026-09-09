# Market Biru - Koperasi SMKN 11 Bandung (Next.js 14)

Aplikasi Web E-Commerce Koperasi Resmi **SMK Negeri 11 Kota Bandung** berbasis **Next.js 14 (App Router, Tailwind CSS, TypeScript, Zustand, Lucide Icons, QR Code Scanner & Generator)**.

---

## 🌟 Fitur Unggulan

1. **Beranda & Etalase Koperasi (`/`)**:
   - Hero banner identitas SMKN 11 Bandung.
   - Quick category tabs & pencarian instan.
   - Highlight seragam jurusan & wearpack RPL, TKJ, DKV.
   - Tutorial 3 langkah belanja bebas antre.
2. **Katalog Produk Lengkap (`/katalog`)**:
   - Filter per kategori produk sekolah.
   - Pencarian real-time & filter barang ready stock.
   - Sorting harga termurah, termahal, dan abjad.
3. **Detail Produk & Variasi Ukuran (`/produk/[slug]`)**:
   - Foto produk jernih & detail spesifikasi.
   - Pemilihan ukuran seragam (S, M, L, XL, XXL).
   - Indikator stok real-time & rekomendasi produk terkait.
4. **Keranjang Belanja (`/keranjang`)**:
   - Pengaturan jumlah beli, estimasi harga subtotal, dan penyimpanan otomatis (localStorage).
5. **Checkout Terpadu (`/checkout`)**:
   - Pilihan: **Ambil di Koperasi** (Gratis) atau **Diantar ke Kelas** (+ Rp 2.000).
   - Metode Bayar: **QRIS Dinamis Otomatis** & **Tunai di Kasir**.
6. **Nota Digital Interaktif (`/nota/[orderCode]`)**:
   - QR Code barcode pesanan untuk di-scan oleh petugas kasir.
   - Rincian belanja, status pesanan real-time, dan tombol print/download nota.
7. **Lacak Pesanan Mandiri (`/lacak-pesanan`)**:
   - Pencarian nota berdasarkan kode pesanan atau nomor WhatsApp siswa.
8. **Admin Panel & Sistem Autentikasi (`/admin/...`)**:
   - `/admin/login`: Halaman login petugas admin & kasir terproteksi.
   - `/admin/dashboard`: Ringkasan omset & statistik pesanan.
   - `/admin/orders`: Manajemen & perubahan status pesanan.
   - `/admin/products`: Inventaris barang & penambahan stok.
   - `/admin/scan`: **Kamera QR Scanner** untuk verifikasi dan serah terima barang siswa langsung di kasir.
9. **Mobile First UI**:
   - Dilengkapi *Floating Bottom Navigation Bar* di tampilan smartphone untuk pengalaman belanja layaknya aplikasi mobile native.

---

## 🗄️ Konfigurasi Database MySQL (Laragon)

1. **Jalankan Laragon**: Buka Laragon dan klik **Start All** (MySQL port 3306).
2. **Import Database**:
   - Buka **HeidiSQL** / **phpMyAdmin** dari Laragon.
   - Buka file `database.sql` yang ada di root project ini.
   - Jalankan query SQL tersebut untuk membuat database `market_biru` beserta tabel dan data awal.
3. **Akun Login Bawaan (Default)**:
   - **Admin Utama**: Username `admin` / Password `admin123`
   - **Petugas Kasir**: Username `kasir` / Password `admin123`

---

## 🚀 Cara Menjalankan

### 1. Mode Development:
```bash
npm run dev
```
Akses di browser:
- Toko Siswa: `http://localhost:3000`
- Portal Admin: `http://localhost:3000/admin/login`

### 2. Testing di Handphone via VS Code Ports:
1. Buka panel **Ports** di VS Code.
2. Forward port **`3000`**.
3. Set **Port Visibility** ke **Public**.
4. Buka URL HTTPS yang diberikan di browser HP.

### 3. Build & Deploy:
```bash
npm run build
```
Siap dideploy langsung ke [Vercel](https://vercel.com) hanya dengan menghubungkan repository GitHub ini.

