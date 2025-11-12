-- Add full_text column to bills table to store actual HTML content
ALTER TABLE bills ADD COLUMN full_text TEXT;
