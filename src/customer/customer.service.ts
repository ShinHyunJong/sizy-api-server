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
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        orderAddressList: true,
        customer: true,
        requestItemList: true,
      },
    });
    return {
      customerDetail,
      requestList,
    };
  }

  async postAddress(shopId: number, createAddressDto: CreateAddressDto) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        id: createAddressDto.customerId,
      },
      select: {
        id: true,
        name: true,
      },
    });

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

  async postCustomer(shopId: number, phone: string, name: string) {
    const exisingCustomer = await this.prismaService.customer.findFirst({
      where: {
        phone,
        shopId,
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

    if (!exisingCustomer) {
      const created = await this.prismaService.customer.create({
        data: {
          phone,
          name,
          shopId,
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

  async updateCustomer(id: number, body: { phone: string; name: string }) {
    const { phone, name } = body;
    const updated = await this.prismaService.customer.update({
      where: {
        id,
      },
      data: {
        phone,
        name,
      },
    });
    return updated;
  }

  async updateAddress(id: number, body: CreateAddressDto) {
    const updated = await this.prismaService.customerAddress.update({
      where: {
        id,
      },
      data: body,
    });
    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
