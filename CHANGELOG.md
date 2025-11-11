# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/id/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [1.4.0] - 2024

### ✨ Fitur Baru

#### Medium Priority (Value Add) Features
- **Dashboard Analytics dengan Charts**
  - API endpoint `/api/dashboard/analytics` untuk data analytics
  - Charts di dashboard:
    - Pie Chart: Distribusi Status Kontrak dengan warna sesuai status
    - Bar Chart: Kontrak per Tahun dengan warna berbeda per bar
    - Horizontal Bar Chart: Produk Terlaris (Top 10) dengan warna berbeda per bar
    - Bar Chart: Klien per Kabupaten/Kota (Top 10) dengan warna berbeda per bar
  - Menggunakan Recharts dengan ChartContainer dari shadcn/ui
  - Color palette dengan 10 warna berbeda untuk setiap kolom/bar
  - Status color map untuk Pie Chart status kontrak

- **Notes per Klien**
  - Migration `006_add_client_id_to_notes.sql` untuk menambahkan kolom `client_id` ke tabel `notes`
  - API endpoint `/api/clients/[id]/notes` untuk CRUD notes per klien
  - Tab "Catatan" di halaman detail klien dengan:
    - Daftar catatan klien
    - Form tambah/edit catatan
    - Hapus catatan
    - Tampilan dengan judul, isi, dan tanggal update
  - Notes dapat global (client_id NULL) atau client-specific (client_id tidak NULL)

- **Activity Timeline per Klien**
  - Migration `007_create_activity_log.sql` untuk tabel `activity_log`
  - API endpoint `/api/clients/[id]/activities` untuk fetch activity timeline
  - Tab "Timeline" di halaman detail klien dengan:
    - Timeline visual dengan icon dan warna berbeda per jenis aktivitas
    - Tracking aktivitas: kontrak, produk, add-ons, H2H, notes, client info
    - Warna berdasarkan jenis aksi: hijau (created/added), biru (updated), merah (deleted/removed)
    - Garis vertikal menghubungkan aktivitas
    - Timestamp yang diformat
    - Badge untuk activity_type dan entity_type
  - Automatic logging dengan database triggers untuk:
    - Contracts: INSERT, UPDATE, DELETE
    - Client Products: INSERT, DELETE
    - Client Add-ons: INSERT, DELETE
    - Client H2H: INSERT, DELETE
    - Notes: INSERT, UPDATE, DELETE (hanya untuk notes dengan client_id)
    - Clients: INSERT, UPDATE

### 🔧 Perbaikan

#### UI/UX
- **Chart Colors**: Setiap kolom/bar di chart sekarang memiliki warna berbeda yang menarik
  - Color palette dengan 10 warna berbeda
  - Status color map untuk Pie Chart status kontrak
  - Bar charts menggunakan Cell component untuk warna berbeda per bar
  - Pie chart menggunakan statusColorMap untuk warna sesuai status

#### Code Quality
- Refactor chart colors untuk konsistensi dan maintainability
- Color palette yang reusable untuk semua charts

### 📝 Dokumentasi
- Update `CHANGELOG.md` dengan versi 1.4.0
- Update `DOCUMENTATION.md` dengan fitur-fitur baru
- Update `README.md` dengan versi 1.4.0

---

## [1.3.0] - 2024

### ✨ Fitur Baru

#### Quick Wins - High Priority Features
- **Refactor Code Reusability**
  - `formatCurrency` dipindahkan ke `src/lib/utils.ts` sebagai utility function
  - `statusColors` dipindahkan ke `src/lib/constants.ts` sebagai shared constants
  - Semua file menggunakan utility functions yang sama untuk konsistensi

- **Pagination di Semua Tabel**
  - Hook `usePagination` untuk pagination logic yang reusable
  - Komponen `PaginationControls` untuk UI pagination yang konsisten
  - Pagination ditambahkan di:
    - Halaman Klien (`/clients`)
    - Halaman Kontrak (`/contracts`)
    - Halaman Master Data - Produk (`/master-data/products`)
  - Fitur: navigasi halaman, pilih items per page (5, 10, 20, 50), info "Menampilkan X-Y dari Z"

- **Global Search**
  - Komponen `GlobalSearch` untuk pencarian global di seluruh aplikasi
  - Tombol search di sidebar dengan shortcut Ctrl+K
  - Mencari: Klien, Produk, Kontrak, Add-ons, Jasa H2H
  - Debounce 300ms untuk performa optimal
  - Menampilkan hasil dengan badge tipe dan navigasi langsung ke halaman terkait

- **Export Data**
  - Export ke CSV untuk semua data
  - Export ke Excel untuk data klien (menggunakan library `xlsx`)
  - Utility functions: `exportToCSV`, `exportToExcel`, `formatDateForCSV`, `formatCurrencyForCSV`
  - Tombol export di halaman Klien dan Kontrak
  - Format Excel dengan kolom yang rapi dan dapat dibuka di Microsoft Excel

- **Notifikasi Kontrak Akan Berakhir**
  - API endpoint `/api/contracts/expiring` untuk kontrak yang berakhir dalam 30 hari
  - Card alert di dashboard menampilkan kontrak yang akan berakhir
  - Menampilkan: nama klien, status, tahun, tanggal berakhir, nilai kontrak, hari tersisa
  - Badge merah untuk kontrak ≤7 hari, badge abu-abu untuk >7 hari
  - Link langsung ke halaman kontrak

- **Tab Kontrak di Detail Klien**
  - Tab kontrak di halaman detail klien menampilkan status kontrak
  - Tabel kontrak dengan kolom: Tahun Kontrak, Status (badge berwarna), Nilai Kontrak, Tanggal Mulai, Tanggal Selesai, Catatan
  - Status kontrak ditampilkan dengan badge berwarna sesuai status

### 🔧 Perbaikan

#### Code Quality
- Refactor code duplication untuk maintainability yang lebih baik
- Utility functions yang reusable di `src/lib/utils.ts` dan `src/lib/constants.ts`
- Hook custom `usePagination` untuk logic pagination yang konsisten

#### Performance
- Pagination untuk mengurangi load data di tabel besar
- Debounce pada global search untuk mengurangi API calls
- Dynamic import untuk library Excel (xlsx) untuk mengurangi bundle size

#### User Experience
- Global search untuk navigasi cepat
- Export Excel untuk reporting yang lebih baik
- Notifikasi kontrak untuk reminder otomatis
- Pagination untuk performa yang lebih baik pada data besar

### 📝 Dokumentasi
- Update `CHANGELOG.md` dengan versi 1.3.0
- Update `DOCUMENTATION.md` dengan fitur-fitur baru
- Update `README.md` dengan versi 1.3.0

### 📦 Dependencies
- Menambahkan `xlsx` (v0.18.5) untuk export Excel

---

## [1.2.0] - 2024

### ✨ Fitur Baru

#### Layout Improvement - Card Informasi Klien
- Card informasi klien sekarang full width (tidak lagi dalam grid 2 kolom)
- Layout grid internal untuk informasi klien dan tags:
  - Informasi dasar klien di kolom pertama (1/4 lebar di desktop)
  - Tags Produk, Add-ons, dan Jasa H2H di kolom 2-4 (3/4 lebar di desktop)
- List produk, add-ons, jasa H2H, dan kontrak terlihat lebih banyak karena card lebih lebar
- Responsive: di mobile tetap 1 kolom, di tablet 2 kolom, di desktop 4 kolom

### 🔧 Perbaikan

#### UI/UX
- Card informasi klien lebih lebar untuk menampilkan lebih banyak badge
- Layout lebih efisien dengan grid internal
- Badge produk/add-ons/H2H dapat menampilkan lebih banyak item tanpa terpotong

---

## [1.1.0] - 2024

### ✨ Fitur Baru

#### Relasi Many-to-Many Bank dengan Jasa H2H
- Tabel `banks` untuk master data bank
- Tabel `h2h_service_banks` sebagai junction table antara jasa H2H dan bank
- Setiap jasa H2H dapat memiliki multiple bank
- Form master data jasa H2H dengan multi-select bank menggunakan checkbox
- Tabel master data menampilkan bank-bank yang terhubung sebagai badge

#### Bank per Klien per Jasa H2H
- Tabel `client_h2h_banks` untuk menyimpan bank yang dipilih oleh setiap klien
- Setiap klien dapat memilih bank berbeda untuk jasa H2H yang sama
- Form tambah jasa H2H ke klien dengan checkbox untuk memilih bank
- Validasi bank harus tersedia di jasa H2H yang dipilih

#### CRUD Lengkap untuk Jasa H2H di Klien
- Tombol **Edit** (icon pencil) di tabel jasa H2H yang digunakan
- Dialog edit untuk mengubah bank yang dipilih untuk jasa H2H tertentu
- Edit bank dari card informasi klien:
  - Badge jasa H2H bisa diklik untuk edit
  - Icon pencil di samping badge untuk edit
- API endpoint `PUT /api/clients/[id]/h2h/[h2hId]/banks` untuk update bank

#### UI Enhancement
- Badge dengan warna berbeda:
  - Produk: Biru (`bg-blue-500`)
  - Add-ons: Hijau (`bg-green-500`)
  - Jasa H2H: Ungu (`bg-purple-500`)
- Gradient cards di dashboard dengan hover effects
- Text gradient pada statistik cards
- Animasi transisi pada card hover

### 🔧 Perbaikan

#### Database Schema
- Migration `004_h2h_banks_relation.sql`:
  - Menghapus kolom `bank_name` dari `h2h_services`
  - Membuat tabel `banks` untuk master data bank
  - Membuat tabel `h2h_service_banks` untuk relasi many-to-many
  - Menambahkan RLS policies untuk tabel baru

- Migration `005_client_h2h_banks.sql`:
  - Membuat tabel `client_h2h_banks` untuk menyimpan bank yang dipilih klien
  - Menambahkan RLS policies
  - Index untuk performa query

#### API Improvements
- `GET /api/clients/[id]/h2h`:
  - Sekarang fetch bank yang dipilih klien dari `client_h2h_banks`
  - Mengembalikan data dengan nested `client_h2h_banks` array

- `POST /api/clients/[id]/h2h`:
  - Menerima parameter `bank_ids` (array of numbers)
  - Menyimpan bank yang dipilih ke `client_h2h_banks`
  - Mengembalikan data dengan bank yang sudah disimpan

- `PUT /api/clients/[id]/h2h/[h2hId]/banks` (Baru):
  - Endpoint baru untuk update bank yang dipilih
  - Menghapus bank lama dan menyisipkan bank baru
  - Mengembalikan data bank yang sudah diupdate

#### User Experience
- Badge jasa H2H di card informasi klien sekarang interaktif:
  - Cursor pointer saat hover
  - Bisa diklik untuk edit
  - Icon pencil untuk indikasi edit
- Tombol edit di tabel lebih jelas dengan icon pencil
- Dialog edit dengan checkbox yang user-friendly
- Pesan toast yang informatif untuk setiap aksi

### 📝 Dokumentasi
- Membuat `DOCUMENTATION.md` dengan dokumentasi lengkap:
  - Informasi umum aplikasi
  - Fitur utama lengkap
  - Struktur database detail
  - Panduan instalasi dan setup
  - Panduan penggunaan
  - API endpoints lengkap
  - Changelog V1.1

- Update `README.md`:
  - Update nama aplikasi menjadi "v-tax Management V1.1"
  - Update versi ke 1.1.0
  - Menambahkan link ke dokumentasi lengkap
  - Update fitur utama
  - Update struktur project

- Update `package.json`:
  - Nama: `vtax-management`
  - Versi: `1.1.0`

### 🎯 Versi Sempurna (Baseline)
Versi ini ditandai sebagai **"Versi Sempurna"** dan akan digunakan sebagai baseline untuk perubahan di masa depan. Jika diminta kembali ke "mode sempurna", yang dimaksud adalah versi ini.

---

## [1.0.0] - 2024

### ✨ Fitur Awal
- Manajemen Master Data (Products, Add-ons, H2H Services)
- Manajemen Klien dengan CRUD lengkap
- Halaman Detail Klien dengan tabs untuk produk, add-ons, H2H
- Manajemen Kontrak dengan status tracking
- Dashboard dengan statistik
- Todo List dan Catatan
- Authentication dengan Clerk
- Dark mode support
- Responsive design

---

[1.1.0]: https://github.com/your-repo/vtax-management/releases/tag/v1.1.0
[1.0.0]: https://github.com/your-repo/vtax-management/releases/tag/v1.0.0

