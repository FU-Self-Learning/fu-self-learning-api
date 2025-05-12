import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { EnvironmentVariable } from './common/enums/enviroment.enum';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const service = app.get(ConfigService);
  
  // Enable CORS with credentials
  app.enableCors({
    origin: true, // or specify your frontend URL
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Enable cookie parser
  app.use(cookieParser());

  app.setGlobalPrefix(service.getOrThrow(EnvironmentVariable.CONTEXT_PATH));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Tự động chuyển đổi dữ liệu từ string sang kiểu dữ liệu tương ứng
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Quay lỗi nếu có thuộc tính không hợp lệ
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
