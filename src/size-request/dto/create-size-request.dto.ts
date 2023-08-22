import { IsString } from 'class-validator';

export class CreateSizeRequestDto {
  @IsString()
  readonly phone: string;
}
