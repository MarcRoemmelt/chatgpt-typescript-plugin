import { get_encoding } from '@dqbd/tiktoken';
import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { Document, DocumentChunk } from '../dtos/common.dto';
import { OpenAiService } from './open-api.service';

const BATCH_SIZE = 128; // The number of embeddings to request at a time
const MAX_NUM_CHUNKS = 10000; // The maximum number of chunks to generate from a text
const MIN_CHUNK_SIZE_CHARS = 350; // The minimum size of each text chunk in characters
const MIN_CHUNK_LENGTH_TO_EMBED = 5; // Discard chunks shorter than this
const tokenizer = get_encoding('cl100k_base');

@Injectable()
export class ChunksService {
  constructor(private readonly openAiService: OpenAiService) {}

  /**
   * Convert a list of documents into a dictionary from document id to list of document chunks.
   */
  async getChunksForDocuments(documents: Document[], chunkSize?: number) {
    const chunks = documents.reduce((allChunks, doc) => {
      return [...allChunks, ...this.createDocumentChunks(doc, chunkSize)];
    }, [] as DocumentChunk[]);

    const batches = this.batchChunks(chunks);

    const promises = batches.map(async (batch) => {
      const embeddings = await this.openAiService.createEmbedding(
        batch.map(({ text }) => text),
      );

      return batch.map((chunk, i) => ({ ...chunk, embedding: embeddings[i] }));
    });

    const chunksWithEmbeddings = (await Promise.all(promises)).flat();

    return chunksWithEmbeddings.reduce(
      (dict, chunk) => ({
        ...dict,
        [chunk.metadata.documentId]: [
          ...dict[chunk.metadata.documentId],
          chunk,
        ],
      }),
      {} as { [documentId: string]: DocumentChunk[] },
    );
  }

  private createDocumentChunks(
    document: Document,
    chunkSize?: number,
  ): DocumentChunk[] {
    if (!document.text?.trim()) return [];
    const documentId = document.id ?? uuid();
    const chunks = this.textToChunks(document.text, chunkSize);
    return chunks.map((chunk, i) => {
      return {
        id: `${documentId}_${i}`,
        text: chunk,
        metadata: {
          ...document.metadata,
          documentId,
        },
      };
    });
  }

  private textToChunks(text: string, chunkSize?: number): string[] {
    if (!text?.trim()) return [];

    const chunks: string[] = [];
    let tokens = tokenizer.encode(text);
    let numChunks = 0;

    while (tokens.length > 0 && numChunks < MAX_NUM_CHUNKS) {
      const initialChunk = tokens.slice(0, chunkSize);
      let initialChunkText = new TextDecoder().decode(
        tokenizer.decode(initialChunk),
      );

      /* If there is no text in this chunk, remove corresponding tokens */
      if (!initialChunkText?.trim()) {
        tokens = tokens.slice(0, initialChunk.length);
        continue;
      }

      const lastPunctuationIndex = Math.max(
        initialChunkText.indexOf('.'),
        initialChunkText.indexOf('?'),
        initialChunkText.indexOf('!'),
        initialChunkText.indexOf('\n'),
      );

      if (
        lastPunctuationIndex !== -1 &&
        lastPunctuationIndex >= MIN_CHUNK_SIZE_CHARS
      ) {
        initialChunkText = initialChunkText.slice(0, lastPunctuationIndex + 1);
      }
      const chunkText = initialChunkText.replace('\n', ' ').trim();

      if (chunkText.length > MIN_CHUNK_LENGTH_TO_EMBED) {
        /* Chunks that are shorter than this are discarded! */
        chunks.push(chunkText);
      }

      tokens = tokens.slice(tokenizer.encode(chunkText).length);
      numChunks++;
    }

    if (tokens.length > 0) {
      const remainingText = new TextDecoder()
        .decode(tokenizer.decode(tokens))
        .replace('\n', ' ')
        .trim();

      if (remainingText.length > MIN_CHUNK_LENGTH_TO_EMBED) {
        chunks.push(remainingText);
      }
    }
    return chunks;
  }

  private batchChunks(_chunks: DocumentChunk[]) {
    const chunks = [..._chunks];
    const batches: DocumentChunk[][] = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      batches.push(chunks.slice(i, i + BATCH_SIZE));
    }
    return batches;
  }
}
