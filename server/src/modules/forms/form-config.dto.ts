import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFormConfigDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  fields: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  layout?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  labelWidth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  labelAlign?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  version?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateFormConfigDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  fields?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  layout?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  labelWidth?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  labelAlign?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  version?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
