import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get('/sms')
  // sms() {
  //   return this.appService.sms();
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  unionSerach(@Req() req, @Query('query') query: string) {
    return this.appService.unionSerach(req.user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/code-map')
  getCodeMap(@Req() req) {
    return this.appService.getProductCodeMap(req.user.shopId);
  }
}
