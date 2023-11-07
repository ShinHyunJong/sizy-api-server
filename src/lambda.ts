import 'dayjs/locale/ko';
import dayjs from 'dayjs';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import * as Sentry from '@sentry/serverless';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { AppModule } from './app.module';

let cachedServer;
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

dayjs.locale('ko');

Sentry.AWSLambda.init({
  dsn: 'https://9b3207d1321e77436bdb4666ec0491e0@o4506182758629376.ingest.sentry.io/4506183106953216',
  integrations: [new ProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
});

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
