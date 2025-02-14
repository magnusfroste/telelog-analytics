
create or replace function match_call_logs (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  similarity float,
  metadata jsonb
)
language plpgsql
as $$
begin
  return query
  select
    call_log_embeddings.id,
    1 - (call_log_embeddings.embedding <=> query_embedding) as similarity,
    call_log_embeddings.metadata
  from call_log_embeddings
  where 1 - (call_log_embeddings.embedding <=> query_embedding) > match_threshold
  order by call_log_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
