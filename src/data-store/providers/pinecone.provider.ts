import { Injectable, OnModuleInit } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import type {
  QueryOperationRequest,
  QueryResponse,
  Vector,
  VectorOperationsApi,
} from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

import {
  DocumentChunk,
  DocumentChunkWithScore,
  DocumentMetadataFilter,
} from '../../dtos/common.dto';
import { DeleteRequest } from '../../dtos/delete-request.dto';
import { QueryResult } from '../../dtos/query-request.dto';
import { DataStore } from '../data-store';
import { QueryWithEmbedding } from '../data-store.types';

// Set the batch size for upserting vectors to Pinecone
const UPSERT_BATCH_SIZE = 100;

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

  async _upsert(chunks: { [documentId: string]: DocumentChunk[] }) {
    const { vectors, docIds } = Object.entries(chunks).reduce(
      (acc, [docId, chunks]) => {
        const newVectors: Vector[] = chunks.map((chunk) => {
          const createdAt = new Date(chunk.metadata.createdAt).valueOf();
          return {
            id: chunk.id,
            values: chunk.embedding,
            metadata: {
              text: chunk.text,
              ...chunk.metadata,
              createdAt: Number.isNaN(createdAt) ? Date.now() : createdAt,
            },
          };
        });
        return {
          vectors: [...acc.vectors, ...newVectors],
          docIds: [...acc.docIds, docId],
        };
      },
      { vectors: [] as Vector[], docIds: [] as string[] },
    );

    const batches = this.batch(vectors, UPSERT_BATCH_SIZE);
    const upsertPromises = batches.map((batch) =>
      this.index.upsert({
        upsertRequest: {
          vectors,
        },
      }),
    );
    await Promise.all(upsertPromises);
    return docIds;
  }

  async _delete(deleteRequest: DeleteRequest) {
    if (deleteRequest.deleteAll) {
      await this.index._deleteRaw({ deleteRequest: { deleteAll: true } });
    }
    if (deleteRequest.ids?.length) {
      await this.index._deleteRaw({
        deleteRequest: { filter: { documentId: { $in: deleteRequest.ids } } },
      });
    }

    if (deleteRequest.filter) {
      const filter = this.getFilter(deleteRequest.filter);
      await this.index._deleteRaw({
        deleteRequest: { filter },
      });
    }
    return true;
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
      if (field === 'startDate') {
        return {
          ...filter,
          date: { ...(filter['date'] ?? {}), $gte: new Date(value).valueOf() },
        };
      }
      if (field === 'endDate') {
        return {
          ...filter,
          date: { ...(filter['date'] ?? {}), $lte: new Date(value).valueOf() },
        };
      }
      return { ...filter, [field]: value };
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

  private batch<T>(array: T[], batchSize: number = UPSERT_BATCH_SIZE) {
    const chunks = [...array];
    const batches: T[][] = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      batches.push(chunks.slice(i, i + batchSize));
    }
    return batches;
  }
}
