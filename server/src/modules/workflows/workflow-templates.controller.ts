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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowTemplatesService } from './workflow-templates.service';
import {
  CreateWorkflowTemplateDto,
  UpdateWorkflowTemplateDto,
} from './workflow-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('workflow-templates')
@Controller('workflow-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowTemplatesController {
  constructor(
    private readonly workflowTemplatesService: WorkflowTemplatesService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
  ) {
    return this.workflowTemplatesService.findAll(
      parseInt(page, 10),
      parseInt(limit, 10),
      category,
    );
  }

  @Get('categories')
  async getCategories() {
    return this.workflowTemplatesService.getCategories();
  }

  @Get('active')
  async getActiveTemplates() {
    return this.workflowTemplatesService.getActiveTemplates();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workflowTemplatesService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.workflowTemplatesService.findByCode(code);
  }

  @Post()
  async create(@Body() createTemplateDto: CreateWorkflowTemplateDto) {
    return this.workflowTemplatesService.create(createTemplateDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateWorkflowTemplateDto,
  ) {
    return this.workflowTemplatesService.update(id, updateTemplateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.workflowTemplatesService.remove(id);
    return { message: 'Workflow template deleted successfully' };
  }
}
