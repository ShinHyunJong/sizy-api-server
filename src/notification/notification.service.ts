import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '@src/prisma/prisma.service';
import { generateId } from '@src/utils/common';
import { parcelAxios } from '@src/utils/parcel';
import { sendKakao } from '@src/utils/biztalk';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  async getNotificationList(shopId: number) {
    const notificationList = await this.prismaService.notification.findMany({
      where: {
        sizeRequest: {
          shopId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notificationList;
  }

  async getOrderDeliveryStatus(uniqueId: number) {
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
    if (!notification.hasRead) {
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
      const result = await parcelAxios.get(
        `/carriers/${notification.orderAddress.parcelCo}/tracks/${notification.orderAddress.parcelNo}`,
      );
      deliveryStatus = result.data;
    }

    return {
      notification,
      deliveryStatus,
    };
  }

  async create(userId: number, createNotificationDto: CreateNotificationDto) {
    const createdNoti = await this.prismaService.notification.create({
      data: {
        senderId: userId,
        hasRead: false,
        uniqueId: generateId(),
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
    const addressName = `${orderAddress.lotAddress} ${orderAddress.detailAddress}`;
    const parcelCo = orderAddress.parcelCo;
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
              receipient: orderAddress.receipient,
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
              receipient: orderAddress.receipient,
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

    return 'This action adds a new notification';
  }
}
