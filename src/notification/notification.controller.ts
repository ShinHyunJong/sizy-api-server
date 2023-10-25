import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @UseGuards(JwtAuthGuard)
  @Get('/')
  getNotificationList(@Req() req) {
    return this.notificationService.getNotificationList(req.user.shopId);
  }

  @Get('/delivery/:notificationId')
  getDeliveryStatus(@Param('notificationId') notificationId: string) {
    return this.notificationService.getOrderDeliveryStatus(notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req,
    @Body() createNotificationDto: CreateNotificationDto,
    @Query('type') type = 'shipment',
  ) {
    return this.notificationService.create(createNotificationDto, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/dummy')
  createDummy(
    @Req() req,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationService.postDummyNotification(
      createNotificationDto,
    );
  }
}
