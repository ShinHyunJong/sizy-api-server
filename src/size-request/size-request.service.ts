import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import cryptoRandomString from 'crypto-random-string';

@Injectable()
export class SizeRequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async prePostSizeRequest(shopId: number, body: { phone: string }) {
    // 번호 확인
    const hasEnrolled = await this.prismaService.customer.findFirst({
      where: {
        shopId,
        phone: body.phone,
      },
    });
    if (!hasEnrolled) {
      return { visitCount: 0 };
    }
    const visitCount = await this.prismaService.sizeRequest.count({
      where: {
        shopId,
        customerId: hasEnrolled.id,
      },
    });
    await this.prismaService.sizeRequest.create({
      data: {
        shopId,
        customerId: hasEnrolled.id,
        uniqueId: cryptoRandomString({ length: 16 }),
      },
    });
    return { visitCount };
  }

  async postSizeRequest(
    shopId: number,
    body: { phone: string; marketingAgree: boolean },
  ) {
    //1. customer에 있는 지 확인
    let customerId;
    const hasEnrolled = await this.prismaService.customer.findFirst({
      where: {
        shopId,
        phone: body.phone,
      },
    });
    if (!hasEnrolled) {
      const created = await this.prismaService.customer.create({
        data: {
          phone: body.phone,
          isMarketingAgree: body.marketingAgree,
        },
      });
      customerId = created.id;
    } else {
      customerId = hasEnrolled.id;
    }
    await this.prismaService.sizeRequest.create({
      data: {
        customerId,
        shopId,
        uniqueId: cryptoRandomString({ length: 16 }),
      },
    });
    return 'created';
  }

  async getSizeRequestDetail(uniqueId: string) {
    const requestDetail = await this.prismaService.sizeRequest.findUnique({
      where: {
        uniqueId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        orderAddressList: true,
        requestItemList: true,
      },
    });
    return requestDetail;
  }

  async getSizeRequestList(
    shopId: number,
    skip: number,
    take: number,
    isComplete?: boolean,
  ) {
    const totalCountList = await this.prismaService.sizeRequest.findMany({
      where: {
        shopId,
      },
      include: {
        _count: {
          select: {
            requestItemList: true,
          },
        },
      },
    });
    const requestList = await this.prismaService.sizeRequest.findMany({
      where: {
        shopId,
      },
      skip: skip,
      take: take,
      include: {
        _count: {
          select: {
            requestItemList: true,
          },
        },
        orderAddressList: true,
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          include: {
            _count: {
              select: {
                sizeRequest: {
                  where: {
                    shopId: shopId,
                  },
                },
              },
            },
          },
        },
        requestItemList: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const reformed = requestList
      .map((x) => {
        return {
          ...x,
          visitCount: x.customer._count.sizeRequest,
        };
      })
      .filter((x) => {
        const itemCount = x._count.requestItemList;
        return isComplete ? itemCount !== 0 : itemCount === 0;
      });
    return {
      totalCount: totalCountList.filter((x) => x._count.requestItemList !== 0)
        .length,
      requestList: reformed,
    };
  }

  async updateSellar(requestId, body) {
    await this.prismaService.sizeRequest.update({
      where: {
        id: requestId,
      },
      data: {
        sellerId: body.sellerId,
      },
    });
    return 'updated';
  }

  async deleteSizeRequest(requestId: number) {
    await this.prismaService.sizeRequest.delete({
      where: {
        id: requestId,
      },
    });
    return 'deleted';
  }
}
