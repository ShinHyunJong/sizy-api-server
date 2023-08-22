import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class SizeRequestService {
  constructor(private readonly prismaService: PrismaService) {}

  async prePostSizeRequest(shopId: number, body: { phone: string }) {
    // 번호 확인
    const hasEnrolled = await this.prismaService.customer.findUnique({
      where: {
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
    const hasEnrolled = await this.prismaService.customer.findUnique({
      where: {
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
      },
    });
    return 'created';
  }

  async getSizeRequestList(shopId: number, isComplete?: boolean) {
    const requestList = await this.prismaService.sizeRequest.findMany({
      where: {
        shopId,
      },
      include: {
        _count: {
          select: {
            requestItemList: true,
          },
        },
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
                sizeRequest: true,
              },
            },
          },
        },
        requestItemList: true,
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
    return reformed;
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
}
