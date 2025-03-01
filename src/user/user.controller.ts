import { 
  Body, 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Post, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Create a new user (Must be invited first)
  @ApiOperation({ summary: 'Create a new user (Requires Invite)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // ✅ Get all active users (Admin Only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all active users (Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of active users' })
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ✅ Invite a user (Admin Only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Invite a new user (Admin Only)' })
  @ApiResponse({ status: 201, description: 'User invited successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'newuser@example.com' },
        role: { type: 'string', enum: ['admin', 'member'], example: 'member' }
      }
    }
  })
  @Post('invite')
  async inviteUser(@Body() inviteUserDto: InviteUserDto) {
    return this.userService.inviteUser(inviteUserDto);
  }

  // ✅ Get all invitations (Admin Only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all user invites (Admin Only)' })
  @ApiResponse({ status: 200, description: 'List of invites' })
  @Get('invites')
  async getAllInvites() {
    return this.userService.getAllInvites();
  }

  // ✅ Update user role or deactivate user
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user role or deactivate user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiBody({
    schema: {
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
