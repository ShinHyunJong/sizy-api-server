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
    return this.requestItemService.getAllItemCode(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRequestItemDto: CreateRequestItemDto) {
    return this.requestItemService.create(createRequestItemDto);
  }

  @Put()
  update(@Body() updateRequestItemDto: UpdateRequestItemDto[]) {
    return this.requestItemService.update(updateRequestItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.requestItemService.remove(id);
  }
}
