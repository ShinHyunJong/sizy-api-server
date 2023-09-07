import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  IsBoolean,
} from 'class-validator';

import { Type } from 'class-transformer';

class RequestItemDto {
  @IsOptional()
  @IsNumber()
  readonly requestId: number | null | undefined;

  @IsString()
  readonly productCode: string;

  @IsString()
  readonly productSize: string;

  @IsNumber()
  readonly count: number;

  @IsNumber()
  readonly orderCount: number;

  @IsNumber()
  readonly keepCount: number;

  @IsOptional()
  @IsString()
  readonly color: string;

  @IsOptional()
  @IsString()
  readonly comment: string;

  @IsOptional()
  @IsString()
  readonly alterComment: string;
}

export class OrderAddress {
  @IsOptional()
  @IsNumber()
  readonly uniqueId: number | null | undefined;

  @IsOptional()
  @IsString()
  readonly lotAddress: string;

  @IsOptional()
  @IsString()
  readonly roadAddress: string;

  @IsOptional()
  @IsString()
  readonly detailAddress: string;

  @IsOptional()
  @IsString()
  readonly placeName: string;

  @IsOptional()
  @IsString()
  readonly receipient: string;

  @IsOptional()
  @IsString()
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly type: string;

  @IsOptional()
  @IsDateString()
  readonly dueDate: Date;

  @IsOptional()
  @IsString()
  readonly parcelNo: string;

  @IsOptional()
  @IsString()
  readonly parcelCo: string;

  @IsOptional()
  @IsBoolean()
  readonly hasNotied: boolean;
}

export class CreateRequestItemDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  readonly requestItemList: RequestItemDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderAddress)
  readonly orderAddress: OrderAddress;

  @IsOptional()
  @IsNumber()
  readonly customerId: number;

  @IsNumber()
  readonly sellerId: number;
}
