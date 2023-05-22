import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cors
  app.enableCors();

  app.setGlobalPrefix('api/v1');
  // Swagger document
  const config = new DocumentBuilder()
    // .setBasePath('api')
    .setTitle('Podcast API Documentation')
    .setDescription('The podcast app API document description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(8080);
}
bootstrap();
