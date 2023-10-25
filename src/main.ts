import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import 'dayjs/locale/ko';
import dayjs from 'dayjs';

dayjs.locale('ko');

import { AppModule } from './app.module';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 4001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  await app.listen(port);
}
bootstrap();
