import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  generate(@Body() body: { phoneNumber: string, length?: number }) {
    return this.otpService.generate(body.phoneNumber, body.length);
  }

  @Post('verify')
  verify(@Body() body: { phoneNumber: string, code: string }) {
    return this.otpService.verify(body.phoneNumber, body.code);
  }
}
