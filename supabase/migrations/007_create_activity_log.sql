-- Create activity_log table to track all client activities
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'contract_created', 'product_added', 'addon_added', 'h2h_added', 'note_created', 'contract_updated', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'contract', 'product', 'addon', 'h2h', 'note', 'client'
  entity_id INTEGER, -- ID of the related entity
  description TEXT NOT NULL, -- Human-readable description
  metadata JSONB, -- Additional data about the activity
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) -- User ID or name
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON activity_log(activity_type);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view and manage activity logs
CREATE POLICY "Authenticated users can manage activity_log" ON public.activity_log
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to automatically log activities
CREATE OR REPLACE FUNCTION log_client_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_desc TEXT;
  activity_type_val VARCHAR(50);
  entity_type_val VARCHAR(50);
BEGIN
  -- Determine activity type and description based on table and operation
  IF TG_TABLE_NAME = 'contracts' THEN
    entity_type_val := 'contract';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'contract_created';
      activity_desc := 'Kontrak baru dibuat: Tahun ' || NEW.contract_year || ', Status: ' || NEW.status;
    ELSIF TG_OP = 'UPDATE' THEN
      activity_type_val := 'contract_updated';
      activity_desc := 'Kontrak diperbarui: Tahun ' || NEW.contract_year || ', Status: ' || NEW.status;
    ELSIF TG_OP = 'DELETE' THEN
      activity_type_val := 'contract_deleted';
      activity_desc := 'Kontrak dihapus: Tahun ' || OLD.contract_year;
    END IF;
  ELSIF TG_TABLE_NAME = 'client_products' THEN
    entity_type_val := 'product';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'product_added';
      activity_desc := 'Produk ditambahkan ke klien';
    ELSIF TG_OP = 'DELETE' THEN
      activity_type_val := 'product_removed';
      activity_desc := 'Produk dihapus dari klien';
    END IF;
  ELSIF TG_TABLE_NAME = 'client_addons' THEN
    entity_type_val := 'addon';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'addon_added';
      activity_desc := 'Add-on ditambahkan ke klien';
    ELSIF TG_OP = 'DELETE' THEN
      activity_type_val := 'addon_removed';
      activity_desc := 'Add-on dihapus dari klien';
    END IF;
  ELSIF TG_TABLE_NAME = 'client_h2h' THEN
    entity_type_val := 'h2h';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'h2h_added';
      activity_desc := 'Jasa H2H ditambahkan ke klien';
    ELSIF TG_OP = 'DELETE' THEN
      activity_type_val := 'h2h_removed';
      activity_desc := 'Jasa H2H dihapus dari klien';
    END IF;
  ELSIF TG_TABLE_NAME = 'notes' AND NEW.client_id IS NOT NULL THEN
    entity_type_val := 'note';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'note_created';
      activity_desc := 'Catatan dibuat: ' || COALESCE(NEW.title, 'Tanpa judul');
    ELSIF TG_OP = 'UPDATE' THEN
      activity_type_val := 'note_updated';
      activity_desc := 'Catatan diperbarui: ' || COALESCE(NEW.title, 'Tanpa judul');
    ELSIF TG_OP = 'DELETE' THEN
      activity_type_val := 'note_deleted';
      activity_desc := 'Catatan dihapus';
    END IF;
  ELSIF TG_TABLE_NAME = 'clients' THEN
    entity_type_val := 'client';
    IF TG_OP = 'INSERT' THEN
      activity_type_val := 'client_created';
      activity_desc := 'Klien baru dibuat: ' || NEW.name;
    ELSIF TG_OP = 'UPDATE' THEN
      activity_type_val := 'client_updated';
      activity_desc := 'Informasi klien diperbarui';
    END IF;
  END IF;

  -- Insert activity log
  IF activity_type_val IS NOT NULL THEN
    INSERT INTO activity_log (
      client_id,
      activity_type,
      entity_type,
      entity_id,
      description,
      metadata,
      created_by
    ) VALUES (
      COALESCE(NEW.client_id, OLD.client_id, NEW.id, OLD.id),
      activity_type_val,
      entity_type_val,
      COALESCE(NEW.id, OLD.id),
      activity_desc,
      jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME),
      current_setting('request.jwt.claims', true)::json->>'sub' -- Get user ID from JWT
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic activity logging
CREATE TRIGGER log_contract_activity
  AFTER INSERT OR UPDATE OR DELETE ON contracts
  FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_client_product_activity
  AFTER INSERT OR DELETE ON client_products
  FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_client_addon_activity
  AFTER INSERT OR DELETE ON client_addons
  FOR EACH ROW EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_client_h2h_activity
  AFTER INSERT OR DELETE ON client_h2h
  FOR EACH ROW EXECUTE FUNCTION log_client_activity();

-- Note activity triggers: separate for INSERT/UPDATE and DELETE
CREATE TRIGGER log_note_activity_insert_update
  AFTER INSERT OR UPDATE ON notes
  FOR EACH ROW 
  WHEN (NEW.client_id IS NOT NULL)
  EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_note_activity_delete
  AFTER DELETE ON notes
  FOR EACH ROW 
  WHEN (OLD.client_id IS NOT NULL)
  EXECUTE FUNCTION log_client_activity();

CREATE TRIGGER log_client_info_activity
  AFTER INSERT OR UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_client_activity();

