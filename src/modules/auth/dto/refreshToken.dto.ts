import { IsNotEmpty } from 'class-validator';

export class RefreshTokensDto {
  @IsNotEmpty()
  refreshToken: string;
}
