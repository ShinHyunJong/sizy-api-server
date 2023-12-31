import {
  Controller,
  Get,
  Param,
  Query,
  Put,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import { SizeRequestService } from './size-request.service';

@Controller('size-request')
export class SizeRequestController {
  constructor(private readonly sizeRequestService: SizeRequestService) {}

  @Get('/detail/:requestId')
  getSizeRequestDetail(@Param('requestId') requestId: string) {
    return this.sizeRequestService.getSizeRequestDetail(requestId);
  }

  @Get(':shopId')
  findOne(
    @Param('shopId') shopId: number,
    @Query() query: { isComplete: string; take?: number; skip?: number },
  ) {
    return this.sizeRequestService.getSizeRequestList(
      shopId,
      Number(query.skip) || 0,
      Number(query.take) || 20,
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

  @Delete('/:requestId')
  deleteRequest(@Param('requestId') requestId: number) {
    return this.sizeRequestService.deleteSizeRequest(requestId);
  }
}
