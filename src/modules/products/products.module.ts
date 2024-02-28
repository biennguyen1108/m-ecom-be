import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Category } from '../category/entities';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Products,Category]),
ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
