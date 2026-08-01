import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class EmailCredentialsDto {
  @IsString()
  host!: string;

  @IsInt()
  port!: number;

  @IsString()
  username!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsBoolean()
  secure?: boolean;
}
