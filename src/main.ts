import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { config } from './config/env.config';

export async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  const _config = new DocumentBuilder()
    .setTitle('LabLib API')
    .setDescription('Learning Platform and much more...')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, _config);
  SwaggerModule.setup('docs/v1', app, document);

  return await app.listen(config.port);

}