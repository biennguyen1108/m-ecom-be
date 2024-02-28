import { Body, Controller, Get, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { createCheckoutDto } from './dto/createCheckoutDto.dto';
import { saveDataDto } from './dto/saveData.dto';

@Controller('checkout')
export class CheckoutController {
    constructor(private readonly checkoutService: CheckoutService){}

    
    @Get()
    async findAll() {
      return this.checkoutService.findAll();
    }
  


  @Post('generateQRCode')
  async generateQRCode(@Body()  checkoutDto:  createCheckoutDto): Promise<any> {
    return this.checkoutService.generateQRCode(checkoutDto);
  }

  @Post('savedata')
  async saveData(@Body()  saveDataDto:  saveDataDto): Promise<any> {
    return this.checkoutService.saveData(saveDataDto);
  }

}