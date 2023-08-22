import { Controller, Get, Param, Query, Put, Body, Post } from '@nestjs/common';
import { SizeRequestService } from './size-request.service';

@Controller('size-request')
export class SizeRequestController {
  constructor(private readonly sizeRequestService: SizeRequestService) {}

  @Get(':shopId')
  findOne(
    @Param('shopId') shopId: number,
    @Query() query: { isComplete: string },
  ) {
    return this.sizeRequestService.getSizeRequestList(
      shopId,
      query.isComplete === 'true',
    );
  }

  @Post('/pre/:shopId')
  prePostRequest(
    @Param('shopId') shopId: number,
    @Body() body: { phone: string },
  ) {
    return this.sizeRequestService.prePostSizeRequest(shopId, body);
  }

  @Post('/first/:shopId')
  postRequest(
    @Param('shopId') shopId: number,
    @Body() body: { phone: string; marketingAgree: boolean },
  ) {
    return this.sizeRequestService.postSizeRequest(shopId, body);
  }

  @Put('/seller/:requestId')
  updateSellar(
    @Param('requestId') requestId: number,
    @Body() sellerId: number,
  ) {
    return this.sizeRequestService.updateSellar(requestId, sellerId);
  }
}
