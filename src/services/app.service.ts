import { Injectable } from '@nestjs/common';

import { AppRepository } from '../app.repository';
import { Query } from '../dtos/query-request.dto';
import { OpenAiService } from './open-api.service';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  /**
   * Query Repository
   */
  async queryDB(queries: Query[]) {
    return this.appRepository.queryDB(queries);
  }
}
