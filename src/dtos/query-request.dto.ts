/**
 * Dtos within *.dto.ts files will auto-generate
 * the open api documentation for the API which is
 * accessible at /api via swagger
 */

import {
  Base,
  DocumentChunkWithScore,
  DocumentMetadataFilter,
} from './common.dto';

export class QueryRequest extends Base<QueryRequest> {
  queries: Query[];
}

export class Query extends Base<Query> {
  query: string;
  filter?: DocumentMetadataFilter;
  topK?: number = 3;
}

export class QueryResponse extends Base<QueryResponse> {
  results: QueryResult[];
}

export class QueryResult extends Base<QueryResult> {
  query: string;
  result: DocumentChunkWithScore[];
}
