import 'dayjs/locale/ko';
import dayjs from 'dayjs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';

import { AppModule } from './app.module';

let cachedServer;
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dayjs.locale('ko');

export const handler = async (event, context) => {
  if (!cachedServer) {
    const nestApp = await NestFactory.create(AppModule);
    nestApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    nestApp.enableCors();
    await nestApp.init();
    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer(event, context);
};
