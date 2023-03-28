import { Injectable, OnModuleInit } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import type {
  QueryOperationRequest,
  QueryResponse,
  VectorOperationsApi,
} from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import {
  DocumentChunkWithScore,
  DocumentMetadataFilter,
  QueryResult,
} from 'src/dtos/query-request.dto';

import { DataStore } from '../data-store';
import { QueryWithEmbedding } from '../data-store.types';

@Injectable()
export class PineconeDataStore extends DataStore implements OnModuleInit {
  private pinecone: PineconeClient;
  private index: VectorOperationsApi;

  async onModuleInit() {
    const config = this.configService.get('database.pinecone');
    this.pinecone = new PineconeClient();
    await this.pinecone.init(config);
    const indexes = await this.pinecone.listIndexes();
    if (!indexes.includes(config.index)) {
      const fieldsToIndex = ['key1', 'key2'];
      await this.pinecone.createIndex({
        createRequest: {
          name: config.index,
          dimension: 1536, // dimensionality of OpenAI ada v2 embeddings
          metadataConfig: {
            indexed: fieldsToIndex,
          },
        },
      });
    }
    this.index = this.pinecone.Index(config.index);
  }

  async _query(
    queryWithEmbeddings: QueryWithEmbedding[],
  ): Promise<QueryResult[]> {
    const queryResultPromises = queryWithEmbeddings.map(async (query) => {
      const pineconeQuery = this.createQuery(query);
      const result = await this.index.query(pineconeQuery);
      return new QueryResult({
        query: query.query,
        result: this.parseQueryResult(result),
      });
    });

    return await Promise.all(queryResultPromises);
  }

  private createQuery(query: QueryWithEmbedding): QueryOperationRequest {
    const filter = this.getFilter(query.filter);
    return {
      queryRequest: {
        topK: query.topK,
        filter,
        includeMetadata: true,
        vector: query.embedding,
      },
    };
  }

  private getFilter(filter: DocumentMetadataFilter = {}) {
    return Object.entries(filter).reduce((filter, [field, value]) => {
      if (!value) return filter;
      if (field === 'key1') {
        return { ...filter, key1: { $in: [value] } };
      }
      if (field === 'key2') {
        return { ...filter, key2: { $in: [value] } };
      }
    }, {});
  }

  private parseQueryResult(result: QueryResponse): DocumentChunkWithScore[] {
    return (
      result.matches?.map((res) => {
        const metadata = Object.assign({}, res.metadata);
        delete metadata['text'];

        return new DocumentChunkWithScore({
          id: res.id,
          score: res.score,
          metadata,
          text: res.metadata['text'],
        });
      }) ?? []
    );
  }
}
