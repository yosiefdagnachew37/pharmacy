import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // LAN server must bind to 0.0.0.0 so it is reachable from other PCs on the network.
  // Desktop (IS_DESKTOP_OFFLINE) and SaaS modes remain on localhost (no change).
  const isLanServer = process.env.DEPLOYMENT_MODE === 'lan-server';
  const host = isLanServer ? '0.0.0.0' : 'localhost';
  const port = process.env.PORT ?? (isLanServer ? '3000' : '3001');

  await app.listen(port, host);

  const resolvedUrl = isLanServer
    ? `LAN SERVER listening on http://0.0.0.0:${port} (all network interfaces)`
    : `Application listening on http://${host}:${port}`;
  console.log(`[Bootstrap] ${resolvedUrl}`);
}
bootstrap();
