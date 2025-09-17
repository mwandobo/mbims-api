import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  dateOfBirth: string;
}