import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule} from '@nestjs/config'; 
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Users } from '../users/entities';

  @Module({
    imports:[
      TypeOrmModule.forFeature([Users]),
      JwtModule.register({
        global:true,
        secret:'123456',
        signOptions:{expiresIn:14400}
      }),
      ConfigModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
  })
export class AuthModule {}

