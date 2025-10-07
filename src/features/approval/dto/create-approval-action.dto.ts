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
  @ApiProperty({ example: 'Finance Approval Action' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'APPROVE' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ example: 'Invoice' })
  @IsNotEmpty()
  @IsString()
  entityName: string;

  @ApiProperty({ example: 'uuid-of-entity' })
  @IsNotEmpty()
  @IsUUID()
  entityId: string;

  @ApiProperty({ example: 'Approve invoice for payment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-of-approval-level' })
  @IsNotEmpty()
  @IsUUID()
  approvalLevelId: string;

  @ApiProperty({ enum: StatusEnum, example: StatusEnum.PENDING })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;
}
