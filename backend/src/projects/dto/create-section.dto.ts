import { IsString, MaxLength } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @MaxLength(255)
  name: string;
}