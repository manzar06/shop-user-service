import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { Invite, InviteSchema } from './schemas/invite.schema';  // ✅ Import Invite Schema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]) // ✅ Register Invite Schema
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
