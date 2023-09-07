import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaService } from '@src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService, PrismaService, JwtService],
})
export class CustomerModule {}
