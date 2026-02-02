import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import { WorkflowHistory } from './workflow-history.entity';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
    @InjectRepository(WorkflowHistory)
    private historyRepository: Repository<WorkflowHistory>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Workflow[]; total: number }> {
    const [data, total] = await this.workflowsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['formConfig'],
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({
      where: { id },
      relations: ['formConfig'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowsRepository.create(createWorkflowDto);
    return this.workflowsRepository.save(workflow);
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
