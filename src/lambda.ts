import 'dayjs/locale/ko';
import dayjs from 'dayjs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';

import { AppModule } from './app.module';

import Sentry from '@sentry/serverless';
Sentry.AWSLambda.init({
  dsn: 'https://a82de164204a9b3025e48699037b95e5@o4506182758629376.ingest.sentry.io/4506182770884608',

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

let cachedServer;
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dayjs.locale('ko');

export const handler = Sentry.AWSLambda.wrapHandler(async (event, context) => {
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
});
