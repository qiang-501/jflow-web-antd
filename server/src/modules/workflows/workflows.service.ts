import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowHistory } from './workflow-history.entity';
import { WorkflowTemplate } from './workflow-template.entity';
import { WorkflowFormData } from './workflow-form-data.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';
import {
  CreateWorkflowFormDataDto,
  UpdateWorkflowFormDataDto,
} from './workflow-form-data.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
    @InjectRepository(WorkflowHistory)
    private historyRepository: Repository<WorkflowHistory>,
    @InjectRepository(WorkflowTemplate)
    private templatesRepository: Repository<WorkflowTemplate>,
    @InjectRepository(WorkflowFormData)
    private formDataRepository: Repository<WorkflowFormData>,
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

  // Workflow Form Data Methods

  /**
   * Save workflow form data (create or update)
   */
  async saveFormData(
    createFormDataDto: CreateWorkflowFormDataDto,
  ): Promise<WorkflowFormData> {
    // Check if workflow exists
    const workflow = await this.findOne(createFormDataDto.workflowId);

    // Check if form data already exists for this workflow
    const existingFormData = await this.formDataRepository.findOne({
      where: { workflowId: createFormDataDto.workflowId },
    });

    if (existingFormData) {
      // Update existing form data
      Object.assign(existingFormData, {
        formConfigId: createFormDataDto.formConfigId,
        formData: createFormDataDto.formData,
        submittedBy: createFormDataDto.submittedBy,
      });
      return this.formDataRepository.save(existingFormData);
    } else {
      // Create new form data
      const formData = this.formDataRepository.create(createFormDataDto);
      return this.formDataRepository.save(formData);
    }
  }

  /**
   * Get workflow form data by workflow ID
   */
  async getFormData(workflowId: number): Promise<WorkflowFormData> {
    const formData = await this.formDataRepository.findOne({
      where: { workflowId },
      relations: ['workflow', 'formConfig', 'submittedByUser'],
    });

    if (!formData) {
      throw new NotFoundException(
        `Form data for workflow ID ${workflowId} not found`,
      );
    }

    return formData;
  }

  /**
   * Update workflow form data
   */
  async updateFormData(
    workflowId: number,
    updateFormDataDto: UpdateWorkflowFormDataDto,
  ): Promise<WorkflowFormData> {
    const formData = await this.getFormData(workflowId);

    Object.assign(formData, updateFormDataDto);
    return this.formDataRepository.save(formData);
  }

  /**
   * Delete workflow form data
   */
  async deleteFormData(workflowId: number): Promise<void> {
    const formData = await this.getFormData(workflowId);
    await this.formDataRepository.remove(formData);
  }
}
