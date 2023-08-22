import {
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class RequestItemDto {
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

  @IsString()
  readonly comment: string;
}

export class CreateRequestItemDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestItemDto)
  readonly requestItemList: RequestItemDto[];

  @IsOptional()
  @IsString()
  readonly phone: string;

  @IsOptional()
  @IsString()
  readonly name: string;
}
