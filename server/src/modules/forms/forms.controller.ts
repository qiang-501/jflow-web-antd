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
import { FormsService } from './forms.service';
import { CreateFormConfigDto, UpdateFormConfigDto } from './form-config.dto';

@ApiTags('forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all form configs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all form configs.' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.formsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get form config by id' })
  @ApiResponse({ status: 200, description: 'Return the form config.' })
  @ApiResponse({ status: 404, description: 'Form config not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create form config' })
  @ApiResponse({
    status: 201,
    description: 'Form config created successfully.',
  })
  create(@Body() createFormDto: CreateFormConfigDto) {
    return this.formsService.create(createFormDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update form config' })
  @ApiResponse({
    status: 200,
    description: 'Form config updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Form config not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormDto: UpdateFormConfigDto,
  ) {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete form config' })
  @ApiResponse({
    status: 200,
    description: 'Form config deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Form config not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.remove(id);
  }
}
