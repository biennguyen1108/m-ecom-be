import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkout } from './entities/checkout.entity';
import { Carts, CartsProducts } from '../carts/entities';
import { Products } from '../products/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Checkout,Carts,CartsProducts,Products])],
  controllers: [CheckoutController],
  providers: [CheckoutService]
})
export class CheckoutModule {}
