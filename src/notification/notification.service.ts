import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { parcelAxios } from '@src/utils/parcel';
import { sendKakao } from '@src/utils/biztalk';
import { parcelCoList } from '@src/constants/parcel.constant';
import cryptoRandomString from 'crypto-random-string';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  async getNotificationList(shopId: number) {
    const notificationList = await this.prismaService.notification.findMany({
      where: {
        type: 'shipment',
        sizeRequest: {
          shopId,
        },
      },
      include: {
        orderAddress: {
          include: {
            requestItemList: {
              select: {
                id: true,
                productCode: true,
                color: true,
                productSize: true,
              },
            },
            sizeRequest: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notificationList;
  }

  async getOrderDeliveryStatus(
    shopId: number | undefined | null,
    uniqueId: string,
  ) {
    const notification = await this.prismaService.notification.findUnique({
      where: {
        uniqueId,
      },
      include: {
        orderAddress: {
          include: {
            sizeRequest: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    position: true,
                  },
                },
                shop: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
            requestItemList: true,
          },
        },
      },
    });
    if (!shopId && !notification.hasRead) {
      await this.prismaService.notification.update({
        where: {
          uniqueId,
        },
        data: {
          hasRead: true,
        },
      });
    }

    let deliveryStatus = null;
    if (notification.orderAddress.type !== 'pickup') {
      try {
        const result = await parcelAxios.get(
          `/carriers/${notification.orderAddress.parcelCo}/tracks/${notification.orderAddress.parcelNo}`,
        );
        deliveryStatus = result.data;
      } catch (error) {}
    }

    return {
      notification,
      deliveryStatus,
    };
  }

  async create(createNotificationDto: CreateNotificationDto, type: string) {
    const createdNoti = await this.prismaService.notification.create({
      data: {
        hasRead: false,
        type,
        uniqueId: cryptoRandomString({ length: 16 }),
        ...createNotificationDto,
      },
      include: {
        orderAddress: {
          include: {
            sizeRequest: {
              select: {
                seller: {
                  select: {
                    name: true,
                    position: true,
                  },
                },
                shop: {
                  include: {
                    brand: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const { orderAddress } = createdNoti;
    const { sizeRequest } = orderAddress;
    const { shop, seller } = sizeRequest;
    const { brand } = shop;
    const shopName = `${brand.name} ${shop.branch}`;
    const sellerName = `${seller.name} ${seller.position}`;
    const addressName = `${orderAddress.placeName || '버튼 눌러 확인'}`;
    const parcelCo =
      parcelCoList.find((x) => x.id === orderAddress.parcelCo).name ||
      '버튼 눌러 확인';
    const parcelNo = orderAddress.parcelNo;
    const shopLocation = `${shop.building} ${shop.detail}`;
    const shopPhone = shop.phone;
    const link = `store.sizy.co.kr/notification/${createdNoti.uniqueId}`;

    // 배송
    if (orderAddress.type === 'pickup') {
      await sendKakao(
        [
          {
            recipientNo: orderAddress.phone,
            templateParameter: {
              receipient: orderAddress.receipient || '고객',
              shopName,
              sellerName,
              shopLocation,
              shopPhone,
              link,
            },
          },
        ],
        'pickup-complete',
      );
    }
    if (orderAddress.type === 'parcel') {
      await sendKakao(
        [
          {
            recipientNo: orderAddress.phone,
            templateParameter: {
              receipient: orderAddress.receipient || '고객',
              shopName,
              sellerName,
              shopPhone,
              link,
              addressName,
              parcelCo,
              parcelNo,
            },
          },
        ],
        'parcel-complete',
      );
    }

    return createdNoti;
  }

  async postDummyNotification(body: CreateNotificationDto) {
    await this.prismaService.notification.create({
      data: {
        requestId: body.requestId,
        orderAddressId: body.orderAddressId,
        isDummy: true,
      },
    });
  }
}
