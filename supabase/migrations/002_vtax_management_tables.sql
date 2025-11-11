-- Migration untuk v-tax Management (CSM)
-- Membuat semua tabel yang diperlukan untuk aplikasi

-- ---------------------------------
-- TABEL MASTER (PRODUK & JASA)
-- ---------------------------------

-- Tabel untuk produk aplikasi utama
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk add-ons
CREATE TABLE IF NOT EXISTS public.addons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk jasa H2H (Host-to-Host)
CREATE TABLE IF NOT EXISTS public.h2h_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    default_price NUMERIC(15, 2) DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------
-- TABEL KLIEN
-- ---------------------------------

CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    regency VARCHAR(255), -- Kabupaten
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------
-- TABEL RELASI (PENGHUBUNG)
-- ---------------------------------

-- Tabel ini mencatat produk apa saja yang dibeli klien (history pembelian)
CREATE TABLE IF NOT EXISTS public.client_products (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    purchase_year INT NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL, -- Harga kesepakatan saat itu
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Memastikan 1 klien tidak membeli produk yang sama di tahun yang sama
    UNIQUE(client_id, product_id, purchase_year)
);

-- Tabel penghubung add-ons yang dimiliki klien
CREATE TABLE IF NOT EXISTS public.client_addons (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    addon_id INT NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
    assigned_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(client_id, addon_id)
);

-- Tabel penghubung jasa H2H yang dimiliki klien
CREATE TABLE IF NOT EXISTS public.client_h2h (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    h2h_service_id INT NOT NULL REFERENCES public.h2h_services(id) ON DELETE RESTRICT,
    assigned_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(client_id, h2h_service_id)
);

-- ---------------------------------
-- TABEL KONTRAK
-- ---------------------------------

-- Membuat tipe data ENUM untuk status kontrak
DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM (
        'Draft',
        'Review',
        'ACC',
        'Pencairan',
        'Bukti Potongan Pajak'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.contracts (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    contract_year INT NOT NULL,
    status contract_status DEFAULT 'Draft',
    contract_value NUMERIC(15, 2),
    notes TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Satu klien hanya punya satu data kontrak per tahun
    UNIQUE(client_id, contract_year)
);

-- ---------------------------------
-- TABEL UTILITAS
-- ---------------------------------

CREATE TABLE IF NOT EXISTS public.todos (
    id SERIAL PRIMARY KEY,
    task TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------
-- INDEXES untuk performa
-- ---------------------------------

CREATE INDEX IF NOT EXISTS idx_client_products_client_id ON public.client_products(client_id);
CREATE INDEX IF NOT EXISTS idx_client_products_product_id ON public.client_products(product_id);
CREATE INDEX IF NOT EXISTS idx_client_addons_client_id ON public.client_addons(client_id);
CREATE INDEX IF NOT EXISTS idx_client_addons_addon_id ON public.client_addons(addon_id);
CREATE INDEX IF NOT EXISTS idx_client_h2h_client_id ON public.client_h2h(client_id);
CREATE INDEX IF NOT EXISTS idx_client_h2h_service_id ON public.client_h2h(h2h_service_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_contract_year ON public.contracts(contract_year);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);

-- ---------------------------------
-- TRIGGERS untuk updated_at
-- ---------------------------------

-- Fungsi untuk update updated_at (jika belum ada)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk products
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk addons
DROP TRIGGER IF EXISTS update_addons_updated_at ON public.addons;
CREATE TRIGGER update_addons_updated_at
    BEFORE UPDATE ON public.addons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk h2h_services
DROP TRIGGER IF EXISTS update_h2h_services_updated_at ON public.h2h_services;
CREATE TRIGGER update_h2h_services_updated_at
    BEFORE UPDATE ON public.h2h_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk contracts
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ---------------------------------

-- Enable RLS pada semua tabel
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.h2h_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_h2h ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Policies untuk products (semua user authenticated bisa akses)
CREATE POLICY "Authenticated users can manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk addons
CREATE POLICY "Authenticated users can manage addons" ON public.addons
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk h2h_services
CREATE POLICY "Authenticated users can manage h2h_services" ON public.h2h_services
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk clients
CREATE POLICY "Authenticated users can manage clients" ON public.clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk client_products
CREATE POLICY "Authenticated users can manage client_products" ON public.client_products
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk client_addons
CREATE POLICY "Authenticated users can manage client_addons" ON public.client_addons
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk client_h2h
CREATE POLICY "Authenticated users can manage client_h2h" ON public.client_h2h
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk contracts
CREATE POLICY "Authenticated users can manage contracts" ON public.contracts
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk todos
CREATE POLICY "Authenticated users can manage todos" ON public.todos
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies untuk notes
CREATE POLICY "Authenticated users can manage notes" ON public.notes
    FOR ALL USING (auth.role() = 'authenticated');

