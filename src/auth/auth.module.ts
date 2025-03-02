import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ Import ConfigModule
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ShopifyAuthController } from './shopify-auth.controller'; // ✅ Import ShopifyAuthController
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ShopifyStrategy } from './strategies/shopify.strategy';
import { PassportModule } from '@nestjs/passport';
import { ShopifyAuthService } from './services/shopify-auth.service'; // ✅ Import ShopifyAuthService

@Module({
  imports: [
    ConfigModule.forRoot(), // ✅ Ensure environment variables are available
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'a3faea43b18d122af7bb8b3795823c02420130d12ced17852ec4fc16b4962bd3',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, ShopifyAuthService, JwtStrategy, ShopifyStrategy], // ✅ Add ShopifyAuthService
  controllers: [AuthController, ShopifyAuthController], // ✅ Add ShopifyAuthController
})
export class AuthModule {}
