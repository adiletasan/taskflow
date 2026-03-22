import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}