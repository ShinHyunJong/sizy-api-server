import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

import csv from 'csv-parser';
import fs from 'fs';
import { content } from './constants';
import { sendSMS } from './utils/sms';
import { title } from 'process';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}
  getHello(): string {
    return 'Hello Sizy!';
  }

  // async sms() {
  //   const results = [];
  //   fs.createReadStream('viven.csv')
  //     .pipe(csv())
  //     .on('data', (data) => results.push(data))
  //     .on('end', async () => {
  //       const mapped = results.map((x) => {
  //         return {
  //           receipientList: [{ recipientNo: x['받는번호'] }],
  //           title: `${x['받는사람']}님 안녕하세요!`,
  //           message: content(),
  //         };
  //       });

  //       await Promise.all(
  //         mapped.map(async (x) => {
  //           await sendSMS(x.receipientList, x.title, x.message);
  //         }),
  //       );
  //     });
  // }

  async getProductCodeMap(shopId: number) {
    const { brandId } = await this.prismaService.shop.findUnique({
      where: {
        id: shopId,
      },
      select: {
        brandId: true,
      },
    });
    const codeMapList = await this.prismaService.productCodeMap.findMany({
      where: {
        brandId,
      },
    });
    return codeMapList;
  }

  async unionSerach(sellerId: number, query: string) {
    const seller = await this.prismaService.seller.findUnique({
      where: {
        id: sellerId,
      },
      select: {
        shopId: true,
      },
    });

    const result = await this.prismaService.$queryRaw`SELECT 
      RequestItem.id as id, phone, productCode, productSize, comment, count,
      SizeRequest.createdAt as createdAt,
      MATCH(productCode) AGAINST(${query}) as productCodeScore,
      MATCH(productSize) AGAINST(${query}) as productSizeScore,
      MATCH(comment) AGAINST(${query}) as commentScore,
      MATCH(Customer.phone) AGAINST(${query}) as phoneScore
    FROM 
      RequestItem 
      LEFT JOIN SizeRequest ON requestId = SizeRequest.id 
      LEFT JOIN Customer ON customerId = Customer.id 
    WHERE 
      SizeRequest.shopId = ${seller.shopId} AND
      MATCH(
        productCode
      ) AGAINST(${query} IN BOOLEAN mode) 
      OR MATCH(productSize) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(comment) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(Customer.phone) AGAINST(${query} IN BOOLEAN MODE)
    ORDER BY 
    (productCodeScore + productSizeScore + commentScore + phoneScore) DESC,
    phoneScore DESC,
    productCodeScore DESC,
    productSizeScore DESC,
    commentScore DESC,
    createdAt DESC
    `;
    return result;
  }
}
