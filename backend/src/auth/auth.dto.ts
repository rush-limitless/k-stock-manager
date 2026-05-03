import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jean@kstock.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'jean@kstock.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  password: string;
}
