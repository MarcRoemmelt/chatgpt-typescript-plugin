import fastifyHelmet from '@fastify/helmet';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as pkJSON from '../package.json';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  useHelmet(app);
  useOpenApi(app);
  useCors(app);
  await app.listen(3333);
}
bootstrap();

const useOpenApi = (app: NestFastifyApplication) => {
  const configService = app.get(ConfigService);
  const host = configService.get('HOST');
  const builder = new DocumentBuilder()
    .setTitle('ChatGPT Plugin API')
    .setDescription('The ChatGPT Plugin API description')
    .setVersion(pkJSON.version)
    .addBearerAuth()
    .addServer(`https://${host}`);

  const swaggerObject = SwaggerModule.createDocument(app, builder.build(), {
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('docs', app, swaggerObject, {});
};

const useHelmet = (app: NestFastifyApplication) => {
  app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });
};

const useCors = (app: NestFastifyApplication) => {
  app.enableCors({
    origin: 'http://localhost:3333',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origiin'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    credentials: true,
  });
};
