import { IsEmail, IsString } from 'class-validator';

export class SellerLoginDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
