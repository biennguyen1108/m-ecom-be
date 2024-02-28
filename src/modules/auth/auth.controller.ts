// auth/auth.controller.ts
import { Controller, Post, Body,ValidationPipe ,UsePipes, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  login(@Body() loginUserDto:LoginDto):Promise<any> {
      return this.authService.login(loginUserDto);
  }

  
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  
  @Post('refresh')
    refreshToken(@Body() {refreshToken}):Promise<any>{
        return this.authService.refreshToken(refreshToken);
    }
}
