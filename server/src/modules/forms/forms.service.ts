import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicFormConfig } from './form-config.entity';
import { FormField } from './form-field.entity';
import { CreateFormConfigDto, UpdateFormConfigDto } from './form-field.dto';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(DynamicFormConfig)
    private formsRepository: Repository<DynamicFormConfig>,
    @InjectRepository(FormField)
    private fieldsRepository: Repository<FormField>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: DynamicFormConfig[]; total: number }> {
    const [data, total] = await this.formsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['fields'],
      order: { id: 'ASC' },
    });

    // Sort fields by orderIndex
    data.forEach((form) => {
      if (form.fields) {
        form.fields.sort((a, b) => a.orderIndex - b.orderIndex);
      }
    });

    return { data, total };
  }

  async findOne(id: number): Promise<DynamicFormConfig> {
    const form = await this.formsRepository.findOne({
      where: { id },
      relations: ['fields'],
    });

    if (!form) {
      throw new NotFoundException(`Form config with ID ${id} not found`);
    }

    // Sort fields by orderIndex
    if (form.fields) {
      form.fields.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return form;
  }

  async create(createFormDto: CreateFormConfigDto): Promise<DynamicFormConfig> {
    const { fields, ...formData } = createFormDto;

    // Create form config
    const form = this.formsRepository.create(formData);
    const savedForm = await this.formsRepository.save(form);

    // Create fields
    if (fields && fields.length > 0) {
      const formFields = fields.map((field, index) =>
        this.fieldsRepository.create({
          ...field,
          formConfigId: savedForm.id,
          orderIndex: field.orderIndex ?? index,
        }),
      );
      await this.fieldsRepository.save(formFields);
    }

    return this.findOne(savedForm.id);
  }

  async update(
    id: number,
    updateFormDto: UpdateFormConfigDto,
  ): Promise<DynamicFormConfig> {
    const form = await this.findOne(id);
    const { fields, ...formData } = updateFormDto;

    // Increment version if fields are updated
    if (fields) {
      formData['version'] = (form.version || 1) + 1;

      // Delete existing fields and create new ones
      await this.fieldsRepository.delete({ formConfigId: id });

      const formFields = fields.map((field, index) =>
        this.fieldsRepository.create({
          ...field,
          formConfigId: id,
          orderIndex: field.orderIndex ?? index,
        }),
      );
      await this.fieldsRepository.save(formFields);
    }

    // Update form config
    Object.assign(form, formData);
    await this.formsRepository.save(form);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const form = await this.findOne(id);
    // Fields will be cascade deleted
    await this.formsRepository.remove(form);
  }
}
