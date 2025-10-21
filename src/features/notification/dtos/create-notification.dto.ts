import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  forName: string;

  @IsString()
  forId: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsString()
  expiresAt?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  notifiedPersonnelId?: string;

  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  group?: string;
}
