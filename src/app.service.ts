import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { getLatestCommit } from './utils/git';
import { sendInquiryApi } from './utils/slack';

// import csv from 'csv-parser';
// import fs from 'fs';
// import { content } from './constants';
// import { sendSMS } from './utils/sms';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}
  getHello(): string {
    return `Hello Sizy, Client:latest:${getLatestCommit()}`;
  }

  async getClientCommit() {
    const commit = await getLatestCommit();
    return commit;
  }

  async postInquiry(brand: string, phone: string, text: string) {
    await sendInquiryApi(brand, phone, text);
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

  async unionSerach(shopId: number, query: string) {
    const result: any[] = await this.prismaService.$queryRaw`SELECT 
      RequestItem.id as id, phone, productCode, productSize, comment, count, alterComment,
      SizeRequest.shopId, Customer.name, Customer.id as customerId,
      SizeRequest.createdAt as createdAt,
      MATCH(productCode) AGAINST(${query}) as productCodeScore,
      MATCH(productSize) AGAINST(${query}) as productSizeScore,
      MATCH(comment) AGAINST(${query}) as commentScore,
      MATCH(alterComment) AGAINST(${query}) as alterScore,
      MATCH(Customer.phone) AGAINST(${query}) as phoneScore,
      MATCH(Customer.name) AGAINST(${query}) as nameScore
    FROM 
      RequestItem 
      LEFT JOIN SizeRequest ON requestId = SizeRequest.id 
      LEFT JOIN Customer ON customerId = Customer.id 
    WHERE 
      SizeRequest.shopId = ${shopId} AND
      MATCH(
        productCode
      ) AGAINST(${query} IN BOOLEAN mode) 
      OR MATCH(productSize) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(comment) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(alterComment) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(Customer.phone) AGAINST(${query} IN BOOLEAN MODE)
      OR MATCH(Customer.name) AGAINST(${query} IN BOOLEAN MODE)
    ORDER BY 
    createdAt DESC,
    (productCodeScore + productSizeScore + commentScore + phoneScore) DESC,
    phoneScore DESC,
    productCodeScore DESC,
    productSizeScore DESC,
    commentScore DESC
    `;

    const filtered = result.filter((x) => Number(x.shopId) === shopId);
    return filtered;
  }
}
