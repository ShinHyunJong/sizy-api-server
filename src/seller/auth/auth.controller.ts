import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';

import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';
import { SellarAuthService } from './auth.service';
import { SellerLoginDto } from '../dto/login.seller.dto';

@Controller('seller/auth')
export class SellerAuthController {
  constructor(private authSerivice: SellarAuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  artistMe(@Req() req) {
    return this.authSerivice.getSellerDetail(req.user.id);
  }

  @Post('login')
  artistLogin(@Body() loginBody: SellerLoginDto) {
    return this.authSerivice.loginSeller(loginBody);
  }
}
