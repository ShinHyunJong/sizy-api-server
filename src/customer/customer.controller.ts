import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '@src/guards/jwt-auth.guard';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('/profile/:customerId')
  findOne(
    @Param('customerId') customerId: number,
    @Query('shopId') shopId: number,
  ) {
    return this.customerService.findOne(customerId, shopId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/detail/:customerId')
  getDetail(@Req() req, @Param('customerId') customerId: number) {
    return this.customerService.getCustomerDetail(req.user.shopId, customerId);
  }
  @Get('/search/:query')
  search(@Param('query') query: string) {
    return this.customerService.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/address/:customerId')
  getAddress(@Req() req, @Param('customerId') customerId: number) {
    return this.customerService.getAddressList(req.user.shopId, customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/address/:customerAddressId')
  updateAddress(
    @Req() req,
    @Param('customerAddressId') customerAddressId: number,
    @Body() body: CreateAddressDto,
  ) {
    return this.customerService.updateAddress(Number(customerAddressId), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/')
  postCustomer(@Req() req, @Body() body: { phone: string; name: string }) {
    return this.customerService.postCustomer(
      req.user.shopId,
      body.phone,
      body.name,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:customerId')
  updateCustomer(
    @Param('customerId') customerId: string,
    @Body() body: { phone: string; name: string },
  ) {
    return this.customerService.updateCustomer(Number(customerId), body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/address')
  postAddress(@Req() req, @Body() body: CreateAddressDto) {
    return this.customerService.postAddress(req.user.shopId, body);
  }
}
