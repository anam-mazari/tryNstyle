import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { getStripeFrontendBaseUrl } from 'src/core/config/stripe.config';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'OK';
  }

  /**
   * Stripe sometimes redirects to FRONTEND_URL; if that matched the API port, the browser hit Nest.
   * Redirect to the real Next.js origin (query string preserved).
   */
  @Get('checkout/success')
  redirectCheckoutSuccess(
    @Req() req: Request,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ): void {
    const base = getStripeFrontendBaseUrl();
    const frontend = new URL(base);
    const apiHost = req.get('host') ?? '';
    if (frontend.host === apiHost) {
      throw new BadRequestException(
        'FRONTEND_URL must be your Next.js app URL, not the API. Example: set FRONTEND_URL=http://localhost:3001 when the API runs on port 3000, restart Nest, and start a new Stripe checkout.',
      );
    }
    const qs = new URLSearchParams(query).toString();
    res.redirect(302, `${base}/checkout/success${qs ? `?${qs}` : ''}`);
  }

  @Get('checkout/cancel')
  redirectCheckoutCancel(@Req() req: Request, @Res() res: Response): void {
    const base = getStripeFrontendBaseUrl();
    const frontend = new URL(base);
    const apiHost = req.get('host') ?? '';
    if (frontend.host === apiHost) {
      throw new BadRequestException(
        'FRONTEND_URL must be your Next.js app URL, not the API. Set FRONTEND_URL and restart the server.',
      );
    }
    res.redirect(302, `${base}/checkout/cancel`);
  }
}
