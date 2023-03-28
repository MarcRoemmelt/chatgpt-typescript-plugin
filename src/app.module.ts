import { join } from 'node:path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import config from './app.config';
import { AppController } from './app.controller';
import { AppRepository } from './app.repository';
import { DataStore } from './data-store/data-store';
import { PineconeDataStore } from './data-store/providers/pinecone.provider';
import { AppService } from './services/app.service';
import { OpenAiService } from './services/open-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'assets'),
      serveStaticOptions: {
        index: false,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppRepository,
    OpenAiService,
    { provide: DataStore, useClass: PineconeDataStore },
  ],
})
export class AppModule {}
