import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PermissionType } from './permission.entity';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: PermissionType, required: false })
  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;
}

export class UpdatePermissionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: PermissionType, required: false })
  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  action?: string;
}

export class CheckPermissionDto {
  @ApiProperty({ description: 'Permission code to check', example: 'workflow:update' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'User ID to check permission for', required: false })
  @IsOptional()
  userId?: number;
}
