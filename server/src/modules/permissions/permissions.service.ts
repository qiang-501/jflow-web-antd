import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import { CreatePermissionDto, UpdatePermissionDto, CheckPermissionDto } from './permission.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: Permission[]; total: number }> {
    const [data, total] = await this.permissionsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findOne(id);
    Object.assign(permission, updatePermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async remove(id: number): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionsRepository.remove(permission);
  }

  async checkPermission(
    checkPermissionDto: CheckPermissionDto,
  ): Promise<{ hasPermission: boolean; message: string }> {
    const { code, userId } = checkPermissionDto;

    // Check if permission exists
    const permission = await this.permissionsRepository.findOne({
      where: { code },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with code '${code}' not found`);
    }

    // If userId is provided, check user's permissions
    if (userId) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if user has the permission through their roles
      const hasPermission = user.roles.some((role) =>
        role.permissions.some((perm) => perm.code === code),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `User does not have permission '${code}'`,
        );
      }

      return {
        hasPermission: true,
        message: `User has permission '${code}'`,
      };
    }

    // If no userId provided, just check if permission exists
    return {
      hasPermission: true,
      message: `Permission '${code}' exists`,
    };
  }
}
