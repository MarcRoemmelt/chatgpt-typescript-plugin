/**
 * Dtos within *.dto.ts files will auto-generate
 * the open api documentation for the API which is
 * accessible at /api via swagger
 */

export class Base<T> {
  constructor(chunk: T) {
    Object.assign(this, chunk);
  }
}

export enum Source {
  email = 'email',
  file = 'file',
  chat = 'chat',
}

class DocumentMetadata extends Base<DocumentMetadata> {
  source?: Source;
  sourceId?: string;
  url?: string;
  createdAt?: string;
  author?: string;
}

class DocumentChunkMetadata extends DocumentMetadata {
  documentId?: string;
}

export class DocumentChunk extends Base<DocumentChunk> {
  id?: string;
  text: string;
  metadata: DocumentChunkMetadata;
  embedding?: number[];
}

export class Document extends Base<Document> {
  id?: string;
  text: string;
  metadata?: DocumentMetadata;
}

export class DocumentChunkWithScore extends DocumentChunk {
  score: number;

  constructor(chunk: DocumentChunkWithScore) {
    super(chunk);
  }
}

export class DocumentMetadataFilter extends Base<DocumentMetadataFilter> {
  documentId?: string;
  source?: string;
  sourceId?: string;
  startDate?: string; // any date string format
  endDate?: string; // any date string format
}
