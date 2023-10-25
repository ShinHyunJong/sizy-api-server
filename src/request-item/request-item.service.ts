import { Injectable } from '@nestjs/common';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import cryptoRandomString from 'crypto-random-string';
import { sendKakao } from '@src/utils/biztalk';
import dayjs from 'dayjs';
import { NotificationService } from '@src/notification/notification.service';

@Injectable()
export class RequestItemService {
  constructor(
    private prismaService: PrismaService,
    private notiService: NotificationService,
  ) {}

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
    let sizeRequestId;
    let orderAddressId;
    if (createRequestItemDto.customerId) {
      //1. 요청 등록
      const createdRequest = await this.prismaService.sizeRequest.create({
        data: {
          customerId: createRequestItemDto.customerId,
          sellerId: createRequestItemDto.sellerId,
          shopId,
          uniqueId: cryptoRandomString({ length: 16 }),
        },
      });
      //2. 주문일 경우 주문 주소 등록
      if (createRequestItemDto.orderAddress) {
        const orderAddress = await this.prismaService.orderAddress.create({
          data: {
            ...createRequestItemDto.orderAddress,
            requestId: createdRequest.id,
            uniqueId: cryptoRandomString({ length: 16 }),
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
      sizeRequestId = createdRequest.id;
    } else {
      const requestId = createRequestItemDto.requestItemList[0].requestId;
      sizeRequestId = requestId;

      //1. 주문일 경우 주문 주소 등록
      if (createRequestItemDto.orderAddress) {
        const orderAddress = await this.prismaService.orderAddress.create({
          data: {
            ...createRequestItemDto.orderAddress,
            uniqueId: cryptoRandomString({ length: 16 }),
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
    }

    if (orderAddressId) {
      const sizeRequest = await this.prismaService.sizeRequest.findUnique({
        where: {
          id: sizeRequestId,
        },
        include: {
          orderAddressList: true,
          customer: true,
          seller: {
            select: {
              id: true,
              name: true,
              position: true,
            },
          },
          shop: {
            select: {
              branch: true,
              brand: {
                select: {
                  name: true,
                },
              },
              phone: true,
            },
          },
        },
      });

      const { shop, seller, customer } = sizeRequest;
      const isPickUp = createRequestItemDto.orderAddress.type === 'pickup';

      const shopName = `${shop.brand.name} ${shop.branch}`;
      const shopPhone = `${shop.phone}`;
      const dueDate = `${dayjs(
        createRequestItemDto.orderAddress.dueDate,
      ).format('YYYY-MM-DD')}`;
      const sellerName = `${seller.name} ${seller.position}`;
      const noti = await this.prismaService.notification.create({
        data: {
          uniqueId: cryptoRandomString({ length: 16 }),
          requestId: sizeRequest.id,
          orderAddressId,
          type: 'enroll',
          hasRead: false,
        },
      });
      const link = `store.sizy.co.kr/notification/${noti.uniqueId}`;
      await sendKakao(
        [
          {
            recipientNo: isPickUp
              ? customer.phone
              : createRequestItemDto.orderAddress.phone,
            templateParameter: {
              receipient: createRequestItemDto.orderAddress.receipient,
              shopName,
              shopPhone,
              dueDate,
              sellerName,
              link,
            },
          },
        ],
        'enroll-complete',
      );
    }
    return 'created';
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
    let orderAddressId = null;
    if (orderAddress) {
      const orderAddressCopied = { ...orderAddress };
      delete orderAddressCopied.orderAddressId;
      delete orderAddressCopied.id;
      if (orderAddress.orderAddressId) {
        const updated = await this.prismaService.orderAddress.update({
          where: {
            id: orderAddress.orderAddressId,
          },
          select: {
            id: true,
          },
          data: {
            ...orderAddressCopied,
          },
        });
        orderAddressId = updated.id;
      } else {
        const created = await this.prismaService.orderAddress.create({
          select: {
            id: true,
          },
          data: {
            uniqueId: cryptoRandomString({ length: 16 }),
            requestId,
            ...orderAddressCopied,
          },
        });
        orderAddressId = created.id;
      }
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
              orderAddressId: orderAddressId || null,
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

  async updateStatusCount(
    id: number,
    requestCount: number,
    arrivedCount: number,
  ) {
    await this.prismaService.requestItem.update({
      where: {
        id,
      },
      data: {
        requestCount,
        arrivedCount,
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
