# Bengkel Gemilang Sakti - Sistem Manajemen Bengkel Motor

Aplikasi Bengkel Gemilang Sakti adalah sistem informasi manajemen terpadu (Full-Stack) untuk operasional bengkel motor, mencakup manajemen data master, inventaris, transaksi layanan (servis, penjualan, pembelian), hingga penggajian karyawan dan pembuatan laporan.

Aplikasi ini dibangun menggunakan arsitektur modern:

- **Frontend:** React (Vite)
- **Backend:** Express.js (Node.js)
- **Database:** MySQL

---

## Persiapan Instalasi (Prasyarat)

Pastikan sistem komputer Anda telah terinstal:

1.  **Node.js** (Versi 20.19.0 atau lebih baru direkomendasikan).
2.  **MySQL Server** (XAMPP, WAMP, atau MySQL installer mandiri).
3.  **Git** (Opsional, untuk _version control_).

---

## Panduan Instalasi & Penggunaan

### 1. Setup Database

1. Buka aplikasi **MySQL / phpMyAdmin** (Jika menggunakan XAMPP, pastikan modul MySQL berjalan).
2. Buat database baru bernama `bengkel_gemilang` (atau jalankan script otomatis).
3. Import file `database.sql` yang berada di folder `backend/` ke dalam database `bengkel_gemilang`. File ini akan otomatis membuat semua tabel yang dibutuhkan beserta _dummy data_ (seeders) awal.

### 2. Menjalankan Backend (Server)

1. Buka terminal (Command Prompt / PowerShell).
2. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
3. Install dependensi (hanya perlu dilakukan pertama kali):
   ```bash
   npm install
   ```
4. Pastikan file `.env` sudah ada dan sesuai. Jika tidak ada, Anda bisa membuat file `.env` baru dengan isi:
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=bengkel_gemilang
   JWT_SECRET=rahasia_bengkel_super_aman
   ```
5. Jalankan server:
   ```bash
   npm run dev
   ```
   _(Server akan berjalan pada `http://localhost:8080`)_

### 3. Menjalankan Frontend (Aplikasi Web)

1. Buka tab terminal baru.
2. Masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
3. Install dependensi (hanya perlu dilakukan pertama kali):
   ```bash
   npm install
   ```
4. Jalankan aplikasi web:
   ```bash
   npm run dev
   ```
   _(Aplikasi akan terbuka pada `http://localhost:5173`)_

---

## Panduan Login (Default)

Data ini telah diisi secara otomatis jika Anda meng-import `database.sql`:

- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin (memiliki akses penuh ke seluruh menu)

---

## Fitur-Fitur Utama Aplikasi

1.  **Dashboard:** Ringkasan statistik performa bengkel (Pendapatan, Jumlah Servis, Stok Tipis, dll).
2.  **Data Master:**
    - **Sparepart & Stok:** Manajemen data suku cadang.
    - **Supplier:** Manajemen data pemasok barang.
    - **Customer & Motor:** Data pelanggan dan kendaraan motor.
    - **Karyawan:** Data staf/montir beserta gaji pokok.
3.  **Transaksi:**
    - **Pembelian:** Mencatat stok barang masuk dari Supplier.
    - **Penjualan (Langsung):** Mencatat penjualan sparepart tanpa servis.
    - **Service Motor:** Proses registrasi pelanggan servis, penugasan mekanik, dan tagihan (invoice) otomatis.
4.  **Manajemen & HR:**
    - **Payroll (Penggajian):** Penghitungan gaji karyawan dan mekanik (Gaji Pokok + Komisi jika ada).
    - **Laporan (Report):** Cetak ringkasan, laporan layanan harian, dll.

---

## Hak Cipta & Dukungan

Dikembangkan khusus untuk kebutuhan operasional **Bengkel Gemilang Sakti**.
Jika mengalami kendala pada _port conflict_ (misalnya 8080 sudah digunakan), ubah port di file `backend/.env` dan sesuaikan koneksi Axios di file `frontend/src/api/axios.js`.
