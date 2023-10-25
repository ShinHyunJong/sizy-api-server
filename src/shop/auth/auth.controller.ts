import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';

import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';
import { ShopLoginDto } from '../dto/login.seller.dto';
import { ShopAuthService } from './auth.service';

@Controller('shop/auth')
export class ShopAuthController {
  constructor(private authSerivice: ShopAuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  artistMe(@Req() req) {
    return this.authSerivice.getShopDetail(req.user.shopId);
  }

  @Post('login')
  artistLogin(@Body() loginBody: ShopLoginDto) {
    return this.authSerivice.loginShop(loginBody);
  }
}
