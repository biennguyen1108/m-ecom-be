// auth/dto/register.dto.ts
import { IsNotEmpty, IsPhoneNumber, Length } from 'class-validator';


export class RegisterDto {

    @IsNotEmpty()
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    @Length(10, 11, { message: 'Phone number must be between 10 and 11 digits' })
    phoneNumber: string;
  
    @IsNotEmpty()
    @Length(8, undefined, { message: 'Password must be at least 8 characters' })
    password: string;
  }
  