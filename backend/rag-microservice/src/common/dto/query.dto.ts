import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsNumber()
  conversation_id?: number;
}
