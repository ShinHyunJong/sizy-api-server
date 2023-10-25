import { Module } from '@nestjs/common';
import { RequestItemService } from './request-item.service';
import { RequestItemController } from './request-item.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from '@src/notification/notification.service';

@Module({
  controllers: [RequestItemController],
  providers: [
    RequestItemService,
    PrismaService,
    JwtService,
    NotificationService,
  ],
})
export class RequestItemModule {}
