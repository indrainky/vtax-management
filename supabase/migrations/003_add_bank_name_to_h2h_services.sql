-- Migration untuk menambahkan kolom bank_name ke tabel h2h_services

ALTER TABLE public.h2h_services
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255);

