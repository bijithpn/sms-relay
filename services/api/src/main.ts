import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('SMS Relay API')
    .setDescription('Professional self-hosted SMS and OTP gateway API. All requests require the x-admin-secret header.')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-admin-secret', in: 'header' }, 'x-admin-secret')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT || 3001);
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`API running on http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api/docs`);
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the old dev server with "pnpm stop", then run "pnpm easy".`);
      process.exit(1);
    }
    throw error;
  }
}
bootstrap();
