import { HttpException, Injectable } from '@nestjs/common';
import { HASH_KEY } from '@src/constants/index';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';
import { hash } from '@src/helpers/security';
import { ShopLoginDto } from '../dto/login.seller.dto';

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
export class ShopAuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param sellarId
   * @param email
   * @param payload
   * @returns
   */
  async getTokens(shopId: number, payload: string): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        shopId,
        payload,
      },
      {
        secret: HASH_KEY,
      },
    );
    return { accessToken };
  }

  async getShopDetail(shopId: number) {
    const shopDetail = await this.prisma.shop.findUnique({
      where: {
        id: shopId,
      },
      select: {
        id: true,
        alias: true,
        parcelCo: true,
        phone: true,
        branch: true,
        brand: true,
        createdAt: true,
        sellerList: {
          where: {
            isActive: true,
          },
        },
      },
    });

    return shopDetail;
  }

  async loginShop(params: ShopLoginDto) {
    const { email, password } = params;

    const shop = await this.prisma.shop.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        password: true,
        alias: true,
        email: true,
        branch: true,
      },
    });
    if (!shop) throw new HttpException('not exist', 406);
    const hashed = hash(password);
    if (shop.password !== hashed) throw new HttpException('not exist', 406);
    const tokens = await this.getTokens(shop.id, shop.alias);
    return {
      user: {
        id: shop.id,
        alias: shop.alias,
        name: shop.branch,
        email: shop.email,
      },
      tokens,
    };
  }
}
