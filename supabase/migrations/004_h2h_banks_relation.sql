-- Migration untuk mengubah struktur bank dari kolom menjadi relasi many-to-many
-- Menghapus kolom bank_name dan membuat tabel banks serta relasi

-- Hapus kolom bank_name jika sudah ada
ALTER TABLE public.h2h_services
DROP COLUMN IF EXISTS bank_name;

-- Buat tabel banks
CREATE TABLE IF NOT EXISTS public.banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
);

-- Buat tabel relasi many-to-many antara h2h_services dan banks
CREATE TABLE IF NOT EXISTS public.h2h_service_banks (
    id SERIAL PRIMARY KEY,
    h2h_service_id INT NOT NULL REFERENCES public.h2h_services(id) ON DELETE CASCADE,
    bank_id INT NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(h2h_service_id, bank_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_h2h_service_banks_h2h_service_id ON public.h2h_service_banks(h2h_service_id);
CREATE INDEX IF NOT EXISTS idx_h2h_service_banks_bank_id ON public.h2h_service_banks(bank_id);

-- Enable RLS
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.h2h_service_banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk banks
CREATE POLICY "Authenticated users can manage banks" ON public.banks
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies untuk h2h_service_banks
CREATE POLICY "Authenticated users can manage h2h_service_banks" ON public.h2h_service_banks
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger untuk updated_at pada banks
DROP TRIGGER IF EXISTS update_banks_updated_at ON public.banks;
CREATE TRIGGER update_banks_updated_at
    BEFORE UPDATE ON public.banks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

