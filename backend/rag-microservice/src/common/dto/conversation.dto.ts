import { IsNumber, IsString } from 'class-validator';

export class ConversationDto {
  @IsNumber()
  id!: number;

  @IsString()
  title!: string;

  @IsString()
  createdAt!: Date;
}
