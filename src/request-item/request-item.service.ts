import { Injectable } from '@nestjs/common';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class RequestItemService {
  constructor(private prismaService: PrismaService) {}

  async getAllItemCode(sellerId: number) {
    const seller = await this.prismaService.seller.findUnique({
      where: {
        id: sellerId,
      },
      select: {
        shopId: true,
      },
    });
    const codeList = await this.prismaService.requestItem.findMany({
      where: {
        sizeRequest: {
          shopId: seller.shopId,
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

  async create(createRequestItemDto: CreateRequestItemDto) {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        phone: createRequestItemDto.phone,
      },
    });
    if (!customer) {
      await this.prismaService.customer.create({
        data: {
          phone: createRequestItemDto.phone,
          name: createRequestItemDto.name,
        },
      });
    }
    await this.prismaService.requestItem.createMany({
      data: createRequestItemDto.requestItemList,
    });
    return 'created';
  }

  async update(updateRequestItemDto: UpdateRequestItemDto[]) {
    await Promise.all(
      updateRequestItemDto.map(async (x) => {
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
              productCode: x.productCode,
              productSize: x.productSize,
              count: x.count,
              comment: x.comment,
            },
          });
        } else {
          await this.prismaService.requestItem.create({
            data: {
              requestId: x.requestId,
              productCode: x.productCode,
              productSize: x.productSize,
              count: x.count,
              comment: x.comment,
            },
          });
        }
      }),
    );
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
