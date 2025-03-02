import { ConflictException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { Types } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument> // ✅ Inject Invite Model
  ) {}

  // ✅ CREATE - Register User (Only if invited)
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const invite = await this.inviteModel.findOne({ email: createUserDto.email }).exec();

    if (!invite || invite.status !== 'pending') {
      throw new ForbiddenException(`No valid invite found for ${createUserDto.email}`);
    }

    try {
      const newUser = new this.userModel({
        ...createUserDto,
        active: true // ✅ Ensures `active: true` is always set
      });
      const savedUser = await newUser.save();

      // ✅ Mark invite as "completed"
      invite.status = 'completed';
      await invite.save();

      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`Email "${createUserDto.email}" already exists.`);
      }
      throw error;
    }
  }

  // ✅ READ - Get all active users only
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find({ active: true }).exec();
  }

  // ✅ UPDATE - Update user role or deactivate user (soft delete)
  async updateUser(id: string, role?: string, active?: boolean): Promise<User> {
    const updatedFields: Partial<User> = {}; // Fields to update

    if (role) updatedFields.role = role;
    if (active !== undefined) updatedFields.active = active; // ✅ Soft delete

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true } // Return updated document
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  // ✅ INVITE - Send Invite (Admin Only)
  async inviteUser(inviteUserDto: InviteUserDto) {
    const existingInvite = await this.inviteModel.findOne({ email: inviteUserDto.email }).exec();

    if (existingInvite) {
      throw new ConflictException(`An invite already exists for ${inviteUserDto.email}`);
    }

    const invite = new this.inviteModel({ 
      email: inviteUserDto.email, 
      role: inviteUserDto.role 
    });
    return await invite.save();
  }

  // ✅ READ - Get All Invites (Admin Only)
  async getAllInvites() {
    return this.inviteModel.find().exec();
  }

  // ✅ UPDATE - Accept Invite (Changes Status to Completed)
  async acceptInvite(email: string) {
    const invite = await this.inviteModel.findOne({ email }).exec();

    if (!invite) {
      throw new NotFoundException(`No pending invite found for ${email}`);
    }

    invite.status = 'completed';
    return await invite.save();
  }
}
