import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { Permission } from '../permissions/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
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

  async getRoleTree(): Promise<Role[]> {
    // Get all roles
    const allRoles = await this.rolesRepository.find({
      relations: ['permissions', 'parent'],
    });

    // Build tree structure
    const roleMap = new Map<number, any>();
    const rootRoles: any[] = [];

    // First pass: create map with children array
    allRoles.forEach((role) => {
      roleMap.set(role.id, { ...role, children: [] });
    });

    // Second pass: build tree
    allRoles.forEach((role) => {
      const roleWithChildren = roleMap.get(role.id);
      if (role.parentId) {
        const parent = roleMap.get(role.parentId);
        if (parent) {
          parent.children.push(roleWithChildren);
        }
      } else {
        rootRoles.push(roleWithChildren);
      }
    });

    return rootRoles;
  }

  // Role Permissions Management

  /**
   * Get all permissions for a role
   */
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const role = await this.findOne(roleId);
    return role.permissions || [];
  }

  /**
   * Add permissions to a role (without removing existing ones)
   */
  async addPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    // Verify all permissions exist
    const permissions =
      await this.permissionsRepository.findByIds(permissionIds);

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Get current permission IDs
    const currentPermissionIds = role.permissions.map((p) => p.id);

    // Add only new permissions (avoid duplicates)
    const newPermissionIds = permissionIds.filter(
      (id) => !currentPermissionIds.includes(id),
    );

    if (newPermissionIds.length > 0) {
      await this.rolesRepository
        .createQueryBuilder()
        .relation(Role, 'permissions')
        .of(role)
        .add(newPermissionIds);
    }

    return this.findOne(roleId);
  }

  /**
   * Update role permissions (replace all existing permissions)
   */
  async updateRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    // Verify all permissions exist
    if (permissionIds.length > 0) {
      const permissions =
        await this.permissionsRepository.findByIds(permissionIds);

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    // Get current permission IDs
    const currentPermissionIds = role.permissions.map((p) => p.id);

    // Replace all permissions
    await this.rolesRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role)
      .addAndRemove(permissionIds, currentPermissionIds);

    return this.findOne(roleId);
  }

  /**
   * Remove a specific permission from a role
   */
  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.findOne(roleId);

    // Check if the role has this permission
    const hasPermission = role.permissions.some((p) => p.id === permissionId);

    if (!hasPermission) {
      throw new NotFoundException(
        `Permission ${permissionId} not found in role ${roleId}`,
      );
    }

    // Remove the permission
    await this.rolesRepository
      .createQueryBuilder()
      .relation(Role, 'permissions')
      .of(role)
      .remove(permissionId);

    return this.findOne(roleId);
  }
}
