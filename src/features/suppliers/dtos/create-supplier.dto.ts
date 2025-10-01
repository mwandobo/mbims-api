import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateSupplierDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  dateOfBirth: string;
}