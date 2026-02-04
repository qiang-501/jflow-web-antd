import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';
import {
  CreateWorkflowFormDataDto,
  UpdateWorkflowFormDataDto,
} from './workflow-form-data.dto';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all workflows.' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.workflowsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by id' })
  @ApiResponse({ status: 200, description: 'Return the workflow.' })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get workflow history' })
  @ApiResponse({ status: 200, description: 'Return workflow history.' })
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.getHistory(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully.' })
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto);
  }

  @Post('from-template/:templateId')
  @ApiOperation({ summary: 'Create workflow from template' })
  @ApiResponse({
    status: 201,
    description: 'Workflow created from template successfully.',
  })
  createFromTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() overrides: Partial<CreateWorkflowDto>,
  ) {
    return this.workflowsService.createFromTemplate(templateId, overrides);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiResponse({ status: 200, description: 'Workflow updated successfully.' })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiResponse({ status: 200, description: 'Workflow deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.remove(id);
  }

  // Workflow Form Data Endpoints

  @Post(':id/form-data')
  @ApiOperation({ summary: 'Save workflow form data' })
  @ApiResponse({
    status: 201,
    description: 'Form data saved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Workflow not found.' })
  saveFormData(
    @Param('id', ParseIntPipe) id: number,
    @Body() formDataDto: Omit<CreateWorkflowFormDataDto, 'workflowId'>,
  ) {
    const createDto: CreateWorkflowFormDataDto = {
      ...formDataDto,
      workflowId: id,
    };
    return this.workflowsService.saveFormData(createDto);
  }

  @Get(':id/form-data')
  @ApiOperation({ summary: 'Get workflow form data' })
  @ApiResponse({
    status: 200,
    description: 'Return workflow form data.',
  })
  @ApiResponse({ status: 404, description: 'Form data not found.' })
  getFormData(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.getFormData(id);
  }

  @Put(':id/form-data')
  @ApiOperation({ summary: 'Update workflow form data' })
  @ApiResponse({
    status: 200,
    description: 'Form data updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Form data not found.' })
  updateFormData(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormDataDto: UpdateWorkflowFormDataDto,
  ) {
    return this.workflowsService.updateFormData(id, updateFormDataDto);
  }

  @Delete(':id/form-data')
  @ApiOperation({ summary: 'Delete workflow form data' })
  @ApiResponse({
    status: 200,
    description: 'Form data deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Form data not found.' })
  deleteFormData(@Param('id', ParseIntPipe) id: number) {
    return this.workflowsService.deleteFormData(id);
  }
}
