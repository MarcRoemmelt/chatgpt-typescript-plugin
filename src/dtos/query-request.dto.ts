/**
 * Dtos within *.dto.ts files will auto-generate
 * the open api documentation for the API which is
 * accessible at /api via swagger
 */

class Base<T> {
  constructor(chunk: T) {
    Object.assign(this, chunk);
  }
}

export class QueryRequest extends Base<QueryRequest> {
  queries: Query[];
}

export class Query extends Base<Query> {
  query: string;
  filter?: DocumentMetadataFilter;
  topK?: number = 3;
}

export class DocumentMetadataFilter extends Base<DocumentMetadataFilter> {
  documentId?: string;
  source?: string;
  sourceId?: string;
}

class Source extends Base<Source> {
  url: string;
}

class DocumentMetadata extends Base<DocumentMetadata> {
  source?: Source;
  source_id?: string;
  url?: string;
  created_at?: string;
  author?: string;
}

class DocumentChunkMetadata extends DocumentMetadata {
  documentId?: string;
}

class DocumentChunk extends Base<DocumentChunk> {
  id?: string;
  text: string;
  metadata: DocumentChunkMetadata;
  embedding?: number[];
}

export class DocumentChunkWithScore extends DocumentChunk {
  score: number;

  constructor(chunk: DocumentChunkWithScore) {
    super(chunk);
  }
}

export class QueryResponse extends Base<QueryResponse> {
  results: QueryResult[];
}

export class QueryResult extends Base<QueryResult> {
  query: string;
  result: DocumentChunkWithScore[];
}
