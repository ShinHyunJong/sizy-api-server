import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}
  getHello(): string {
    return 'Hello Sizy!';
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
