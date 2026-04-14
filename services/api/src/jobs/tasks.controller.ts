import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMSTask } from '../entities/sms_task.entity';
import { SMSTaskStatus } from '@sms-relay/types';

@Controller('tasks')
export class TasksController {
  constructor(
    @InjectRepository(SMSTask)
    private tasksRepository: Repository<SMSTask>,
  ) {}

  @Get('summary')
  async getSummary() {
    const total = await this.tasksRepository.count();
    const delivered = await this.tasksRepository.count({ where: { status: SMSTaskStatus.DELIVERED } });
    const failed = await this.tasksRepository.count({ where: { status: SMSTaskStatus.FAILED } });
    const pending = await this.tasksRepository.count({ where: { status: SMSTaskStatus.PENDING } });
    
    // Get last 10 tasks for the table
    const recentTasks = await this.tasksRepository.find({
      relations: ['device'],
      order: { createdAt: 'DESC' },
      take: 10
    });

    return {
      stats: {
        total,
        delivered,
        failed,
        pending
      },
      recentTasks
    };
  }

  @Get()
  findAll() {
    return this.tasksRepository.find({
      relations: ['device'],
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }

  @Post()
  create(@Body() task: Partial<SMSTask>) {
    const newTask = this.tasksRepository.create(task);
    return this.tasksRepository.save(newTask);
  }
}
