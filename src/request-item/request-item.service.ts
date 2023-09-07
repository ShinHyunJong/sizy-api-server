import { Injectable } from '@nestjs/common';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { generateId } from '@src/utils/common';

@Injectable()
export class RequestItemService {
  constructor(private prismaService: PrismaService) {}

  async searchCode(shopId: number, query: string) {
    const shop = await this.prismaService.shop.findUnique({
      where: {
        id: shopId,
      },
      select: {
        brand: {
          select: {
            id: true,
          },
        },
      },
    });
    const result = await this.prismaService.$queryRaw`SELECT 
      RequestItem.id, 
      shopId, 
      productCode,
      brandId
    FROM 
      RequestItem
      LEFT JOIN SizeRequest ON RequestItem.requestId = SizeRequest.id
      LEFT JOIN Shop ON SizeRequest.shopId = Shop.id 
    WHERE 
      MATCH(productCode) AGAINST(+${query} IN BOOLEAN MODE) 
      AND Shop.brandId = ${shop.brand.id} 
    GROUP BY 
      productCode
    `;
    return result;
  }

  async getAllItemCode(shopId: number) {
    const codeList = await this.prismaService.requestItem.findMany({
      where: {
        sizeRequest: {
          shopId,
        },
      },
      distinct: ['productCode'],
      select: {
        id: true,
        productCode: true,
      },
      orderBy: {},
    });
    return codeList;
  }

  async getRequestItems(requestId: number) {
    const request = await this.prismaService.sizeRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        seller: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
        sellerId: true,
        customer: {
          select: {
            id: true,
            phone: true,
            name: true,
          },
        },
      },
    });
    const requestItemList = await this.prismaService.requestItem.findMany({
      where: {
        requestId,
      },
      include: {
        sizeRequest: true,
        orderAddress: true,
      },
    });
    return {
      request,
      customer: request.customer,
      requestItemList,
    };
  }

  async create(shopId: number, createRequestItemDto: CreateRequestItemDto) {
    //새로 만든 고객일 경우, 등록까지 진행 후 item 생성
    if (createRequestItemDto.customerId) {
      let orderAddressId = null;
      //1. 요청 등록
      const createdRequest = await this.prismaService.sizeRequest.create({
        data: {
          customerId: createRequestItemDto.customerId,
          sellerId: createRequestItemDto.sellerId,
          shopId,
        },
      });

      //2. 주문일 경우 주문 주소 등록
      if (createRequestItemDto.orderAddress) {
        const orderAddress = await this.prismaService.orderAddress.create({
          data: {
            ...createRequestItemDto.orderAddress,
            requestId: createdRequest.id,
            uniqueId: generateId(),
          },
        });
        orderAddressId = orderAddress.id;
      }
      const requestItemList = createRequestItemDto.requestItemList.map((x) => {
        return {
          ...x,
          requestId: createdRequest.id,
          orderAddressId,
        };
      });

      //3. 아이템 등록
      await this.prismaService.requestItem.createMany({
        data: requestItemList,
      });
    } else {
      let orderAddressId = null;

      const requestId = createRequestItemDto.requestItemList[0].requestId;

      //1. 주문일 경우 주문 주소 등록
      if (createRequestItemDto.orderAddress) {
        const orderAddress = await this.prismaService.orderAddress.create({
          data: {
            ...createRequestItemDto.orderAddress,
            uniqueId: generateId(),
            requestId,
          },
        });
        orderAddressId = orderAddress.id;
      }
      const requestItemList = createRequestItemDto.requestItemList.map((x) => {
        return {
          ...x,
          requestId,
          orderAddressId,
        };
      });

      //2. 판매자 업데이트
      await this.prismaService.sizeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          sellerId: createRequestItemDto.sellerId,
        },
      });

      //3. 아이템 등록
      await this.prismaService.requestItem.createMany({
        data: requestItemList,
      });

      return 'created';
    }
  }

  async update(body: UpdateRequestItemDto) {
    const { requestItemList, sellerId, requestId, orderAddress } = body;
    await this.prismaService.sizeRequest.update({
      where: {
        id: requestId,
      },
      data: {
        sellerId,
      },
    });
    if (orderAddress) {
      await this.prismaService.orderAddress.update({
        where: {
          id: orderAddress.id,
        },
        data: {
          ...orderAddress,
        },
      });
    }
    await Promise.all(
      requestItemList.map(async (x) => {
        const exist = await this.prismaService.requestItem.findUnique({
          where: {
            id: x.id,
          },
        });
        if (exist) {
          await this.prismaService.requestItem.update({
            where: {
              id: x.id,
            },
            data: {
              ...x,
            },
          });
        } else {
          const copied = { ...x, orderAddressId: orderAddress.id || null };
          delete copied.id;
          await this.prismaService.requestItem.create({
            data: copied,
          });
        }
      }),
    );
    return 'updated';
  }

  async updateIsReady(id: number, isReady: boolean) {
    await this.prismaService.requestItem.update({
      where: {
        id,
      },
      data: {
        isReady,
      },
    });
    return 'updated';
  }

  async remove(id: number) {
    const exist = await this.prismaService.requestItem.findUnique({
      where: {
        id,
      },
    });
    if (exist) {
      await this.prismaService.requestItem.delete({
        where: {
          id: exist.id,
        },
      });
    }
    return 'deleted';
  }
}
