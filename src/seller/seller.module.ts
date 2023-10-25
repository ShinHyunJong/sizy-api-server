import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';

@Module({
  controllers: [SellerController],
  providers: [SellerService, JwtService, PrismaService],
})
export class SellerModule {}
