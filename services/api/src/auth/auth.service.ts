import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendOtp(phone: string) {
    console.log(`Sending OTP to ${phone}...`);
    // In real implementation, use an external SMS gateway (Twilio/MessageBird)
    // for the initial bootstrap OTP since we can't use our own network yet.
    return { message: 'OTP sent successfully', otp: '123456' }; // Mock OTP
  }

  async verifyOtp(phone: string, code: string) {
    if (code !== '123456') throw new Error('Invalid OTP');

    let user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      user = this.userRepository.create({ phone, role: UserRole.USER });
      await this.userRepository.save(user);
    }

    return {
      accessToken: 'mock-jwt-token',
      user,
    };
  }
}
