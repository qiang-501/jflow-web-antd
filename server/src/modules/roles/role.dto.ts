import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  permissionIds?: number[];
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  permissionIds?: number[];
}

export class AddPermissionsDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of permission IDs to add to the role',
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [Number],
    description: 'Array of permission IDs to set for the role',
  })
  @IsNotEmpty()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds: number[];
}
