import { Controller, Get, Post, Body, Param, Patch, Delete, BadRequestException, ParseUUIDPipe, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { DeviceStatus } from '../entities/enums';

@Controller('devices')
export class DevicesController {
  private readonly logger = new Logger(DevicesController.name);

  constructor(
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
  ) {}

  @Get()
  async findAll() {
    try {
      this.logger.log('Fetching active devices...');
      const activeThreshold = 60 * 1000; // 1 minute
      const now = new Date();
      
      // Get all online devices - being explicit with status to avoid enum issues
      const devices = await this.devicesRepository.find({
        where: { status: DeviceStatus.ONLINE },
        order: { lastSeen: 'DESC' }
      });

      this.logger.log(`Found ${devices.length} online devices in DB`);

      // Filter in memory for safety with different DB date formats
      const activeDevices = devices.filter(device => {
        if (!device.lastSeen) return false;
        const diff = now.getTime() - new Date(device.lastSeen).getTime();
        return diff < activeThreshold;
      });

      this.logger.log(`Returning ${activeDevices.length} truly active devices`);
      return activeDevices;
    } catch (e: any) {
      this.logger.error(`Devices findAll failed: ${e.message}`, e.stack);
      // Return empty array instead of 500 if DB is briefly busy
      return [];
    }
  }

  @Post('sync')
  async sync(@Body() body: { 
    gateway_id: string; 
    public_url?: string; 
    status?: string;
    phone_number?: string;
    sim_operator?: string;
  }) {
    return this.syncInternal(body);
  }

  @Post('/register-device')
  async registerDevice(@Body() body: { 
    gateway_id: string; 
    public_url?: string; 
    status?: string;
    phone_number?: string;
    sim_operator?: string;
  }) {
    return this.syncInternal(body);
  }

  private async syncInternal(body: { 
    gateway_id: string; 
    public_url?: string; 
    status?: string;
    phone_number?: string;
    sim_operator?: string;
  }) {
    if (!body.gateway_id) {
      throw new BadRequestException('gateway_id is required');
    }

    let device = await this.devicesRepository.findOneBy({ gatewayId: body.gateway_id });

    if (!device) {
      device = this.devicesRepository.create({
        gatewayId: body.gateway_id,
      });
    }

    device.publicUrl = body.public_url;
    device.status = body.status === 'online' ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
    device.lastSeen = new Date();
    
    if (body.phone_number) device.phoneNumber = body.phone_number;
    if (body.sim_operator) device.simOperator = body.sim_operator;

    return this.devicesRepository.save(device);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.devicesRepository.findOneBy({ id });
  }

  @Post()
  create(@Body() device: Partial<Device>) {
    const newDevice = this.devicesRepository.create(device);
    return this.devicesRepository.save(newDevice);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() update: Partial<Device>) {
    return this.devicesRepository.update(id, update);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.devicesRepository.delete(id);
  }
}
