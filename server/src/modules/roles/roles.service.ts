import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Role[]; total: number }> {
    const [data, total] = await this.rolesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['permissions', 'parent'],
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions', 'parent'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    const savedRole = await this.rolesRepository.save(role);

    // Handle permission associations
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      await this.rolesRepository
        .createQueryBuilder()
        .relation(Role, 'permissions')
        .of(savedRole)
        .add(createRoleDto.permissionIds);
    }

    return this.findOne(savedRole.id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    await this.rolesRepository.save(role);

    // Handle permission associations
    if (updateRoleDto.permissionIds !== undefined) {
      await this.rolesRepository
        .createQueryBuilder()
        .relation(Role, 'permissions')
        .of(role)
        .addAndRemove(
          updateRoleDto.permissionIds,
          role.permissions.map((p) => p.id),
        );
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }
}
