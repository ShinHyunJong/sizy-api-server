import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '@src/prisma/prisma.service';
import { ShopAuthController } from './auth/auth.controller';
import { ShopAuthService } from './auth/auth.service';
import { ShopPaymentController } from './auth/payment/auth.payment.controller';
import { ShopPaymentService } from './auth/payment/auth.payment.service';

@Module({
  controllers: [ShopController, ShopAuthController, ShopPaymentController],
  providers: [
    ShopService,
    JwtService,
    PrismaService,
    ShopAuthService,
    ShopPaymentService,
  ],
})
export class ShopModule {}
