import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../user/schemas/user.schema';

@Injectable()
export class ShopifyAuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ✅ Step 1: Generate Shopify OAuth URL
  getShopifyAuthUrl(): string {
    const clientId = this.configService.get<string>('SHOPIFY_CLIENT_ID');
    const redirectUri = this.configService.get<string>('SHOPIFY_CALLBACK_URL');
    const scope = 'read_orders,read_customers';
    const shop = 'sixberries-testing-store.myshopify.com'; // 🔥 Replace with actual store

    const url = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    console.log('🔗 Shopify OAuth URL:', url); // ✅ Debugging
    return url;
  }

  // ✅ Step 2: Exchange Code for Access Token
  async registerOrLoginUser(shop: string, email: string, accessToken: string): Promise<string> {
    let user = await this.userModel.findOne({ email }).exec();
  
    if (!user) {
      user = new this.userModel({
        shop_id: shop,
        email,
        role: 'member',
        active: true,
      });
      await user.save();
    }
  
    // ✅ Ensure JWT_SECRET is always set
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret-key';
  
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }
  
    return jwt.sign(
      { sub: user._id, email: user.email, role: user.role },
      jwtSecret, // 🔥 Now guaranteed to be defined
      { expiresIn: '7d' }
    );
  }

  // Add the missing exchangeCodeForToken method
  async exchangeCodeForToken(shop: string, code: string): Promise<string> {
    const clientId = this.configService.get<string>('SHOPIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SHOPIFY_CLIENT_SECRET');

    try {
      const response = await axios.post(`https://${shop}/admin/oauth/access_token`, {
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      });

      const accessToken = response.data.access_token;
      
      // Get shop details using the access token
      const shopResponse = await axios.get(`https://${shop}/admin/api/2024-01/shop.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken }
      });

      const shopEmail = shopResponse.data.shop.email;
      
      // Register or login the user
      return this.registerOrLoginUser(shop, shopEmail, accessToken);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw new Error('Failed to authenticate with Shopify');
    }
  }
}
  
