import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateWorkflowFormDataDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  workflowId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  formConfigId: number;

  @ApiProperty({
    description: 'Dynamic form data as JSON object',
    example: { fieldName1: 'value1', fieldName2: 'value2' },
  })
  @IsNotEmpty()
  @IsObject()
  formData: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  submittedBy?: number;
}

export class UpdateWorkflowFormDataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  formConfigId?: number;

  @ApiProperty({
    description: 'Dynamic form data as JSON object',
    example: { fieldName1: 'value1', fieldName2: 'value2' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  formData?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  submittedBy?: number;
}
