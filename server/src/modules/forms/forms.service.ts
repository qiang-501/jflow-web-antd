import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicFormConfig } from './form-config.entity';
import { CreateFormConfigDto, UpdateFormConfigDto } from './form-config.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(DynamicFormConfig)
    private formsRepository: Repository<DynamicFormConfig>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: DynamicFormConfig[]; total: number }> {
    const [data, total] = await this.formsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<DynamicFormConfig> {
    const form = await this.formsRepository.findOne({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException(`Form config with ID ${id} not found`);
    }

    return form;
  }

  async create(createFormDto: CreateFormConfigDto): Promise<DynamicFormConfig> {
    const form = this.formsRepository.create(createFormDto);
    return this.formsRepository.save(form);
  }

  async update(
    id: number,
    updateFormDto: UpdateFormConfigDto,
  ): Promise<DynamicFormConfig> {
    const form = await this.findOne(id);

    // Increment version if fields are updated
    if (updateFormDto.fields) {
      form.version = (form.version || 1) + 1;
    }

    Object.assign(form, updateFormDto);
    return this.formsRepository.save(form);
  }

  async remove(id: number): Promise<void> {
    const form = await this.findOne(id);
    await this.formsRepository.remove(form);
  }
}
