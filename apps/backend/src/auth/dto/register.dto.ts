import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsAlphanumeric } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @IsAlphanumeric('en-US', { message: 'Solo letras y números' })
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}
