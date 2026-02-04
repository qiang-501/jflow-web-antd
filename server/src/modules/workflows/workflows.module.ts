import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { Workflow } from './workflow.entity';
import { WorkflowHistory } from './workflow-history.entity';
import { WorkflowTemplate } from './workflow-template.entity';
import { WorkflowTemplatesController } from './workflow-templates.controller';
import { WorkflowTemplatesService } from './workflow-templates.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow, WorkflowHistory, WorkflowTemplate]),
  ],
  controllers: [WorkflowsController, WorkflowTemplatesController],
  providers: [WorkflowsService, WorkflowTemplatesService],
  exports: [WorkflowsService, WorkflowTemplatesService],
})
export class WorkflowsModule {}
