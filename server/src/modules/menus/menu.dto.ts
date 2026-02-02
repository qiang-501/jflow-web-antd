import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { MenuType, MenuStatus } from './menu.entity';

export class CreateMenuDto {
  @ApiProperty({ description: 'Menu name (identifier)' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Menu title for display', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Menu description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Route path', required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ description: 'Icon class or name', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Component path', required: false })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({ enum: MenuType, default: MenuType.MENU })
  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;

  @ApiProperty({ enum: MenuStatus, default: MenuStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiProperty({ description: 'Parent menu ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Is menu visible', default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiProperty({ description: 'Should cache component', default: false })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiProperty({ description: 'Is external link', default: false })
  @IsOptional()
  @IsBoolean()
  externalLink?: boolean;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @ApiProperty({
    type: [Number],
    description: 'Permission IDs',
    required: false,
  })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateMenuDto {
  @ApiProperty({ description: 'Menu name (identifier)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Menu title for display', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Menu description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Route path', required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ description: 'Icon class or name', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Component path', required: false })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({ enum: MenuType, required: false })
  @IsOptional()
  @IsEnum(MenuType)
  type?: MenuType;

  @ApiProperty({ enum: MenuStatus, required: false })
  @IsOptional()
  @IsEnum(MenuStatus)
  status?: MenuStatus;

  @ApiProperty({ description: 'Parent menu ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Is menu visible', required: false })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiProperty({ description: 'Should cache component', required: false })
  @IsOptional()
  @IsBoolean()
  isCached?: boolean;

  @ApiProperty({ description: 'Is external link', required: false })
  @IsOptional()
  @IsBoolean()
  externalLink?: boolean;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @ApiProperty({
    type: [Number],
    description: 'Permission IDs',
    required: false,
  })
  @IsOptional()
  permissionIds?: number[];
}
