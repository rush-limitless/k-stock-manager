import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('K-Stock Manager API')
    .setDescription('API de gestion de stock et finances')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
  const port = process.env.PORT ?? 4000;
  console.log(`API: http://localhost:${port}/api`);
  console.log(`Docs: http://localhost:${port}/api/docs`);
}
bootstrap();
