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
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CheckPermissionDto,
} from './permission.dto';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all permissions.' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.permissionsService.findAll(+page, +limit);
  }

  @Get('menus')
  @ApiOperation({ summary: 'Get menu permissions tree' })
  @ApiResponse({ status: 200, description: 'Return menu permissions tree.' })
  getMenuPermissions() {
    return this.permissionsService.getMenuPermissions();
  }

  @Post('menus/:menuId/actions')
  @ApiOperation({ summary: 'Create menu action permission' })
  @ApiResponse({
    status: 201,
    description: 'Menu action permission created successfully.',
  })
  createMenuAction(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() createActionDto: any,
  ) {
    return this.permissionsService.createMenuAction(menuId, createActionDto);
  }

  @Put('menus/:menuId/actions/:actionId')
  @ApiOperation({ summary: 'Update menu action permission' })
  @ApiResponse({
    status: 200,
    description: 'Menu action permission updated successfully.',
  })
  updateMenuAction(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Param('actionId', ParseIntPipe) actionId: number,
    @Body() updateActionDto: any,
  ) {
    return this.permissionsService.updateMenuAction(
      menuId,
      actionId,
      updateActionDto,
    );
  }

  @Delete('menus/:menuId/actions/:actionId')
  @ApiOperation({ summary: 'Delete menu action permission' })
  @ApiResponse({
    status: 200,
    description: 'Menu action permission deleted successfully.',
  })
  deleteMenuAction(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Param('actionId', ParseIntPipe) actionId: number,
  ) {
    return this.permissionsService.deleteMenuAction(menuId, actionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by id' })
  @ApiResponse({ status: 200, description: 'Return the permission.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update permission' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.permissionsService.remove(id);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if user has permission' })
  @ApiResponse({ status: 200, description: 'Return permission check result.' })
  @ApiResponse({ status: 403, description: 'Permission denied.' })
  checkPermission(@Body() checkPermissionDto: CheckPermissionDto) {
    return this.permissionsService.checkPermission(checkPermissionDto);
  }
}
