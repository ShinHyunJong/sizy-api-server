import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, JwtService],
})
export class OrderModule {}
