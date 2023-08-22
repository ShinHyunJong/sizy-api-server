import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '@src/prisma/prisma.service';

@Module({
  controllers: [ShopController],
  providers: [ShopService, JwtService, PrismaService],
})
export class ShopModule {}
