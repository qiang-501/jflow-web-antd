import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { Workflow } from './workflow.entity';
import { WorkflowHistory } from './workflow-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowHistory])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
