import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';

@Controller('devices')
export class DevicesController {
  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  @Get()
  findAll() {
    return this.devicesRepository.find();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesRepository.findOneBy({ id });
  }

  @Post()
  create(@Body() device: Partial<Device>) {
    const newDevice = this.devicesRepository.create(device);
    return this.devicesRepository.save(newDevice);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update: Partial<Device>) {
    return this.devicesRepository.update(id, update);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesRepository.delete(id);
  }
}
