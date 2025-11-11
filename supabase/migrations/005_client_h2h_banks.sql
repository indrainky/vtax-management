-- Migration untuk menambahkan relasi bank per klien per jasa H2H
-- Setiap klien bisa memilih bank-bank spesifik yang digunakan untuk jasa H2H tertentu

-- Buat tabel relasi many-to-many antara client_h2h dan banks
CREATE TABLE IF NOT EXISTS public.client_h2h_banks (
    id SERIAL PRIMARY KEY,
    client_h2h_id INT NOT NULL REFERENCES public.client_h2h(id) ON DELETE CASCADE,
    bank_id INT NOT NULL REFERENCES public.banks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_h2h_id, bank_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_h2h_banks_client_h2h_id ON public.client_h2h_banks(client_h2h_id);
CREATE INDEX IF NOT EXISTS idx_client_h2h_banks_bank_id ON public.client_h2h_banks(bank_id);

-- Enable RLS
ALTER TABLE public.client_h2h_banks ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk client_h2h_banks
CREATE POLICY "Authenticated users can manage client_h2h_banks" ON public.client_h2h_banks
    FOR ALL USING (auth.role() = 'authenticated');

