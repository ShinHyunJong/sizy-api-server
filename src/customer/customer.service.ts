import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class CustomerService {
  constructor(private prismaService: PrismaService) {}

  async getAddressList(shopId: number, customerId: number) {
    const addressList = await this.prismaService.customerAddress.findMany({
      where: {
        shopId,
        customerId,
      },
    });
    return addressList;
  }

  async getCustomerDetail(shopId: number, custoemrId: number) {
    const exisingCustomer = await this.prismaService.customer.findUnique({
      where: {
        id: custoemrId,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        _count: {
          select: {
            sizeRequest: {
              where: {
                shopId,
              },
            },
          },
        },
      },
    });
    return exisingCustomer || null;
  }

  async search(query: string) {
    const result = this.prismaService.customer.findMany({
      where: {
        OR: [
          {
            phone: {
              startsWith: query,
            },
          },
          {
            phone: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        phone: true,
      },
    });
    return result;
  }

  async findOne(customerId: number, shopId: number) {
    const customerDetail = await this.prismaService.customer.findUnique({
      where: {
        id: customerId,
      },
    });
    const requestList = await this.prismaService.sizeRequest.findMany({
      where: {
        customerId,
        shopId,
      },
      include: {
        customer: true,
        requestItemList: true,
      },
    });
    return {
      customerDetail,
      requestList,
    };
  }

  async postAddress(
    shopId: number,
    createAddressDto: CreateAddressDto,
    isUpdatingName: boolean,
  ) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        id: createAddressDto.customerId,
      },
      select: {
        id: true,
        name: true,
      },
    });
    const isNameEmpty = !customer.name || customer.name === '';
    if (isNameEmpty && isUpdatingName) {
      await this.prismaService.customer.update({
        where: {
          id: createAddressDto.customerId,
        },
        data: {
          name: createAddressDto.receipient,
        },
      });
    }

    const exisingAddress = await this.prismaService.customerAddress.count({
      where: {
        customerId: createAddressDto.customerId,
      },
    });
    const result = await this.prismaService.customerAddress.create({
      data:
        exisingAddress === 0
          ? { ...createAddressDto, isDefault: true, shopId }
          : { ...createAddressDto, shopId: shopId },
    });
    return result;
  }

  async postCustomer(sellerId: number, phone: string, name: string) {
    const seller = await this.prismaService.seller.findUnique({
      where: {
        id: sellerId,
      },
      select: {
        id: true,
        shopId: true,
      },
    });

    const exisingCustomer = await this.prismaService.customer.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        _count: {
          select: {
            sizeRequest: {
              where: {
                shopId: seller.shopId,
              },
            },
          },
        },
      },
    });

    if (!exisingCustomer) {
      const created = await this.prismaService.customer.create({
        data: {
          phone,
          name,
        },
        select: {
          id: true,
          phone: true,
          name: true,
        },
      });
      return created;
    } else {
      return exisingCustomer;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
