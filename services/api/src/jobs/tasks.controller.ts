import { BadRequestException, Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SMSTask } from '../entities/sms_task.entity';
import { SMSTaskStatus } from '../entities/enums';

type CreateTaskBody = {
  recipient?: string;
  message?: string;
  status?: SMSTaskStatus;
};

type CreateBulkTasksBody = {
  recipients?: string[];
  message?: string;
};

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

  @Get('pending')
  findPending() {
    return this.tasksRepository.find({
      where: { status: SMSTaskStatus.PENDING },
      relations: ['device'],
      order: { createdAt: 'ASC' },
      take: 10,
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
  create(@Body() task: CreateTaskBody) {
    const recipient = this.normalizeRecipient(task.recipient);
    const message = task.message?.trim();

    if (!recipient) {
      throw new BadRequestException('Recipient phone number is required');
    }
    if (!message) {
      throw new BadRequestException('Message is required');
    }

    const newTask = this.tasksRepository.create({
      recipient,
      message,
      status: task.status || SMSTaskStatus.PENDING,
    });

    return this.tasksRepository.save(newTask);
  }

  @Post('bulk')
  async createBulk(@Body() body: CreateBulkTasksBody) {
    const recipients = [...new Set((body.recipients || []).map((item) => this.normalizeRecipient(item)).filter(Boolean))];
    const message = body.message?.trim();

    if (!recipients.length) {
      throw new BadRequestException('At least one recipient phone number is required');
    }
    if (!message) {
      throw new BadRequestException('Message is required');
    }

    const tasks = this.tasksRepository.create(
      recipients.map((recipient) => ({
        recipient,
        message,
        status: SMSTaskStatus.PENDING,
      })),
    );

    const saved = await this.tasksRepository.save(tasks);

    return {
      created: saved.length,
      taskIds: saved.map((task) => task.id),
    };
  }

  @Patch('pending/mark-sent')
  async markPendingSent(@Body() body: { ids?: string[] }) {
    const ids = body.ids || [];
    if (!ids.length) {
      throw new BadRequestException('Task ids are required');
    }

    await this.tasksRepository.update({ id: In(ids) }, { status: SMSTaskStatus.SENT });
    return { updated: ids.length };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() update: Partial<Pick<SMSTask, 'status' | 'retryCount' | 'jobId'>>) {
    const allowedStatuses = Object.values(SMSTaskStatus);
    if (update.status && !allowedStatuses.includes(update.status)) {
      throw new BadRequestException('Invalid task status');
    }

    await this.tasksRepository.update(id, update);
    return this.tasksRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }

  private normalizeRecipient(value?: string) {
    return value?.trim().replace(/[^\d+]/g, '') || '';
  }
}
