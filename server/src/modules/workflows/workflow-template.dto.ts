import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { WorkflowPriority } from './workflow.enums';

export class CreateWorkflowTemplateDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  formConfigId?: number;

  @IsOptional()
  @IsEnum(WorkflowPriority)
  defaultPriority?: WorkflowPriority;

  @IsOptional()
  @IsNumber()
  defaultAssigneeRoleId?: number;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  createdBy?: number;
}

export class UpdateWorkflowTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  formConfigId?: number;

  @IsOptional()
  @IsEnum(WorkflowPriority)
  defaultPriority?: WorkflowPriority;

  @IsOptional()
  @IsNumber()
  defaultAssigneeRoleId?: number;

  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
