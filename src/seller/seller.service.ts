import { Injectable } from '@nestjs/common';

@Injectable()
export class SellerService {
  remove(id: number) {
    return `This action removes a #${id} seller`;
  }
}
