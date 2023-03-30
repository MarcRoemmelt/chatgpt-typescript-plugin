import { Injectable } from '@nestjs/common';
import { Query } from 'src/dtos/query-request.dto';

import { DataStore } from './data-store/data-store';
import { DocumentChunk } from './dtos/common.dto';
import { DeleteRequest } from './dtos/delete-request.dto';

@Injectable()
export class AppRepository {
  constructor(private readonly db: DataStore) {}

  async queryDB(queries: Query[]) {
    return this.db.query(queries);
  }
  async upsert(chunks: { [documentId: string]: DocumentChunk[] }) {
    const requests = Object.keys(chunks)
      .map((id) => id && this.delete({ filter: { documentId: id } }))
      .filter(Boolean);
    await Promise.all(requests);
    return this.db.upsert(chunks);
  }
  async delete(deleteRequest: DeleteRequest) {
    return this.db.delete(deleteRequest);
  }
}
