Ringkasan Aplikasi
Nama Ide: "v-tax Management" (CSM)

Tujuan: Aplikasi web internal untuk memusatkan data klien, melacak produk/jasa yang telah dibeli (aplikasi, add-ons, H2H), memonitor siklus kontrak tahunan, dan mengelola tugas harian (todo list & catatan).

Stack Teknologi (Saran):

Backend: Node.js (Express), Python (Django/Flask), atau PHP (Laravel)

Frontend: React, Vue, or Svelte

Database: PostgreSQL (sesuai permintaan Anda)

Fitur Utama
Aplikasi Anda akan dibagi menjadi beberapa modul utama:

1. Manajemen Master Data
Modul ini adalah "kamus" dari semua yang Anda jual.

CRUD Produk: Mengelola daftar produk aplikasi (Nama Aplikasi, Harga Default).

CRUD Add-ons: Mengelola daftar add-ons (Nama Add-on, Harga Default).

CRUD Jasa H2H: Mengelola daftar layanan Payment Host-to-Host (Nama Layanan, Harga Default).

2. Manajemen Klien
Ini adalah inti dari aplikasi Anda.

CRUD Klien: Input, edit, hapus data klien (Nama Klien, Kabupaten/Kota, Info Kontak, dll.).

Halaman Detail Klien: Tampilan terpusat yang menunjukkan:

Info dasar klien.

Daftar produk yang sudah dibeli (beserta tahun beli dan harga kesepakatan).

Daftar add-ons yang terpasang.

Daftar layanan H2H yang digunakan.

Riwayat dan status kontrak tahunan.

3. Manajemen Kontrak
Modul khusus untuk melacak lifecycle kontrak tahunan per klien.

Tracking Kontrak: Untuk setiap klien, Anda bisa menambahkan data kontrak tahunan (misal "Kontrak 2024").

Manajemen Status: Mengubah status kontrak tersebut sesuai alur:

Draft

Review

ACC

Pencairan

Bukti Potongan Pajak (Diserahkan)

4. Modul Utilitas
Alat bantu harian untuk Anda.

Todo List: Daftar tugas global (apa yang harus dikerjakan hari ini/minggu ini).

Catatan: Tempat untuk menyimpan catatan/memo penting (misal: credentials sementara, catatan rapat, dll).

Alur Aplikasi (User Flow)
Alur penggunaan aplikasi Anda akan terlihat seperti ini:

Inisiasi (Setup Awal):

Anda (admin) masuk ke modul Manajemen Master Data.

Anda menginput semua Produk (misal: "Aplikasi SIMRS", "Aplikasi Kepegawaian"), Add-ons (misal: "Modul E-Resep", "Modul Antrean Online"), dan Jasa H2H (misal: "Integrasi BPJS", "Integrasi Bank") beserta harga defaultnya.

Menambah Klien Baru:

Klien baru (misal: "RS Harapan Kita") tertarik.

Anda masuk ke modul Manajemen Klien -> "Tambah Klien Baru".

Anda menginput: Nama Klien ("RS Harapan Kita"), Kabupaten ("Kab. Sikka").

Mencatat Penjualan (Assign Produk):

RS Harapan Kita membeli "Aplikasi SIMRS".

Anda masuk ke Detail Klien "RS Harapan Kita".

Di bagian "Produk Dibeli", Anda klik "Tambah Produk".

Anda memilih "Aplikasi SIMRS" dari dropdown (yang diambil dari Master Data).

Anda menginput Tahun Beli (misal: 2023) dan Harga Beli (misal: 50.000.000, mungkin berbeda dari harga default).

Anda juga menambahkan Add-ons "Modul E-Resep" dan Jasa H2H "Integrasi BPJS" ke klien tersebut.

Memantau Kontrak (Lifecycle):

Sekarang waktunya perpanjangan kontrak untuk tahun 2024.

Anda masuk ke Detail Klien "RS Harapan Kita" -> "Manajemen Kontrak".

Anda klik "Tambah Kontrak Baru", pilih Tahun: 2024.

Status awal kontrak adalah Draft.

Saat Anda mengirim penawaran, Anda ubah statusnya ke Review.

Setelah klien setuju, Anda ubah ke ACC.

Saat klien sudah membayar, Anda ubah ke Pencairan.

Setelah klien mengirim bukti potong PPh, Anda ubah ke Bukti Potongan Pajak.

Penggunaan Harian:

Anda membuka modul Todo List untuk melihat apa yang harus dikerjakan (misal: "Follow up kontrak RS Harapan Kita").

Anda membuka Catatan untuk menyimpan info IP Server klien.

Skema Database (PostgreSQL)
Berikut adalah skema database (DDL) sederhana untuk PostgreSQL yang mencakup semua kebutuhan Anda.

SQL

-- Mengaktifkan ekstensi jika Anda ingin menggunakan UUID (opsional, SERIAL sudah cukup)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------
-- TABEL MASTER (PRODUK & JASA)
-- ---------------------------------

-- Tabel untuk produk aplikasi utama Anda
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk add-ons
CREATE TABLE addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk jasa H2H (Host-to-Host)
CREATE TABLE h2h_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------
-- TABEL KLIEN
-- ---------------------------------

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    regency VARCHAR(255), -- Kabupaten
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------
-- TABEL RELASI (PENGHUBUNG)
-- ---------------------------------

-- Tabel ini mencatat produk apa saja yang dibeli klien (history pembelian)
CREATE TABLE client_products (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    purchase_year INT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL, -- Harga kesepakatan saat itu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Memastikan 1 klien tidak membeli produk yang sama di tahun yang sama (opsional)
    UNIQUE(client_id, product_id, purchase_year)
);

-- Tabel penghubung add-ons yang dimiliki klien
CREATE TABLE client_addons (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    addon_id INT NOT NULL REFERENCES addons(id) ON DELETE RESTRICT,
    assigned_at DATE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, addon_id)
);

-- Tabel penghubung jasa H2H yang dimiliki klien
CREATE TABLE client_h2h (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    h2h_service_id INT NOT NULL REFERENCES h2h_services(id) ON DELETE RESTRICT,
    assigned_at DATE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, h2h_service_id)
);


-- ---------------------------------
-- TABEL KONTRAK
-- ---------------------------------

-- Kita buat tipe data ENUM untuk status kontrak agar konsisten
CREATE TYPE contract_status AS ENUM (
    'Draft',
    'Review',
    'ACC',
    'Pencairan',
    'Bukti Potongan Pajak'
);

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_year INT NOT NULL,
    status contract_status DEFAULT 'Draft',
    contract_value NUMERIC(15, 2),
    notes TEXT,
    start_date DATE,
    end_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Satu klien hanya punya satu data kontrak per tahun
    UNIQUE(client_id, contract_year)
);

-- ---------------------------------
-- TABEL UTILITAS
-- ---------------------------------

CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    -- Anda bisa tambahkan relasi ke klien jika catatan bersifat spesifik per klien
    -- client_id INT REFERENCES clients(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);