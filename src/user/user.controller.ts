import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @ApiOperation({ summary: 'Get all active users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Update user role or deactivate user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBody({ schema: {  // ✅ This ensures Swagger shows a Request Body
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['admin', 'member'], example: 'member' },
        active: { type: 'boolean', example: false }
      }
    }
  })
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body('role') role?: string,
    @Body('active') active?: boolean
  ) {
    return this.userService.updateUser(id, role, active);
  }
}
