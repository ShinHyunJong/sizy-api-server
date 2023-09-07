import { IsNumber, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  readonly requestId: number;

  @IsOptional()
  @IsNumber()
  readonly orderAddressId: number;
}
