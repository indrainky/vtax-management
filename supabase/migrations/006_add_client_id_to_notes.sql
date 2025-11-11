-- Add client_id column to notes table for client-specific notes
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON notes(client_id);

-- Update RLS policy to allow access to notes with client_id
-- Notes can be global (client_id is NULL) or client-specific (client_id is not NULL)
-- Existing RLS policy already allows authenticated users to manage all notes

