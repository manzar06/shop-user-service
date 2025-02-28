import { Body, Controller, Get, Param, Patch, Post, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ✅ Import JWT Auth Guard
import { RolesGuard } from '../auth/guards/roles.guard'; // ✅ Import Role-Based Guard

@ApiTags('users')
@ApiBearerAuth() // ✅ Enables JWT authentication in Swagger
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protect `GET /users` with both JWT and Role-Based Guard
  @SetMetadata('role', 'admin') // ✅ Restrict to admins only
  @ApiOperation({ summary: 'Get all active users (Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard) // ✅ Protect `PATCH /users/{id}` (Any authenticated user can update)
  @ApiOperation({ summary: 'Update user role or deactivate user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBody({ schema: {
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
