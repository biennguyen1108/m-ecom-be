import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {

    constructor(private readonly paymentService: PaymentService){}

    @Get()
    async findAllPayments() {
      return this.paymentService.findAll();
    }
  
    @Get(':id')
    async findPaymentById(@Param('id') id: number) {
      return this.paymentService.findOne(id);
    }
  
}
