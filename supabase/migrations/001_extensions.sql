-- =============================================================================
-- 001: Enable PostgreSQL Extensions
-- =============================================================================

-- Enable vector storage for semantic search (AI embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable trigram matching for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
