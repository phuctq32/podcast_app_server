import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './configs/api-docs.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Cors
  app.enableCors();

  app.setGlobalPrefix('api/v1');

  // Swagger document
  configSwagger(app);

  await app.listen(8080);
}
bootstrap();
