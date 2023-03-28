import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Query } from 'src/dtos/query-request.dto';
import { OpenAiService } from 'src/services/open-api.service';

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
}
