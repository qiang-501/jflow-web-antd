import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowTemplate } from './workflow-template.entity';
import {
  CreateWorkflowTemplateDto,
  UpdateWorkflowTemplateDto,
} from './workflow-template.dto';

@Injectable()
export class WorkflowTemplatesService {
  constructor(
    @InjectRepository(WorkflowTemplate)
    private templatesRepository: Repository<WorkflowTemplate>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    category?: string,
  ): Promise<{ data: WorkflowTemplate[]; total: number }> {
    const query = this.templatesRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.formConfig', 'formConfig')
      .leftJoinAndSelect('template.defaultAssigneeRole', 'role')
      .where('template.active = :active', { active: true });

    if (category) {
      query.andWhere('template.category = :category', { category });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<WorkflowTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id },
      relations: ['formConfig', 'formConfig.fields', 'defaultAssigneeRole'],
    });

    if (!template) {
      throw new NotFoundException(`Workflow template with ID ${id} not found`);
    }

    return template;
  }

  async findByCode(code: string): Promise<WorkflowTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { code },
      relations: ['formConfig', 'formConfig.fields', 'defaultAssigneeRole'],
    });

    if (!template) {
      throw new NotFoundException(
        `Workflow template with code ${code} not found`,
      );
    }

    return template;
  }

  async create(
    createTemplateDto: CreateWorkflowTemplateDto,
  ): Promise<WorkflowTemplate> {
    const template = this.templatesRepository.create(createTemplateDto);
    return this.templatesRepository.save(template);
  }

  async update(
    id: number,
    updateTemplateDto: UpdateWorkflowTemplateDto,
  ): Promise<WorkflowTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, updateTemplateDto);
    return this.templatesRepository.save(template);
  }

  async remove(id: number): Promise<void> {
    const template = await this.findOne(id);
    await this.templatesRepository.remove(template);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.templatesRepository
      .createQueryBuilder('template')
      .select('DISTINCT template.category', 'category')
      .where('template.category IS NOT NULL')
      .andWhere('template.active = :active', { active: true })
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }
}
