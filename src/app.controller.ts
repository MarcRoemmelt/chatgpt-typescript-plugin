import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

import * as aiPluginJSON from './ai-plugin.json';
import { AppGuard } from './app.guard';
import { DeleteRequest, DeleteResponse } from './dtos/delete-request.dto';
import { QueryRequest, QueryResponse } from './dtos/query-request.dto';
import { UpsertRequest, UpsertResponse } from './dtos/upsert-request.dto';
import { AppService } from './services/app.service';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService,
  ) {}

  @ApiExcludeEndpoint()
  @Get('.well-known/ai-plugin.json')
  async getAiPluginJSON() {
    const host = this.configService.get('HOST');
    return JSON.stringify(aiPluginJSON).replace(/{HOST}/g, host);
  }

  /**
   * Query the DB for text snippets
   */
  @HttpCode(HttpStatus.OK)
  @UseGuards(AppGuard)
  @Get('query')
  async queryDb(@Body() body: QueryRequest): Promise<QueryResponse> {
    return this.appService.queryDB(body.queries);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AppGuard)
  @Post('upsert')
  async upsert(@Body() body: UpsertRequest): Promise<UpsertResponse> {
    return this.appService.upsert(body.documents);
  }

  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AppGuard)
  @Post('delete')
  async delete(@Body() body: DeleteRequest): Promise<DeleteResponse> {
    return this.appService.delete(body);
  }
}
