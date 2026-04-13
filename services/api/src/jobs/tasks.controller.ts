import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMSTask } from '../entities/sms_task.entity';

@Controller('tasks')
export class TasksController {
  constructor(
    @InjectRepository(SMSTask)
    private tasksRepository: Repository<SMSTask>,
  ) {}

  @Get()
  findAll() {
    return this.tasksRepository.find({
      relations: ['device'],
      order: { createdAt: 'DESC' },
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
