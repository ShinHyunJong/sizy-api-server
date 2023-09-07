import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  readonly customerId: number;

  @IsString()
  readonly lotAddress: string;

  @IsString()
  readonly roadAddress: string;

  @IsString()
  readonly detailAddress: string;

  @IsString()
  readonly placeName: string;

  @IsString()
  readonly buildingName: string;

  @IsString()
  readonly receipient: string;

  @IsString()
  readonly phone: string;

  @IsOptional()
  @IsBoolean()
  readonly isDefault: boolean;
}
