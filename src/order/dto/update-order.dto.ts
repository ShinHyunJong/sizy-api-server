import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDeliveryDto {
  @IsOptional()
  @IsString()
  readonly parcelCo: string;

  @IsOptional()
  @IsString()
  readonly parcelNo: string;

  @IsBoolean()
  readonly hasNotied: boolean;
}
