# v-tax Management V1.4

Aplikasi web internal untuk memusatkan data klien, melacak produk/jasa yang telah dibeli (aplikasi, add-ons, H2H), memonitor siklus kontrak tahunan, dan mengelola tugas harian (todo list & catatan).

**Versi:** 1.4.0  
**Status:** Active Development

## 📚 Dokumentasi

Untuk dokumentasi lengkap, silakan baca [DOCUMENTATION.md](./DOCUMENTATION.md)

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Authentication:** [Clerk](https://clerk.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Theme System:** [next-themes](https://github.com/pacocoursey/next-themes)

## Prerequisites

Before you begin, ensure you have the following:
- Node.js 18+ installed
- A [Clerk](https://clerk.com/) account for authentication
- A [Supabase](https://supabase.com/) account for database
- Optional: [OpenAI](https://platform.openai.com/) or [Anthropic](https://console.anthropic.com/) API key for AI features
- Generated project documents from [CodeGuide](https://codeguide.dev/) for best development experience

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codeguide-starter-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables Setup**
   - Copy the `.env.example` file to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in the environment variables in `.env.local` (see Configuration section below)

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.**

The homepage includes a setup dashboard with direct links to configure each service.

## Configuration

### Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to API Keys
4. Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Authentication → Integrations → Add Clerk (for third-party auth)
4. Go to Project Settings > API
5. Copy the `Project URL` as `NEXT_PUBLIC_SUPABASE_URL`
6. Copy the `anon` public key as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### AI Integration Setup (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/) or [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to your environment variables

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Integration (Optional)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Fitur Utama

### V1.4 Features

- ✅ **Dashboard Analytics**: Charts dengan warna menarik untuk distribusi status kontrak, kontrak per tahun, produk terlaris, dan klien per kabupaten/kota
- ✅ **Notes per Klien**: Catatan khusus per klien dengan CRUD lengkap
- ✅ **Activity Timeline**: Timeline visual untuk tracking semua aktivitas klien secara otomatis

### V1.3 Features

- ✅ **Quick Wins**: Refactor code, pagination, global search, export CSV/Excel, notifikasi kontrak
- ✅ **Pagination**: Pagination di semua tabel untuk performa yang lebih baik
- ✅ **Global Search**: Pencarian global di seluruh aplikasi (Ctrl+K)
- ✅ **Export Data**: Export ke CSV dan Excel untuk reporting
- ✅ **Notifikasi Kontrak**: Reminder otomatis untuk kontrak yang akan berakhir
- ✅ **Tab Kontrak**: Status kontrak di detail klien dengan badge berwarna

### V1.2 Features
- ✅ **Layout Improvement**: Card informasi klien full width untuk menampilkan lebih banyak list
- ✅ **Manajemen Master Data**: Products, Add-ons, H2H Services dengan multiple banks
- ✅ **Manajemen Klien**: CRUD lengkap dengan detail produk/add-ons/H2H
- ✅ **Bank per Klien per Jasa H2H**: Setiap klien bisa pilih bank berbeda untuk jasa H2H yang sama
- ✅ **CRUD Lengkap Jasa H2H**: Edit bank dari card info atau tabel
- ✅ **Manajemen Kontrak**: Tracking lifecycle kontrak tahunan
- ✅ **Dashboard**: Statistik, Todo List, dan Catatan dengan quick add
- ✅ **Dark Mode**: Toggle dark/light mode
- ✅ **Authentication**: Clerk dengan middleware protection
- ✅ **UI/UX**: Gradient cards, badges berwarna, responsive design

## Project Structure

```
vtax-management/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   │   ├── clients/       # Client API endpoints
│   │   │   ├── products/      # Product API endpoints
│   │   │   ├── addons/        # Addon API endpoints
│   │   │   ├── h2h-services/  # H2H Service API endpoints
│   │   │   ├── contracts/     # Contract API endpoints
│   │   │   ├── todos/         # Todo API endpoints
│   │   │   ├── notes/         # Note API endpoints
│   │   │   └── dashboard/     # Dashboard API endpoints
│   │   ├── dashboard/         # Dashboard page
│   │   ├── master-data/       # Master data pages
│   │   ├── clients/           # Client pages
│   │   ├── contracts/         # Contract pages
│   │   ├── todos/             # Todo pages
│   │   └── notes/             # Note pages
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── theme-provider.tsx # Theme context
│   │   └── theme-toggle.tsx  # Dark mode toggle
│   ├── lib/                   # Utility functions
│   │   ├── supabase.ts        # Supabase client with Clerk auth
│   │   ├── user.ts            # User utilities
│   │   └── utils.ts           # General utilities
│   └── middleware.ts          # Clerk route protection
├── supabase/
│   └── migrations/            # Database migrations
│       ├── 001_example_tables_with_rls.sql
│       ├── 002_vtax_management_tables.sql
│       ├── 004_h2h_banks_relation.sql
│       └── 005_client_h2h_banks.sql
├── DOCUMENTATION.md           # Dokumentasi lengkap
├── README.md                  # File ini
├── app_summary.md             # Ringkasan aplikasi
└── components.json            # shadcn/ui configuration
```

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables** (lihat bagian Configuration di atas)

3. **Run database migrations** di Supabase Dashboard

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.