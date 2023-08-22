import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prismaService: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer';
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

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
