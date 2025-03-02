import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config(); // ✅ Load environment variables

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Fix CORS for Shopify OAuth
  app.enableCors({
    origin: '*', // Allow all origins (for testing)
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // ✅ Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Shop User API')
    .setDescription('API for managing shop users')
    .setVersion('1.0')
    .addBearerAuth() // ✅ JWT authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`🚀 Server is running on: http://localhost:3000/api`);
}

bootstrap();
