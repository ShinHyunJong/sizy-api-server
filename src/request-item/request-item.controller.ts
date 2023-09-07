import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { RequestItemService } from './request-item.service';
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';

@Controller('request-item')
export class RequestItemController {
  constructor(private readonly requestItemService: RequestItemService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/codes')
  getAllItem(@Req() req) {
    return this.requestItemService.getAllItemCode(req.user.shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search/:code')
  searchCode(@Req() req, @Param('code') code: string) {
    return this.requestItemService.searchCode(req.user.shopId, code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:requestId')
  getRequestItems(@Param('requestId') requestId: number) {
    return this.requestItemService.getRequestItems(requestId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createRequestItemDto: CreateRequestItemDto) {
    return this.requestItemService.create(
      req.user.shopId,
      createRequestItemDto,
    );
  }

  @Put()
  update(@Body() updateRequestItemDto: UpdateRequestItemDto) {
    return this.requestItemService.update(updateRequestItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:itemId')
  updateIsReady(
    @Body() body: { isReady: boolean },
    @Param('itemId') itemId: number,
  ) {
    return this.requestItemService.updateIsReady(itemId, body.isReady);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestItemService.remove(id);
  }
}
