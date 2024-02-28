import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path'; // Import module path
import { CartsModule } from './modules/carts/carts.module';
import { CategoryModule } from './modules/category/category.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductsModule } from './modules/products/products.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FirebaseController } from './modules/firebase/firebase.controller';
import { FirebaseService } from './modules/firebase/firebase.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './modules/auth/strategies/google.strategy';
import * as redisStore from 'cache-manager-redis-store';



@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST, 
      port: parseInt(process.env.REDIS_PORT),
      auth_pass: process.env.REDIS_PASS, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: configService.get('PG_PORT'),
        username: configService.get('PG_USER'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DB'),

        entities:  [path.join(__dirname, '**', '*.entity{.ts,.js}')],
        synchronize: true,
        isGlobal: true,
      }),
      inject: [ConfigService], 
    }),
    CartsModule,
    CategoryModule,
    CheckoutModule,
    PaymentModule,
    ProductsModule,
    RolesModule,
    UsersModule,
    AuthModule
  
  ],
  controllers: [FirebaseController],
  providers: [FirebaseService ,GoogleStrategy,],
})
export class AppModule {
  
}