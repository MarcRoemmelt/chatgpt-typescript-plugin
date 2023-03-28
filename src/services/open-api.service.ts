import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';

const DEFAULT_MODEL = 'text-embedding-ada-002';

@Injectable()
export class OpenAiService implements OnModuleInit {
  private openAi: OpenAIApi;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const envConfig = this.configService.get('openai');
    const openAiConfig = new Configuration(envConfig);
    this.openAi = new OpenAIApi(openAiConfig);
  }

  async createEmbedding(
    texts: string[],
    model = DEFAULT_MODEL,
  ): Promise<number[][]> {
    const axiosResponse = await this.openAi.createEmbedding({
      input: texts,
      model,
    });
    const { data: createEmbeddingResponse } = axiosResponse.data;
    return createEmbeddingResponse.map(({ embedding }) => embedding);
  }
}
