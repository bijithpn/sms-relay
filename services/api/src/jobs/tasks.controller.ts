import { BadRequestException, Body, Controller, Get, Param, Patch, Post, ParseUUIDPipe, Sse, MessageEvent, OnModuleInit, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { SpamPolicy } from '../entities/spam_policy.entity';
import { Observable, interval, switchMap, map, from } from 'rxjs';
import { SMSTask } from '../entities/sms_task.entity';
import { SMSTaskStatus, DeviceStatus } from '../entities/enums';
import { Device } from '../entities/device.entity';
import { TasksService } from './tasks.service';

type CreateTaskBody = {
  recipient?: string;
  message?: string;
  status?: SMSTaskStatus;
};

type CreateBulkTasksBody = {
  recipients?: string[];
  message?: string;
};

@ApiTags('SMS Tasks')
@ApiBearerAuth('x-admin-secret')
@Controller('tasks')
export class TasksController implements OnModuleInit {
  constructor(
    @InjectRepository(SMSTask)
    private tasksRepository: Repository<SMSTask>,
    @InjectRepository(Device)
    private devicesRepository: Repository<Device>,
    @InjectRepository(SpamPolicy)
    private spamPolicyRepository: Repository<SpamPolicy>,
    private readonly tasksService: TasksService,
  ) {}

  @ApiOperation({ summary: 'Get security policy' })
  @Get('spam-policy')
  async getPolicy() {
    let policy = await this.spamPolicyRepository.findOne({ where: { type: 'GLOBAL' } });
    if (!policy) {
      policy = this.spamPolicyRepository.create({ type: 'GLOBAL' });
      await this.spamPolicyRepository.save(policy);
    }
    return policy;
  }

  @ApiOperation({ summary: 'Update security policy' })
  @Patch('spam-policy')
  async updatePolicy(@Body() update: Partial<SpamPolicy>) {
    const policy = await this.getPolicy();
    await this.spamPolicyRepository.update(policy.id, update);
    return this.getPolicy();
  }

  onModuleInit() {
    // Start background queue processor
    setInterval(() => this.processPendingTasks(), 5000);
  }

  private async processPendingTasks() {
    try {
      const pendingTasks = await this.tasksRepository.find({
        where: { status: SMSTaskStatus.PENDING },
        take: 10,
        order: { createdAt: 'ASC' }
      });

      if (!pendingTasks.length) return;

      const staleThreshold = new Date(Date.now() - 1 * 60 * 1000);
      const devices = await this.devicesRepository.manager.getRepository(Device).createQueryBuilder('device')
        .where('device.status = :status', { status: DeviceStatus.ONLINE })
        .andWhere('device.lastSeen > :threshold', { threshold: staleThreshold })
        .orderBy('device.lastSeen', 'DESC')
        .getMany();

      const device = devices.find(d => d.publicUrl);
      if (!device) return; // No active device to process tasks

      for (const task of pendingTasks) {
        console.log(`[Queue] Processing pending task ${task.id} via device ${device.id}`);
        // Assign device to task if not already assigned
        if (!task.device) {
          task.device = device;
        }
        task.retryCount = (task.retryCount || 0) + 1;
        task.status = SMSTaskStatus.QUEUED;
        await this.tasksRepository.save(task);

        await this.tasksService.sendToDevice(device, task);
      }
    } catch (e) {
      console.error('[Queue] Error processing tasks:', e);
    }
  }

  @ApiOperation({ summary: 'Stream tasks events (SSE)' })
  @Sse('events')
  streamEvents(): Observable<MessageEvent> {
    return interval(2000).pipe(
      switchMap(() => from(this.getSummary())),
      map((summary) => ({
        data: summary,
      } as MessageEvent)),
    );
  }

  @ApiOperation({ summary: 'Get messaging summary stats' })
  @Get('summary')
  async getSummary() {
    const total = await this.tasksRepository.count();
    const delivered = await this.tasksRepository.count({ where: { status: SMSTaskStatus.DELIVERED } });
    const failed = await this.tasksRepository.count({ where: { status: SMSTaskStatus.FAILED } });
    const pending = await this.tasksRepository.count({ where: { status: In([SMSTaskStatus.PENDING, SMSTaskStatus.QUEUED]) } });
    
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
  findAll(@Query('status') status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.tasksRepository.find({
      where,
      relations: ['device'],
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  @ApiOperation({ summary: 'Get pending tasks' })
  @Get('pending')
  findPending() {
    return this.tasksRepository.find({
      where: { status: SMSTaskStatus.PENDING },
      relations: ['device'],
      order: { createdAt: 'ASC' },
      take: 10,
    });
  }

  @ApiOperation({ summary: 'Get task by ID' })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasksRepository.findOne({
      where: { id },
      relations: ['device'],
    });
  }

  @ApiOperation({ summary: 'Send single SMS' })
  @Post()
  async create(@Body() task: CreateTaskBody) {
    return this.createTaskInternal(task);
  }

  @Post('/send-sms')
  async sendSmsAlias(@Body() task: CreateTaskBody) {
    return this.createTaskInternal(task);
  }

  private async createTaskInternal(task: CreateTaskBody) {
    const recipient = this.normalizeRecipient(task.recipient);
    const message = task.message?.trim();

    if (!recipient) {
      throw new BadRequestException('Recipient phone number is required');
    }
    if (!message) {
      throw new BadRequestException('Message is required');
    }

    // Find an online device that has synced in the last 1 minute
    const staleThreshold = new Date(Date.now() - 1 * 60 * 1000);
    const device = await this.devicesRepository.manager.getRepository(Device).createQueryBuilder('device')
      .where('device.status = :status', { status: DeviceStatus.ONLINE })
      .andWhere('device.lastSeen > :threshold', { threshold: staleThreshold })
      .orderBy('device.lastSeen', 'DESC')
      .getOne();

    if (!device) {
      throw new BadRequestException('No active mobile nodes are currently online. Please check your Flutter app sync status.');
    }

    // 1. Check Spam Guard
    await this.tasksService.validateSpamLimits(recipient, device?.id);

    const newTask = this.tasksRepository.create({
      recipient,
      message,
      status: SMSTaskStatus.PENDING,
      device: device,
    });

    const savedTask = await this.tasksRepository.save(newTask);

    // If a device is online and has a publicUrl, try to send it immediately
    if (device && device.publicUrl) {
      console.log(`Pushing task ${savedTask.id} to device ${device.id} at ${device.publicUrl}`);
      this.tasksService.sendToDevice(device, savedTask).catch(err => {
        console.error(`Failed to push task to device: ${err.message}`);
      });
    } else {
      console.warn(`Task ${savedTask.id} created but no publicUrl found for device ${device?.id}. Device status: ${device?.status}`);
    }

    return savedTask;
  }

  @ApiOperation({ summary: 'Send bulk SMS' })
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

    // 1. Check Spam Guard for each recipient (Hourly only, since we don't have a device yet)
    // We do this concurrently for speed
    await Promise.all(recipients.map(r => this.tasksService.validateSpamLimits(r)));

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
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() update: Partial<SMSTask>) {
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
