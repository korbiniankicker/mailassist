import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  username!: string;
  @IsString()
  password!: string;
  @IsOptional()
  @IsString()
  imapHost?: string;
  @IsOptional()
  @IsNumber()
  imapPort?: number;
  @IsOptional()
  @IsString()
  imapUser?: string;
  @IsOptional()
  @IsString()
  imapPass?: string;
  @IsOptional()
  @IsBoolean()
  imapSecure?: boolean;
}
