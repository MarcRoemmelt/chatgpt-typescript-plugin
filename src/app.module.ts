import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import config from './app.config';
import { AppController } from './app.controller';
import { AppRepository } from './app.repository';
import { DataStore } from './data-store/data-store';
import { PineconeDataStore } from './data-store/providers/pinecone.provider';
import { AppService } from './services/app.service';
import { ChunksService } from './services/chunks.service';
import { OpenAiService } from './services/open-api.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [config] })],
  controllers: [AppController],
  providers: [
    AppService,
    AppRepository,
    OpenAiService,
    ChunksService,
    { provide: DataStore, useClass: PineconeDataStore },
  ],
})
export class AppModule {}
