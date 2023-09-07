import { Injectable } from '@nestjs/common';

import { PrismaService } from '@src/prisma/prisma.service';
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
    uniqueId: number,
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
}
