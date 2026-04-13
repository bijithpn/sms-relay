import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  async requestOtp(@Body('phone') phone: string) {
    return this.authService.sendOtp(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; code: string }) {
    return this.authService.verifyOtp(body.phone, body.code);
  }
}
