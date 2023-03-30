import { Injectable } from '@nestjs/common';

import { AppRepository } from '../app.repository';
import { Document } from '../dtos/common.dto';
import { DeleteRequest } from '../dtos/delete-request.dto';
import { Query } from '../dtos/query-request.dto';
import { ChunksService } from './chunks.service';

@Injectable()
export class AppService {
  constructor(
    private readonly repo: AppRepository,
    private readonly chunksService: ChunksService,
  ) {}

  async queryDB(queries: Query[]) {
    return this.repo.queryDB(queries);
  }

  async upsert(docs: Document[]) {
    const chunks = await this.chunksService.getChunksForDocuments(docs);
    return this.repo.upsert(chunks);
  }

  async delete(deleteRequest: DeleteRequest) {
    return this.repo.delete(deleteRequest);
  }
}
