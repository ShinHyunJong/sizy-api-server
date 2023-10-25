import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '@src/prisma/prisma.service';
import { ShopAuthController } from './auth/auth.controller';
import { ShopAuthService } from './auth/auth.service';

@Module({
  controllers: [ShopController, ShopAuthController],
  providers: [ShopService, JwtService, PrismaService, ShopAuthService],
})
export class ShopModule {}
