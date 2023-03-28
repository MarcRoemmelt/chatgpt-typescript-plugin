import { Injectable } from '@nestjs/common';
import { Query } from 'src/dtos/query-request.dto';
import { OpenAiService } from 'src/services/open-api.service';

import { DataStore } from './data-store/data-store';

@Injectable()
export class AppRepository {
  constructor(private readonly db: DataStore) {}

  async queryDB(queries: Query[]) {
    return this.db.query(queries);
  }
}
