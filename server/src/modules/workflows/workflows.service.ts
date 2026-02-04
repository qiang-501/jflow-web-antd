import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowHistory } from './workflow-history.entity';
import { WorkflowTemplate } from './workflow-template.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
    @InjectRepository(WorkflowHistory)
    private historyRepository: Repository<WorkflowHistory>,
    @InjectRepository(WorkflowTemplate)
    private templatesRepository: Repository<WorkflowTemplate>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Workflow[]; total: number }> {
    const [data, total] = await this.workflowsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['formConfig', 'formConfig.fields', 'template'],
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({
      where: { id },
      relations: ['formConfig', 'formConfig.fields', 'template'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    // If templateId is provided, inherit from template
    if (createWorkflowDto.templateId) {
      const template = await this.templatesRepository.findOne({
        where: { id: createWorkflowDto.templateId },
        relations: ['formConfig', 'defaultAssigneeRole'],
      });

      if (template) {
        // Inherit properties from template if not explicitly provided
        if (!createWorkflowDto.priority && template.defaultPriority) {
          createWorkflowDto.priority = template.defaultPriority;
        }
        if (!createWorkflowDto.formConfigId && template.formConfigId) {
          createWorkflowDto.formConfigId = template.formConfigId;
        }
        if (!createWorkflowDto.description && template.description) {
          createWorkflowDto.description = template.description;
        }
      }
    }

    const workflow = this.workflowsRepository.create(createWorkflowDto);
    return this.workflowsRepository.save(workflow);
  }

  async createFromTemplate(
    templateId: number,
    overrides: Partial<CreateWorkflowDto>,
  ): Promise<Workflow> {
    const template = await this.templatesRepository.findOne({
      where: { id: templateId },
      relations: ['formConfig', 'formConfig.fields'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const workflowDto: CreateWorkflowDto = {
      dWorkflowId: overrides.dWorkflowId || `WF-${Date.now()}`,
      templateId,
      name: overrides.name || template.name,
      description: overrides.description || template.description,
      priority: overrides.priority || template.defaultPriority,
      formConfigId: overrides.formConfigId || template.formConfigId,
      createdBy: overrides.createdBy,
      assignedTo: overrides.assignedTo,
      status: overrides.status,
      dueDate: overrides.dueDate,
    };

    return this.create(workflowDto);
  }

  async update(
    id: number,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.findOne(id);

    // Record status change in history
    if (
      updateWorkflowDto.status &&
      updateWorkflowDto.status !== workflow.status
    ) {
      await this.historyRepository.save({
        workflowId: id,
        action: 'Status Changed',
        oldStatus: workflow.status,
        newStatus: updateWorkflowDto.status,
        performedBy: workflow.createdBy || 1,
      });
    }

    Object.assign(workflow, updateWorkflowDto);
    return this.workflowsRepository.save(workflow);
  }

  async remove(id: number): Promise<void> {
    const workflow = await this.findOne(id);
    await this.workflowsRepository.remove(workflow);
  }

  async getHistory(workflowId: number): Promise<WorkflowHistory[]> {
    return this.historyRepository.find({
      where: { workflowId },
      order: { createdAt: 'DESC' },
    });
  }
}
