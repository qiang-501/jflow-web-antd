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
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto } from './menu.dto';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menus with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all menus.' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 100) {
    return this.menusService.findAll(+page, +limit);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get menu tree structure' })
  @ApiResponse({ status: 200, description: 'Return menu tree.' })
  findTree() {
    return this.menusService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu by id' })
  @ApiResponse({ status: 200, description: 'Return the menu.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Get('permission/:permissionId')
  @ApiOperation({ summary: 'Get menus by permission' })
  @ApiResponse({ status: 200, description: 'Return menus with permission.' })
  findByPermission(@Param('permissionId', ParseIntPipe) permissionId: number) {
    return this.menusService.findByPermission(permissionId);
  }

  @Post()
  @ApiOperation({ summary: 'Create menu' })
  @ApiResponse({ status: 201, description: 'Menu created successfully.' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Menu not found.' })
  @ApiResponse({ status: 400, description: 'Cannot delete menu with children.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }

  @Put('sort/update')
  @ApiOperation({ summary: 'Update menu sort order' })
  @ApiResponse({ status: 200, description: 'Sort order updated successfully.' })
  updateSortOrder(@Body() menuOrders: Array<{ id: number; sortOrder: number }>) {
    return this.menusService.updateSortOrder(menuOrders);
  }
}

