import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsProducts } from './entities/carts_products.entity';
import { Carts } from './entities/carts.entity';
import { CartsController } from './carts.controller';
import { Products } from '../products/entities';
import { Users } from '../users/entities';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [TypeOrmModule.forFeature([Carts,CartsProducts,Products,Users]),
  ConfigModule],
  controllers: [CartsController],
  providers: [CartsService]
})
export class CartsModule {}
