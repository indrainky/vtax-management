# v-tax Management V1.4 - Dokumentasi Lengkap

## 📋 Daftar Isi

1. [Informasi Umum](#informasi-umum)
2. [Fitur Utama](#fitur-utama)
3. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
4. [Struktur Database](#struktur-database)
5. [Instalasi dan Setup](#instalasi-dan-setup)
6. [Panduan Penggunaan](#panduan-penggunaan)
7. [API Endpoints](#api-endpoints)
8. [Changelog](#changelog)

---

## 📌 Informasi Umum

**Nama Aplikasi:** v-tax Management (CSM)  
**Versi:** 1.4.0  
**Tipe:** Aplikasi Web Internal  
**Tujuan:** Aplikasi web internal untuk memusatkan data klien, melacak produk/jasa yang telah dibeli (aplikasi, add-ons, H2H), memonitor siklus kontrak tahunan, dan mengelola tugas harian (todo list & catatan).

---

## ✨ Fitur Utama

### 1. Manajemen Master Data

#### 1.1 Produk
- ✅ CRUD lengkap untuk produk aplikasi
- ✅ Field: Nama, Harga Default, Deskripsi
- ✅ Tabel dengan sorting dan pagination

#### 1.2 Add-ons
- ✅ CRUD lengkap untuk add-ons
- ✅ Field: Nama, Harga Default, Deskripsi
- ✅ Tabel dengan sorting dan pagination

#### 1.3 Jasa H2H (Host-to-Host)
- ✅ CRUD lengkap untuk jasa H2H
- ✅ Field: Nama, Harga Default, Deskripsi
- ✅ **Fitur Khusus V1.1:** Relasi Many-to-Many dengan Bank
  - Setiap jasa H2H dapat memiliki multiple bank
  - Tabel `banks` untuk master data bank
  - Tabel `h2h_service_banks` sebagai junction table
- ✅ Tabel menampilkan bank-bank yang terhubung sebagai badge

### 2. Manajemen Klien

#### 2.1 CRUD Klien
- ✅ Daftar klien dengan tabel lengkap
- ✅ Form tambah/edit klien dengan field:
  - Nama Klien
  - Kabupaten/Kota
  - Contact Person
  - No. Telepon
  - Alamat
- ✅ Hapus klien dengan konfirmasi

#### 2.2 Halaman Detail Klien
- ✅ **Card Informasi Klien** (V1.2: Full Width Layout) menampilkan:
  - Data dasar klien (kolom kiri)
  - **Tags Produk Terpasang** (badge biru) - area lebih lebar
  - **Tags Add-ons Terpasang** (badge hijau) - area lebih lebar
  - **Tags Jasa H2H Terpasang** (badge ungu) dengan **tombol edit** - area lebih lebar
  - **V1.2:** Layout grid internal untuk menampilkan lebih banyak list
- ✅ **Tab Produk:**
  - Daftar produk yang dibeli klien
  - Form tambah produk dengan tahun beli dan harga kesepakatan
  - Hapus produk
- ✅ **Tab Add-ons:**
  - Daftar add-ons yang terpasang
  - Form tambah add-on
  - Hapus add-on
- ✅ **Tab Jasa H2H:**
  - Daftar jasa H2H yang digunakan
  - **Fitur Khusus V1.1:** Form tambah dengan **multi-select bank**
  - **Fitur Khusus V1.1:** Tabel menampilkan bank-bank yang dipilih klien
  - **Fitur Khusus V1.1:** **CRUD lengkap** di tabel:
    - Tombol **Edit** untuk mengubah bank yang dipilih
    - Tombol **Delete** untuk menghapus jasa H2H
  - **Fitur Khusus V1.1:** Edit bank dari card informasi klien (klik badge atau icon pencil)

### 3. Manajemen Kontrak

#### 3.1 Tracking Kontrak
- ✅ Daftar kontrak per klien
- ✅ Form tambah/edit kontrak dengan field:
  - Tahun Kontrak
  - Status (Draft, Review, ACC, Pencairan, Bukti Potongan Pajak)
  - Nilai Kontrak
  - Tanggal Mulai & Selesai
  - Catatan
- ✅ Update status kontrak

### 4. Dashboard

#### 4.1 Statistik
- ✅ Card statistik dengan gradient warna menarik:
  - Total Produk
  - Total Klien
  - Total Kontrak
  - Todo Aktif
- ✅ Animasi hover dan gradient text

#### 4.2 Todo List
- ✅ Quick add form di dashboard
- ✅ Daftar todo terbaru
- ✅ Card dengan gradient background
- ✅ Tandai selesai/belum selesai

#### 4.3 Catatan
- ✅ Quick add form di dashboard
- ✅ Daftar catatan terbaru
- ✅ Card dengan gradient background
- ✅ Edit dan hapus catatan

### 5. Fitur Tambahan

#### 5.1 Authentication
- ✅ Clerk authentication terintegrasi
- ✅ Middleware protection untuk semua route
- ✅ UserButton di sidebar untuk logout

#### 5.2 Dark Mode
- ✅ Toggle dark/light mode di sidebar
- ✅ System preference detection
- ✅ Persist theme preference

#### 5.3 UI/UX
- ✅ Responsive design
- ✅ shadcn/ui components
- ✅ Toast notifications (sonner)
- ✅ Loading states
- ✅ Error handling

---

## 🛠 Teknologi yang Digunakan

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Theme:** next-themes

### Backend
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **ORM:** Supabase Client

### Database
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)** enabled
- **Migrations** untuk version control

---

## 🗄 Struktur Database

### Tabel Master Data

#### `products`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- default_price (NUMERIC(15,2))
- description (TEXT)
- created_at, updated_at
```

#### `addons`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- default_price (NUMERIC(15,2))
- description (TEXT)
- created_at, updated_at
```

#### `h2h_services`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- default_price (NUMERIC(15,2))
- description (TEXT)
- created_at, updated_at
```

#### `banks` (V1.1)
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255) UNIQUE)
- created_at, updated_at
```

#### `h2h_service_banks` (V1.1)
```sql
- id (SERIAL PRIMARY KEY)
- h2h_service_id (INT) -> h2h_services(id)
- bank_id (INT) -> banks(id)
- created_at
- UNIQUE(h2h_service_id, bank_id)
```

### Tabel Klien

#### `clients`
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR(255))
- regency (VARCHAR(255))
- contact_person (VARCHAR(255))
- contact_phone (VARCHAR(50))
- address (TEXT)
- created_at, updated_at
```

#### `client_products`
```sql
- id (SERIAL PRIMARY KEY)
- client_id (INT) -> clients(id)
- product_id (INT) -> products(id)
- purchase_year (INT)
- purchase_price (NUMERIC(15,2))
- created_at
- UNIQUE(client_id, product_id, purchase_year)
```

#### `client_addons`
```sql
- id (SERIAL PRIMARY KEY)
- client_id (INT) -> clients(id)
- addon_id (INT) -> addons(id)
- assigned_at (DATE)
- UNIQUE(client_id, addon_id)
```

#### `client_h2h`
```sql
- id (SERIAL PRIMARY KEY)
- client_id (INT) -> clients(id)
- h2h_service_id (INT) -> h2h_services(id)
- assigned_at (DATE)
- UNIQUE(client_id, h2h_service_id)
```

#### `client_h2h_banks` (V1.1)
```sql
- id (SERIAL PRIMARY KEY)
- client_h2h_id (INT) -> client_h2h(id)
- bank_id (INT) -> banks(id)
- created_at
- UNIQUE(client_h2h_id, bank_id)
```

### Tabel Kontrak

#### `contracts`
```sql
- id (SERIAL PRIMARY KEY)
- client_id (INT) -> clients(id)
- contract_year (INT)
- status (ENUM: Draft, Review, ACC, Pencairan, Bukti Potongan Pajak)
- contract_value (NUMERIC(15,2))
- notes (TEXT)
- start_date (DATE)
- end_date (DATE)
- updated_at
- UNIQUE(client_id, contract_year)
```

### Tabel Utilitas

#### `todos`
```sql
- id (SERIAL PRIMARY KEY)
- task (TEXT)
- is_completed (BOOLEAN)
- due_date (DATE)
- created_at
```

#### `notes`
```sql
- id (SERIAL PRIMARY KEY)
- title (VARCHAR(255))
- content (TEXT)
- created_at, updated_at
```

---

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Akun Clerk
- Akun Supabase

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone <repository-url>
cd vtax-management
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
Buat file `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup Supabase**
   - Buat project di Supabase
   - Jalankan migrations di folder `supabase/migrations/` secara berurutan:
     - `001_example_tables_with_rls.sql`
     - `002_vtax_management_tables.sql`
     - `003_add_bank_name_to_h2h_services.sql` (opsional, sudah dihapus di V1.1)
     - `004_h2h_banks_relation.sql`
     - `005_client_h2h_banks.sql`

5. **Setup Clerk**
   - Buat aplikasi di Clerk Dashboard
   - Copy API keys ke `.env.local`
   - Integrasikan dengan Supabase (lihat `SUPABASE_CLERK_SETUP.md`)

6. **Run Development Server**
```bash
npm run dev
```

7. **Build untuk Production**
```bash
npm run build
npm start
```

---

## 📖 Panduan Penggunaan

### 1. Setup Master Data

#### Menambah Produk
1. Buka menu **Master Data** > **Produk**
2. Klik **Tambah Produk**
3. Isi form: Nama, Harga Default, Deskripsi
4. Klik **Simpan**

#### Menambah Add-ons
1. Buka menu **Master Data** > **Add-ons**
2. Klik **Tambah Add-on**
3. Isi form: Nama, Harga Default, Deskripsi
4. Klik **Simpan**

#### Menambah Jasa H2H dengan Bank (V1.1)
1. Buka menu **Master Data** > **Jasa H2H**
2. Klik **Tambah Jasa H2H**
3. Isi form: Nama, Harga Default, Deskripsi
4. **Pilih Bank:**
   - Centang bank-bank yang tersedia
   - Atau tambah bank baru dengan input "Tambah Bank Baru"
5. Klik **Simpan**

### 2. Manajemen Klien

#### Menambah Klien Baru
1. Buka menu **Klien**
2. Klik **Tambah Klien**
3. Isi form lengkap
4. Klik **Simpan**

#### Menambah Produk ke Klien
1. Buka **Detail Klien**
2. Tab **Produk** > **Tambah Produk**
3. Pilih produk, isi tahun beli dan harga kesepakatan
4. Klik **Tambah**

#### Menambah Jasa H2H ke Klien dengan Bank (V1.1)
1. Buka **Detail Klien**
2. Tab **Jasa H2H** > **Tambah Jasa H2H**
3. Pilih jasa H2H
4. **Pilih Bank yang Digunakan Klien:**
   - Centang bank-bank yang digunakan klien untuk jasa H2H ini
   - Setiap klien bisa memilih bank berbeda untuk jasa H2H yang sama
5. Klik **Tambah**

#### Edit Bank untuk Jasa H2H (V1.1)
**Dari Card Informasi Klien:**
1. Di card "Informasi Klien", bagian "Jasa H2H Terpasang"
2. Klik badge jasa H2H atau icon pencil
3. Dialog edit akan terbuka
4. Centang/uncentang bank yang digunakan
5. Klik **Simpan**

**Dari Tabel Jasa H2H:**
1. Di tab **Jasa H2H**, kolom **Aksi**
2. Klik icon **Edit** (pencil)
3. Dialog edit akan terbuka
4. Centang/uncentang bank yang digunakan
5. Klik **Simpan**

### 3. Dashboard

#### Menggunakan Todo List
1. Di dashboard, bagian **Todo List**
2. Input task di form quick add
3. Klik **Tambah**
4. Todo akan muncul di list
5. Centang untuk menandai selesai

#### Menggunakan Catatan
1. Di dashboard, bagian **Catatan**
2. Input judul dan konten di form quick add
3. Klik **Tambah**
4. Catatan akan muncul di list

---

## 🔌 API Endpoints

### Master Data

#### Products
- `GET /api/products` - Daftar semua produk
- `POST /api/products` - Tambah produk
- `PUT /api/products/[id]` - Update produk
- `DELETE /api/products/[id]` - Hapus produk

#### Addons
- `GET /api/addons` - Daftar semua add-ons
- `POST /api/addons` - Tambah add-on
- `PUT /api/addons/[id]` - Update add-on
- `DELETE /api/addons/[id]` - Hapus add-on

#### H2H Services
- `GET /api/h2h-services` - Daftar semua jasa H2H (dengan banks)
- `POST /api/h2h-services` - Tambah jasa H2H
- `PUT /api/h2h-services/[id]` - Update jasa H2H
- `DELETE /api/h2h-services/[id]` - Hapus jasa H2H

#### Banks (V1.1)
- `GET /api/banks` - Daftar semua bank
- `POST /api/banks` - Tambah bank
- `GET /api/h2h-services/[id]/banks` - Daftar bank untuk jasa H2H
- `POST /api/h2h-services/[id]/banks` - Tambah bank ke jasa H2H
- `DELETE /api/h2h-services/[id]/banks/[bankId]` - Hapus bank dari jasa H2H

### Klien

#### Clients
- `GET /api/clients` - Daftar semua klien
- `GET /api/clients/[id]` - Detail klien
- `POST /api/clients` - Tambah klien
- `PUT /api/clients/[id]` - Update klien
- `DELETE /api/clients/[id]` - Hapus klien

#### Client Products
- `GET /api/clients/[id]/products` - Daftar produk klien
- `POST /api/clients/[id]/products` - Tambah produk ke klien
- `DELETE /api/clients/[id]/products/[productId]` - Hapus produk dari klien

#### Client Addons
- `GET /api/clients/[id]/addons` - Daftar add-ons klien
- `POST /api/clients/[id]/addons` - Tambah add-on ke klien
- `DELETE /api/clients/[id]/addons/[addonId]` - Hapus add-on dari klien

#### Client H2H (V1.1)
- `GET /api/clients/[id]/h2h` - Daftar jasa H2H klien (dengan banks yang dipilih)
- `POST /api/clients/[id]/h2h` - Tambah jasa H2H ke klien (dengan bank_ids)
- `DELETE /api/clients/[id]/h2h/[h2hId]` - Hapus jasa H2H dari klien
- `PUT /api/clients/[id]/h2h/[h2hId]/banks` - Update bank yang dipilih klien

### Kontrak

#### Contracts
- `GET /api/contracts` - Daftar semua kontrak
- `GET /api/contracts/[id]` - Detail kontrak
- `POST /api/contracts` - Tambah kontrak
- `PUT /api/contracts/[id]` - Update kontrak
- `DELETE /api/contracts/[id]` - Hapus kontrak

### Utilitas

#### Todos
- `GET /api/todos` - Daftar semua todo
- `POST /api/todos` - Tambah todo
- `PUT /api/todos/[id]` - Update todo
- `DELETE /api/todos/[id]` - Hapus todo

#### Notes
- `GET /api/notes` - Daftar semua catatan
- `POST /api/notes` - Tambah catatan
- `PUT /api/notes/[id]` - Update catatan
- `DELETE /api/notes/[id]` - Hapus catatan

#### Dashboard
- `GET /api/dashboard/stats` - Statistik dashboard

---

## 📝 Changelog

### V1.4.0 (Latest)

#### Medium Priority (Value Add) Features
- **Dashboard Analytics dengan Charts**: Pie Chart distribusi status kontrak, Bar Chart kontrak per tahun, produk terlaris, dan klien per kabupaten/kota dengan warna berbeda per kolom
- **Notes per Klien**: Tab catatan di detail klien dengan CRUD lengkap, notes dapat global atau client-specific
- **Activity Timeline per Klien**: Timeline visual dengan tracking otomatis untuk semua aktivitas klien (kontrak, produk, add-ons, H2H, notes, client info)

### V1.3.0

#### Quick Wins - High Priority Features
- **Refactor Code Reusability**: `formatCurrency` dan `statusColors` dipindahkan ke utility functions
- **Pagination**: Pagination di semua tabel (Klien, Kontrak, Produk) dengan hook `usePagination`
- **Global Search**: Pencarian global di seluruh aplikasi dengan shortcut Ctrl+K
- **Export Data**: Export ke CSV dan Excel untuk data klien dan kontrak
- **Notifikasi Kontrak**: Card alert di dashboard untuk kontrak yang akan berakhir dalam 30 hari
- **Tab Kontrak di Detail Klien**: Menampilkan status kontrak dengan badge berwarna

### V1.2.0

#### Layout Improvement - Card Informasi Klien
- Card informasi klien sekarang full width
- Layout grid internal (1 kolom info dasar, 3 kolom untuk tags)
- List produk, add-ons, jasa H2H terlihat lebih banyak
- Responsive design: mobile 1 kolom, tablet 2 kolom, desktop 4 kolom

### V1.1.0

### Fitur Baru

1. **Relasi Many-to-Many Bank dengan Jasa H2H**
   - Tabel `banks` untuk master data bank
   - Tabel `h2h_service_banks` untuk relasi jasa H2H dengan bank
   - Setiap jasa H2H dapat memiliki multiple bank
   - Form master data jasa H2H dengan multi-select bank

2. **Bank per Klien per Jasa H2H**
   - Tabel `client_h2h_banks` untuk menyimpan bank yang dipilih klien
   - Setiap klien dapat memilih bank berbeda untuk jasa H2H yang sama
   - Form tambah jasa H2H ke klien dengan checkbox bank

3. **CRUD Lengkap untuk Jasa H2H di Klien**
   - Tombol Edit di tabel jasa H2H
   - Dialog edit untuk mengubah bank yang dipilih
   - Edit dari card informasi klien (badge + icon pencil)

4. **UI Enhancement**
   - Badge dengan warna berbeda untuk produk (biru), add-ons (hijau), H2H (ungu)
   - Gradient cards di dashboard
   - Hover effects dan animasi

### Perbaikan

1. **Database Schema**
   - Migration `004_h2h_banks_relation.sql` - Refactor bank menjadi relasi many-to-many
   - Migration `005_client_h2h_banks.sql` - Tabel untuk bank per klien

2. **API Improvements**
   - GET client H2H sekarang fetch bank yang dipilih klien
   - POST client H2H menerima `bank_ids` array
   - PUT endpoint baru untuk update bank yang dipilih

3. **User Experience**
   - Badge jasa H2H di card informasi klien bisa diklik untuk edit
   - Tombol edit di tabel lebih jelas
   - Dialog edit dengan checkbox yang user-friendly

### Breaking Changes

- Tidak ada breaking changes. Semua perubahan backward compatible.

---

## 🎯 Versi Sempurna (Baseline)

Versi V1.1 ditandai sebagai **"Versi Sempurna"** dan akan digunakan sebagai baseline untuk perubahan di masa depan. Jika diminta kembali ke "mode sempurna", yang dimaksud adalah versi V1.1.

### Fitur yang Sudah Sempurna:
- ✅ Database migration lengkap
- ✅ Master Data: Products, Addons, H2H Services (dengan multiple banks)
- ✅ Manajemen Klien: List, Detail, CRUD, dengan tags produk/addons/H2H
- ✅ Manajemen Kontrak: dengan status management
- ✅ Todo List & Catatan: dengan quick add di dashboard
- ✅ Dashboard: dengan statistik dan quick access todo/notes
- ✅ Dark mode: sudah terintegrasi dengan toggle di sidebar
- ✅ UserButton: untuk logout di sidebar
- ✅ Warna menarik: gradient pada card-card di dashboard
- ✅ Navigation: sidebar dengan semua modul
- ✅ **V1.1:** Bank per klien per jasa H2H dengan CRUD lengkap

---

## 📞 Support

Untuk pertanyaan atau bantuan, silakan hubungi tim development.

---

**© 2024 v-tax Management V1.4**

