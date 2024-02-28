import { Injectable, ConflictException, NotFoundException, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Users } from '../users/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { successException } from '../Exception/succesExeption';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  
  async findOneByPhoneNumber(phoneNumber: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }
  
  async register(registerDto: RegisterDto): Promise<Users> {
    const { phoneNumber, password } = registerDto;
    const existingUser = await this.usersRepository.findOne({
      where: { phoneNumber },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.usersRepository.create({
      phoneNumber,
      password: hashedPassword,
      status: 'active',
      role: { id: 1, nameRole: 'user' },
    });
    return await this.usersRepository.save(newUser);
  }

  async logout(logoutDto: LogoutDto): Promise<void> {
    const { refreshToken } = logoutDto;
    const user = await this.usersRepository.findOne({ where: { refreshToken } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.refreshToken = null;
    await this.usersRepository.save(user);
    throw new successException('Successful Logout');
  }
  
  async refreshToken(refreshToken: string): Promise<any> {
    const decodedRefreshToken: any = this.jwtService.decode(refreshToken);
    if (!decodedRefreshToken) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
    const user = await this.usersRepository.findOne({
      where: { id: decodedRefreshToken.sub, refreshToken },
      relations: ['role'],
    });
    if (!user) {
      throw new HttpException('Refresh token is not valid', HttpStatus.BAD_REQUEST);
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const refreshTokenExp = decodedRefreshToken.exp;
    if (refreshTokenExp < currentTime) {
      user.refreshToken = null;
      await this.usersRepository.save(user); // Cập nhật refreshToken thành null trong cơ sở dữ liệu
      throw new HttpException('Refresh token is expired', HttpStatus.BAD_REQUEST);
    }
    const accessToken = await this.generateAccessToken(user);
    return { accessToken};
  }
  
  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber: loginDto.phoneNumber })
      .getOne();
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const refreshToken = await this.generateRefreshToken();
    user.refreshToken = refreshToken; // Update user's refreshToken
    await this.usersRepository.save(user);
  
    const accessToken = await this.generateAccessToken(user); // Use the updated refreshToken here
    return { accessToken, refreshToken };
  }
  
  private async generateAccessToken(user: Users): Promise<string> {
    if (!user.role || !user.role.nameRole) {
      throw new Error('User role information is missing');
    }
    const payload = { id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      role: user.role.nameRole,
      refreshToken: user.refreshToken,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_ACCESS_TOKEN'),
    });
    return accessToken;
  }

  private async generateRefreshToken(): Promise<string> {
    const refreshToken= await this.jwtService.signAsync({}, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('EXP_IN_REFRESH_TOKEN'),
    });
    return refreshToken;
  }
}