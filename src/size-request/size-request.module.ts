import { Module } from '@nestjs/common';
import { SizeRequestService } from './size-request.service';
import { SizeRequestController } from './size-request.controller';
import { PrismaService } from '@src/prisma/prisma.service';

@Module({
  controllers: [SizeRequestController],
  providers: [SizeRequestService, PrismaService],
})
export class SizeRequestModule {}
