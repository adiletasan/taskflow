import {
  Controller, Post, Req, Res,
  UseGuards, HttpCode, HttpStatus,
  Headers,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  createCheckout(@Req() req: any) {
    return this.billingService.createCheckoutSession(req.user.id, req.user.email);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  createPortal(@Req() req: any) {
    return this.billingService.createPortalSession(req.user.id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: any,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      await this.billingService.handleWebhook(req.rawBody, signature);
      res.json({ received: true });
    } catch {
      res.status(400).json({ error: 'Webhook error' });
    }
  }
}