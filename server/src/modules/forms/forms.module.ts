import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { DynamicFormConfig } from './form-config.entity';
import { FormField } from './form-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DynamicFormConfig, FormField])],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
