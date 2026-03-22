import { IsNumber } from 'class-validator';

export class ReorderTaskDto {
  @IsNumber()
  order: number;
}