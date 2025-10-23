import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { StatusEnum } from '../enums/status.enum';

export class CreateApprovalLevelDto {
  @ApiProperty({ example: 'Finance Approval Level 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Handles initial finance approval process' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-of-user-approval' })
  @IsNotEmpty()
  @IsUUID()
  userApprovalId: string;

  @ApiProperty({ example: 'uuid-of-role' })
  @IsNotEmpty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ example: 'uuid-of-user' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: StatusEnum, example: StatusEnum.PENDING })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
