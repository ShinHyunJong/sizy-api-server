import { Controller, Get, Param, Delete } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerLoginDto } from './dto/login.seller.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}
}
