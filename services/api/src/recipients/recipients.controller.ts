import { Body, Controller, Delete, Get, Param, Post, Query, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Recipient } from '../entities/recipient.entity';

@Controller('recipients')
export class RecipientsController {
  constructor(
    @InjectRepository(Recipient)
    private repository: Repository<Recipient>,
  ) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      return this.repository.find({
        where: [
          { name: Like(`%${search}%`) },
          { phoneNumber: Like(`%${search}%`) },
        ],
        order: { name: 'ASC' },
      });
    }
    return this.repository.find({ order: { name: 'ASC' } });
  }

  @Post()
  async create(@Body() data: { name: string; phoneNumber: string }) {
    if (!data.name || !data.phoneNumber) {
      throw new BadRequestException('Name and phone number are required');
    }
    
    // Normalize phone number: trim and ensure it starts with +91 if needed (but user requested +91 default)
    let phone = data.phoneNumber.trim();
    if (!phone.startsWith('+')) {
      phone = phone.startsWith('91') ? `+${phone}` : `+91${phone}`;
    }

    const recipient = this.repository.create({
      name: data.name,
      phoneNumber: phone,
    });
    
    return this.repository.save(recipient);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.repository.delete(id);
    return { success: true };
  }
}
