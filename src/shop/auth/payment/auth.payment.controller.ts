import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';

import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';
import { ShopPaymentService } from './auth.payment.service';

@Controller('shop/auth/payment')
export class ShopPaymentController {
  constructor(private paymentService: ShopPaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('billingKey')
  getBillingKey(
    @Req() req,
    @Body() body: { customerKey: string; authKey: string },
  ) {
    return this.paymentService.getShopBillingKey(req.user.shopId, body);
  }
}
