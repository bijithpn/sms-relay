import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OtpService } from './otp.service';

@ApiTags('OTP Verification')
@ApiBearerAuth('x-admin-secret')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiOperation({ summary: 'Generate OTP', description: 'Generates a secure random code and dispatches it via SMS.' })
  @Post('generate')
  generate(@Body() body: { phoneNumber: string, length?: number }) {
    return this.otpService.generate(body.phoneNumber, body.length);
  }

  @ApiOperation({ summary: 'Verify OTP', description: 'Validates a user-provided code against the hashed record.' })
  @Post('verify')
  verify(@Body() body: { phoneNumber: string, code: string }) {
    return this.otpService.verify(body.phoneNumber, body.code);
  }
}
