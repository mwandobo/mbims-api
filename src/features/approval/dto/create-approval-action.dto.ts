import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '../enums/status.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateApprovalActionDto {
  @IsString()
  name: string;

  @IsString()
  action: string;

  @IsString()
  entityName: string;

  extraData1: any;

  @IsString()
  entityCreatorId: string;

  @IsUUID()
  entityId: string;

  @IsOptional()
  @IsUUID()
  redirectUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsUUID()
  approvalLevelId: string;

  @ApiProperty({ enum: StatusEnum, example: StatusEnum.PENDING })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
