-- Create table for storing large bill text in chunks (for RAG and semantic search)
CREATE TABLE bill_text_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_size INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT bill_text_chunks_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX bill_text_chunks_bill_id_idx ON bill_text_chunks(bill_id);
CREATE INDEX bill_text_chunks_chunk_index_idx ON bill_text_chunks(chunk_index);
CREATE UNIQUE INDEX bill_text_chunks_bill_id_chunk_index_key ON bill_text_chunks(bill_id, chunk_index);
