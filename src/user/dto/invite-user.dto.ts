import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class InviteUserDto {
  @ApiProperty({ example: 'invite@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'member', enum: ['admin', 'member'] })
  @IsEnum(['admin', 'member'])
  @IsNotEmpty()
  role: 'admin' | 'member';
}
