import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';
import { getTossBillingKey } from '@src/utils/toss';

export type TokenInfo = {
  id: number;
  alias: string;
  payload: string;
  expiresIn: string;
};

export type Tokens = {
  accessToken: string;
};

@Injectable()
export class ShopPaymentService {
  constructor(private prisma: PrismaService) {}

  async getShopBillingKey(
    shopId: number,
    body: { customerKey: string; authKey: string },
  ) {
    const { billingKey } = await getTossBillingKey(
      body.customerKey,
      body.authKey,
    );
    await this.prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        cardRegisteredAt: new Date(),
        billingKey,
      },
    });
  }
}
