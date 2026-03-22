import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateLabelDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;
}