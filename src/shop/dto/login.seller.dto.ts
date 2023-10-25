import { IsEmail, IsString } from 'class-validator';

export class ShopLoginDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
