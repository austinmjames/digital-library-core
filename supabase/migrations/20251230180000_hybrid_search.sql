-- Enable pgroonga for Hebrew morphology and vector for semantic search
CREATE EXTENSION IF NOT EXISTS pgroonga;
CREATE EXTENSION IF NOT EXISTS vector;

-- The Hybrid Search Function (as defined in Manifest Section 6)
CREATE OR REPLACE FUNCTION public.hybrid_search_verses(
    query_text TEXT,
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 20
)
RETURNS TABLE (id UUID, ref TEXT, hebrew_text TEXT, english_text TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id, v.ref, v.hebrew_text, v.english_text,
        (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity
    FROM library.verses v
    JOIN library.embeddings e ON v.id = e.verse_id
    WHERE 
        (v.hebrew_text &@~ query_text) OR 
        (1 - (e.embedding <=> query_embedding)) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;