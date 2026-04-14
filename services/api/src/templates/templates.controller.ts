import { Controller, Get, Post, Body, Param, Patch, Delete, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';

@Controller('templates')
export class TemplatesController {
  constructor(
    @InjectRepository(Template)
    private readonly templatesRepository: Repository<Template>,
  ) {}

  @Get()
  async findAll() {
    try {
      return await this.templatesRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch templates');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.templatesRepository.findOneBy({ id });
  }

  @Post()
  async create(@Body() templateData: Partial<Template>) {
    try {
      const template = this.templatesRepository.create(templateData);
      return await this.templatesRepository.save(template);
    } catch (error) {
      console.error('Create Template Error:', error);
      throw new InternalServerErrorException('Could not save template to database');
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Template>) {
    try {
      await this.templatesRepository.update(id, updateData);
      return await this.templatesRepository.findOneBy({ id });
    } catch (error) {
      console.error('Update Template Error:', error);
      throw new InternalServerErrorException('Could not update template');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.templatesRepository.delete(id);
      return { deleted: result.affected > 0 };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete template');
    }
  }
}
