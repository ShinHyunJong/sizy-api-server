import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthJwtStrategy } from './strategies';
import { SizeRequestModule } from './size-request/size-request.module';
import { ShopModule } from './shop/shop.module';
import { SellerModule } from './seller/seller.module';
import { RequestItemModule } from './request-item/request-item.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    JwtModule,
    SizeRequestModule,
    ShopModule,
    SellerModule,
    RequestItemModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthJwtStrategy, JwtService],
})
export class AppModule {}
