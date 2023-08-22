import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SellarAuthService } from './auth/auth.service';
import { SellerAuthController } from './auth/auth.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';

@Module({
  controllers: [SellerController, SellerAuthController],
  providers: [SellerService, SellarAuthService, JwtService, PrismaService],
})
export class SellerModule {}
