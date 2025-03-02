import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-shopify';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables

@Injectable()
export class ShopifyStrategy extends PassportStrategy(Strategy, 'shopify') {
  constructor() {
    super({
      clientID: process.env.SHOPIFY_CLIENT_ID,
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
      callbackURL: process.env.SHOPIFY_CALLBACK_URL,
      scope: ['read_products', 'read_orders', 'read_customers'], // Permissions required
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      shop: profile.myshopifyDomain,
      email: profile.email,
      accessToken,
    };
  }
}
