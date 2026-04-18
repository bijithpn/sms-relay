import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  const port = Number(process.env.PORT || 3001);
  try {
    await app.listen(port, '0.0.0.0');
    console.log(`API running on http://localhost:${port}`);
  } catch (error: any) {
    if (error?.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the old dev server with "pnpm stop", then run "pnpm easy".`);
      process.exit(1);
    }
    throw error;
  }
}
bootstrap();
