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
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AddPermissionsDto,
  UpdateRolePermissionsDto,
} from './role.dto';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all roles.' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.rolesService.findAll(+page, +limit);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get roles in tree structure' })
  @ApiResponse({ status: 200, description: 'Return role tree.' })
  getRoleTree() {
    return this.rolesService.getRoleTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiResponse({ status: 200, description: 'Return the role.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  // Role Permissions Management Endpoints

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get all permissions for a role' })
  @ApiResponse({
    status: 200,
    description: 'Return all permissions for the role.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  getRolePermissions(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRolePermissions(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Add permissions to a role' })
  @ApiResponse({
    status: 200,
    description: 'Permissions added to role successfully.',
  })
  @ApiResponse({ status: 404, description: 'Role or permissions not found.' })
  addPermissionsToRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() addPermissionsDto: AddPermissionsDto,
  ) {
    return this.rolesService.addPermissionsToRole(
      id,
      addPermissionsDto.permissionIds,
    );
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Update role permissions (replace all)' })
  @ApiResponse({
    status: 200,
    description: 'Role permissions updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Role or permissions not found.' })
  updateRolePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.rolesService.updateRolePermissions(
      id,
      updatePermissionsDto.permissionIds,
    );
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiResponse({
    status: 200,
    description: 'Permission removed from role successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Role or permission not found.',
  })
  removePermissionFromRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.removePermissionFromRole(roleId, permissionId);
  }
}
