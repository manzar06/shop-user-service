import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  shop_id: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(['admin', 'member']) // ✅ Ensures valid role values
  role: 'admin' | 'member';

  @IsNotEmpty()
  password: string;
}
