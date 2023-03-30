import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DocumentChunk } from '../dtos/common.dto';
import { DeleteRequest } from '../dtos/delete-request.dto';
import { Query } from '../dtos/query-request.dto';
import { OpenAiService } from '../services/open-api.service';
import { QueryWithEmbedding } from './data-store.types';

@Injectable()
export abstract class DataStore {
  constructor(
    protected readonly configService: ConfigService,
    private readonly openAiService: OpenAiService,
  ) {}

  public async query(queries: Query[]) {
    const embeddings = await this.openAiService.createEmbedding(
      queries.map((query) => query.query),
    );
    const queryWithEmbeddings = queries.map((query, i) => ({
      ...query,
      embedding: embeddings[i],
    }));
    return this._query(queryWithEmbeddings);
  }

  abstract _query(queryWithEmbeddings: QueryWithEmbedding[]): Promise<any>;

  public async upsert(chunks: { [documentId: string]: DocumentChunk[] }) {
    return this._upsert(chunks);
  }

  abstract _upsert(chunks: {
    [documentId: string]: DocumentChunk[];
  }): Promise<any>;

  public async delete(deleteRequest: DeleteRequest) {
    return this._delete(deleteRequest);
  }

  abstract _delete(deleteRequest: DeleteRequest): Promise<any>;
}
