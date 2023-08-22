import { PartialType } from '@nestjs/mapped-types';
import { CreateSizeRequestDto } from './create-size-request.dto';

export class UpdateSizeRequestDto extends PartialType(CreateSizeRequestDto) {}
