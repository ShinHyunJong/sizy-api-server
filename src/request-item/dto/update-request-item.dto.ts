import { IsNumber, IsOptional, IsString, isNumber } from 'class-validator';

export class UpdateRequestItemDto {
  @IsNumber()
  readonly id: number;

  @IsNumber()
  readonly requestId: number;

  @IsString()
  readonly productCode: string;

  @IsString()
  readonly productSize: string;

  @IsNumber()
  readonly count: number;

  @IsOptional()
  @IsString()
  readonly comment: string;
}
