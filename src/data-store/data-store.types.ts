import { Query } from 'src/dtos/query-request.dto';

export interface QueryWithEmbedding extends Query {
  embedding: number[];
}
