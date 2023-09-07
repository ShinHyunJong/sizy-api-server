import { HttpException, Injectable } from '@nestjs/common';
import { HASH_KEY } from '@src/constants/index';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@src/prisma/prisma.service';

import { SellerLoginDto } from '../dto/login.seller.dto';
import { hash } from '@src/helpers/security';

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
export class SellarAuthService {
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
  async getTokens(
    sellarId: number,
    shopId: number,
    payload: string,
  ): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      {
        id: sellarId,
        shopId,
        payload,
      },
      {
        secret: HASH_KEY,
      },
    );
    return { accessToken };
  }

  async getSellerDetail(userId: number) {
    const seller = await this.prisma.seller.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        alias: true,
        name: true,
        email: true,
        position: true,
        shop: {
          include: {
            brand: true,
          },
        },
        shopId: true,
        role: true,
      },
    });

    if (!seller) new HttpException('not found', 404);
    const role = seller.role;
    let employList = [];
    if (role <= 2) {
      employList = await this.prisma.seller.findMany({
        where: {
          role: {
            not: 2,
          },
        },
        select: {
          id: true,
          name: true,
          role: true,
          position: true,
          shopId: true,
          shop: true,
          email: true,
        },
      });
    }
    const newSeller = { ...seller, employList };
    if (role <= 2) return newSeller;
    else {
      return seller;
    }
  }

  async loginSeller(params: SellerLoginDto) {
    const { email, password } = params;

    const seller = await this.prisma.seller.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        shopId: true,
        password: true,
        alias: true,
        email: true,
        name: true,
      },
    });
    if (!seller) throw new HttpException('not exist', 406);
    const hashed = hash(password);
    if (seller.password !== hashed) throw new HttpException('not exist', 406);
    const tokens = await this.getTokens(seller.id, seller.shopId, seller.alias);
    return {
      user: {
        id: seller.id,
        shopId: seller.shopId,
        alias: seller.alias,
        name: seller.name,
        email: seller.email,
      },
      tokens,
    };
  }
}
