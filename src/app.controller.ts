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
import { ChatGPTGuard } from './app.guard';
import { QueryRequest, QueryResponse } from './dtos/query-request.dto';
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
  @UseGuards(ChatGPTGuard)
  @Get('query')
  async queryDb(@Body() body: QueryRequest): Promise<QueryResponse> {
    return this.appService.queryDB(body.queries);
  }
}
