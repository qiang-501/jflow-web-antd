import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowHistory, ChangeType } from './workflow-history.entity';
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
    const savedWorkflow = await this.workflowsRepository.save(workflow);

    // Record workflow creation in history
    await this.recordHistory({
      workflowId: savedWorkflow.id,
      changeType: ChangeType.WORKFLOW_CREATE,
      action: 'Workflow Created',
      comment: `Workflow created: ${savedWorkflow.name}`,
      newData: this.sanitizeData(savedWorkflow),
      performedBy: createWorkflowDto.createdBy || 1,
    });

    return savedWorkflow;
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
    const oldData = this.sanitizeData(workflow);

    // Compute field-level changes
    const fieldChanges = this.computeFieldChanges(workflow, updateWorkflowDto);

    // Record workflow update in history if there are changes
    if (fieldChanges.length > 0) {
      Object.assign(workflow, updateWorkflowDto);
      const newData = this.sanitizeData(workflow);

      await this.recordHistory({
        workflowId: id,
        changeType: ChangeType.WORKFLOW_UPDATE,
        action: 'Workflow Updated',
        comment: `Updated ${fieldChanges.length} field(s): ${fieldChanges.map((c) => c.field).join(', ')}`,
        oldStatus: oldData.status,
        newStatus: newData.status,
        fieldChanges,
        oldData,
        newData,
        performedBy: workflow.createdBy || 1,
      });

      return this.workflowsRepository.save(workflow);
    }

    return workflow; // No changes
  }

  async remove(id: number): Promise<void> {
    const workflow = await this.findOne(id);
    const oldData = this.sanitizeData(workflow);

    // Record workflow deletion in history
    await this.recordHistory({
      workflowId: id,
      changeType: ChangeType.WORKFLOW_DELETE,
      action: 'Workflow Deleted',
      comment: `Workflow deleted: ${workflow.name}`,
      oldData,
      performedBy: workflow.createdBy || 1,
    });

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
      const oldData = this.sanitizeData(existingFormData);
      const fieldChanges = this.computeFormDataChanges(
        existingFormData.formData,
        createFormDataDto.formData,
      );

      Object.assign(existingFormData, {
        formConfigId: createFormDataDto.formConfigId,
        formData: createFormDataDto.formData,
        submittedBy: createFormDataDto.submittedBy,
      });

      const savedFormData =
        await this.formDataRepository.save(existingFormData);
      const newData = this.sanitizeData(savedFormData);

      // Record form data update in history
      if (fieldChanges.length > 0) {
        await this.recordHistory({
          workflowId: createFormDataDto.workflowId,
          changeType: ChangeType.FORM_DATA_UPDATE,
          action: 'Form Data Updated',
          comment: `Updated ${fieldChanges.length} field(s): ${fieldChanges.map((c) => c.field).join(', ')}`,
          fieldChanges,
          oldData,
          newData,
          performedBy: createFormDataDto.submittedBy || 1,
        });
      }

      return savedFormData;
    } else {
      // Create new form data
      const formData = this.formDataRepository.create(createFormDataDto);
      const savedFormData = await this.formDataRepository.save(formData);

      // Record form data creation in history
      await this.recordHistory({
        workflowId: createFormDataDto.workflowId,
        changeType: ChangeType.FORM_DATA_CREATE,
        action: 'Form Data Created',
        comment: 'Initial form data submitted',
        newData: this.sanitizeData(savedFormData),
        performedBy: createFormDataDto.submittedBy || 1,
      });

      return savedFormData;
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
    const oldData = this.sanitizeData(formData);

    // Compute field-level changes
    const fieldChanges = this.computeFormDataChanges(
      formData.formData,
      updateFormDataDto.formData || formData.formData,
    );

    Object.assign(formData, updateFormDataDto);
    const savedFormData = await this.formDataRepository.save(formData);
    const newData = this.sanitizeData(savedFormData);

    // Record form data update in history if there are changes
    if (fieldChanges.length > 0) {
      await this.recordHistory({
        workflowId,
        changeType: ChangeType.FORM_DATA_UPDATE,
        action: 'Form Data Updated',
        comment: `Updated ${fieldChanges.length} field(s): ${fieldChanges.map((c) => c.field).join(', ')}`,
        fieldChanges,
        oldData,
        newData,
        performedBy: updateFormDataDto.submittedBy || 1,
      });
    }

    return savedFormData;
  }

  /**
   * Delete workflow form data
   */
  async deleteFormData(
    workflowId: number,
    performedBy?: number,
  ): Promise<void> {
    const formData = await this.getFormData(workflowId);
    const oldData = this.sanitizeData(formData);

    // Record form data deletion in history
    await this.recordHistory({
      workflowId,
      changeType: ChangeType.FORM_DATA_UPDATE,
      action: 'Form Data Deleted',
      comment: 'Form data removed',
      oldData,
      performedBy: performedBy || 1,
    });

    await this.formDataRepository.remove(formData);
  }

  // Helper methods for change tracking

  /**
   * Record a change in workflow history
   */
  private async recordHistory(data: {
    workflowId: number;
    changeType: ChangeType;
    action: string;
    comment?: string;
    oldStatus?: string;
    newStatus?: string;
    fieldChanges?: {
      field: string;
      oldValue: any;
      newValue: any;
      fieldLabel?: string;
    }[];
    oldData?: Record<string, any>;
    newData?: Record<string, any>;
    performedBy: number;
  }): Promise<void> {
    await this.historyRepository.save({
      workflowId: data.workflowId,
      changeType: data.changeType,
      action: data.action,
      comment: data.comment,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      fieldChanges: data.fieldChanges,
      oldData: data.oldData,
      newData: data.newData,
      performedBy: data.performedBy,
    });
  }

  /**
   * Compute field-level changes for workflow entity updates
   */
  private computeFieldChanges(
    oldEntity: any,
    updates: any,
  ): { field: string; oldValue: any; newValue: any; fieldLabel?: string }[] {
    const changes = [];

    for (const [field, newValue] of Object.entries(updates)) {
      const oldValue = oldEntity[field];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue,
          newValue,
          fieldLabel: this.getFieldLabel(field),
        });
      }
    }

    return changes;
  }

  /**
   * Compute field-level changes for form data (jsonb)
   */
  private computeFormDataChanges(
    oldFormData: Record<string, any>,
    newFormData: Record<string, any>,
  ): { field: string; oldValue: any; newValue: any; fieldLabel?: string }[] {
    const changes = [];
    const allKeys = new Set([
      ...Object.keys(oldFormData || {}),
      ...Object.keys(newFormData || {}),
    ]);

    for (const key of allKeys) {
      const oldValue = oldFormData?.[key];
      const newValue = newFormData?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          fieldLabel: key, // Could be enhanced with form config lookup
        });
      }
    }

    return changes;
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(field: string): string {
    const labelMap: Record<string, string> = {
      name: 'Name',
      description: 'Description',
      status: 'Status',
      priority: 'Priority',
      dueDate: 'Due Date',
      assignedTo: 'Assigned To',
      formConfigId: 'Form Configuration',
      templateId: 'Template',
      dWorkflowId: 'Workflow ID',
    };

    return labelMap[field] || field;
  }

  /**
   * Sanitize entity data for storage (remove circular references, etc.)
   */
  private sanitizeData(entity: any): Record<string, any> {
    if (!entity) return {};

    const sanitized: Record<string, any> = {};
    const excludeFields = ['__proto__', 'constructor'];

    for (const [key, value] of Object.entries(entity)) {
      if (excludeFields.includes(key)) continue;

      // Skip relations to avoid circular references
      if (
        value &&
        typeof value === 'object' &&
        value.constructor.name !== 'Date' &&
        value.constructor.name !== 'Array'
      ) {
        // Only include simple values, not related entities
        continue;
      }

      sanitized[key] = value;
    }

    return sanitized;
  }
}
