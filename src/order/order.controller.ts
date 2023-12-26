import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  Param,
  Put,
  Body,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';
import { UpdateOrderDeliveryDto } from './dto/update-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    return this.orderService.gerOrderList(req.user.shopId);
  }

  @Get('/delivery/:orderId')
  getDeliveryStatus(
    @Param('orderId') orderId: string,
    @Query('parcelCo') parcelCo: string,
    @Query('parcelNo') parcelNo: string,
  ) {
    return this.orderService.getOrderDeliveryStatus(
      orderId,
      parcelCo,
      parcelNo,
    );
  }

  @Delete('/:orderAddressId')
  deleteOrderAddress(@Param('orderAddressId') orderAddressId: number) {
    return this.orderService.deleteOrderAddress(orderAddressId);
  }

  @Put('/delivery/:orderId')
  updateOrderDelivery(
    @Param('orderId') orderId: number,
    @Body()
    body: UpdateOrderDeliveryDto,
  ) {
    return this.orderService.updateOrderAddress(orderId, body);
  }

  @Put('/pickup/:orderId')
  updatePickupStatus(
    @Param('orderId') orderId: number,
    @Body() body: { hasPickedUp: boolean; sellerId: number; notify: boolean },
  ) {
    return this.orderService.updatePickupStatus(
      orderId,
      body.hasPickedUp,
      Number(body.sellerId) || null,
      body.notify ? true : false,
    );
  }
}
