import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';
import { sendKakao } from '@src/utils/biztalk';
import { parcelAxios } from '@src/utils/parcel';
import { UpdateOrderDeliveryDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prismaService: PrismaService) {}

  async gerOrderList(shopId: number) {
    const orderList = await this.prismaService.orderAddress.findMany({
      where: {
        sizeRequest: {
          shopId,
        },
        hasNotied: false,
      },
      include: {
        sizeRequest: {
          select: {
            customerId: true,
            seller: {
              select: {
                id: true,
                name: true,
              },
            },
            shop: {
              select: {
                id: true,
                phone: true,
                branch: true,
                brand: true,
                building: true,
                detail: true,
              },
            },
          },
        },
        requestItemList: true,
      },
    });
    return orderList;
  }

  async getOrderDeliveryStatus(
    uniqueId: string,
    parceCo: string,
    parcelNo: string,
  ) {
    const orderAddress = await this.prismaService.orderAddress.findUnique({
      where: {
        uniqueId,
      },

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
    });
    let deliveryStatus = null;
    if (orderAddress.type !== 'pickup') {
      const result = await parcelAxios.get(
        `/carriers/${parceCo}/tracks/${parcelNo}`,
      );
      deliveryStatus = result.data;
    }
    return {
      orderAddress,
      deliveryStatus,
    };
  }

  async updateOrderAddress(
    orderAddressId: number,
    data: UpdateOrderDeliveryDto,
  ) {
    const orderAddress = await this.prismaService.orderAddress.update({
      where: {
        id: orderAddressId,
      },
      data,
    });
    return orderAddress;
  }

  async deleteOrderAddress(orderAddressId: number) {
    await this.prismaService.orderAddress.delete({
      where: {
        id: orderAddressId,
      },
    });
    return 'deleted';
  }

  async updatePickupStatus(
    orderAddressId: number,
    hasPickedup: boolean,
    sellerId: number | null,
    notify: boolean,
  ) {
    const orderAddress = await this.prismaService.orderAddress.update({
      where: {
        id: orderAddressId,
      },
      include: {
        sizeRequest: {
          select: {
            shop: {
              include: {
                brand: true,
              },
            },
          },
        },
        seller: {
          select: {
            name: true,
          },
        },
      },
      data: {
        hasPickedup,
        pickedupAt: hasPickedup ? new Date() : null,
        tosserId: sellerId,
      },
    });
    if (hasPickedup && notify) {
      //알림톡 발송
      const notification = await this.prismaService.notification.findFirst({
        where: {
          orderAddressId,
        },
        select: {
          id: true,
          uniqueId: true,
        },
      });

      const receipient = orderAddress.receipient;
      const phone = orderAddress.phone;
      const shopPhone = orderAddress.sizeRequest.shop.phone;
      const shopName = `${orderAddress.sizeRequest.shop.brand.name} ${orderAddress.sizeRequest.shop.branch}`;
      const sellerName = orderAddress.seller.name;
      const link = `store.sizy.co.kr/notification/${notification.uniqueId}`;
      await sendKakao(
        [
          {
            recipientNo: phone,
            templateParameter: {
              receipient,
              shopName,
              sellerName,
              shopPhone,
              link,
            },
          },
        ],
        'p-toss-complete',
      );
    }
    return orderAddress;
  }
}
