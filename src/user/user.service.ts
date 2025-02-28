import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // ✅ CREATE - Handle Duplicate Email Error
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel({
        ...createUserDto,
        active: true // ✅ Ensures `active: true` is always set
      });
      return await newUser.save();
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
}
