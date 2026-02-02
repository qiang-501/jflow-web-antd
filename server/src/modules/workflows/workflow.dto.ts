import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { WorkflowStatus, WorkflowPriority } from './workflow.entity';

export class CreateWorkflowDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  dWorkflowId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowStatus, required: false })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ enum: WorkflowPriority, required: false })
  @IsOptional()
  @IsEnum(WorkflowPriority)
  priority?: WorkflowPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  formConfigId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  createdBy?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  assignedTo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateWorkflowDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WorkflowStatus, required: false })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiProperty({ enum: WorkflowPriority, required: false })
  @IsOptional()
  @IsEnum(WorkflowPriority)
  priority?: WorkflowPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  formConfigId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  assignedTo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
