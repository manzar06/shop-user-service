import { Controller, Get, Query, Res, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { ShopifyAuthService } from './services/shopify-auth.service';
import { ApiOperation, ApiResponse, ApiQuery, ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('auth/shopify')
export class ShopifyAuthController {
  constructor(
    private readonly shopifyAuthService: ShopifyAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Start Shopify OAuth flow',
    description: 'Returns a Shopify authorization URL. Open this URL in a browser to start the OAuth flow.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns Shopify OAuth URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Shopify authorization URL to redirect the user to'
        }
      }
    }
  })
  async redirectToShopify(@Req() req: Request, @Res() res: Response) {
    const shopifyAuthUrl = this.shopifyAuthService.getShopifyAuthUrl();
    
    // Check if request is from Swagger UI or browser
    const isSwagger = req.headers['sec-fetch-mode'] === 'cors' || 
                     req.headers.accept?.includes('application/json');
    
    if (isSwagger) {
      return res.json({ url: shopifyAuthUrl });
    }
    
    return res.redirect(shopifyAuthUrl);
  }

  @Get('callback')
  @ApiExcludeEndpoint() // This hides the endpoint from Swagger UI
  async handleShopifyCallback(
    @Query('code') code: string,
    @Query('shop') shop: string,
    @Res() res: Response
  ) {
    if (!code || !shop) {
      return res.status(400).json({ error: 'Invalid request: missing code or shop' });
    }

    try {
      const token = await this.shopifyAuthService.exchangeCodeForToken(shop, code);
      // You might want to redirect to your frontend with the token
      return res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Callback error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }
}
