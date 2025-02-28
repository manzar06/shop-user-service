import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config(); // ✅ Load environment variables

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret', // ✅ Ensure it's always a string
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.role) {
      throw new UnauthorizedException('Invalid token: Role is missing');
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
