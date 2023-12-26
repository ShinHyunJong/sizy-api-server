import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Post,
  Body,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/commit/client')
  getClientCommit() {
    return this.appService.getClientCommit();
  }

  @Post('/inquiry')
  postInquiry(@Body() body: { brand: string; phone: string; text: string }) {
    return this.appService.postInquiry(body.brand, body.phone, body.text);
  }

  // @Get('/sms')
  // sms() {
  //   return this.appService.sms();
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  unionSerach(@Req() req, @Query('query') query: string) {
    return this.appService.unionSerach(req.user.shopId, query);
  }

  @Get('/code-map')
  getCodeMap(@Query() query: { shopId: string }) {
    return this.appService.getProductCodeMap(Number(query.shopId));
  }
}
