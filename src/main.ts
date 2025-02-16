import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ❌ `CORS` の設定を削除
  // app.enableCors({
  //   origin: "http://localhost:3000",
  //   methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  //   allowedHeaders: "Content-Type, Authorization",
  //   credentials: true,
  // });

  await app.listen(3001, "0.0.0.0"); // ✅ NestJS を 3001 で起動
}
bootstrap();
