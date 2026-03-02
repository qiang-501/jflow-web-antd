import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  CheckPermissionDto,
} from './permission.dto';
import { User } from '../users/user.entity';
import { Menu } from '../menus/menu.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Menu)
    private menusRepository: Repository<Menu>,
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
        throw new ForbiddenException(`User does not have permission '${code}'`);
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

  async getMenuPermissions(): Promise<any[]> {
    // Get all menu-type permissions with their associated menus
    const permissions = await this.permissionsRepository.find({
      where: { type: 'menu' as any },
      relations: ['menus'],
    });

    // Transform to menu permissions format
    const menuPermissions = permissions.map((permission) => {
      const menu = permission.menus?.[0];
      return {
        id: `mp${permission.id}`,
        menuId: menu?.id || permission.id,
        menuName: permission.name,
        path: menu?.path || '',
        icon: menu?.icon,
        orderNum: menu?.sortOrder || 0,
        visible: menu?.isVisible || true,
        actions: [],
      };
    });

    return menuPermissions;
  }

  async getMenuPermissionByMenuId(menuId: string): Promise<any> {
    // Try to find menu by path (menuId is usually the path like 'users', 'roles')
    let menu = await this.menusRepository.findOne({
      where: { path: menuId },
    });

    // If not found by path, try by name
    if (!menu) {
      menu = await this.menusRepository.findOne({
        where: { name: menuId },
      });
    }

    // If still not found, try to treat menuId as numeric id
    if (!menu && !isNaN(Number(menuId))) {
      menu = await this.menusRepository.findOne({
        where: { id: Number(menuId) },
      });
    }

    if (!menu) {
      throw new NotFoundException(`Menu with identifier '${menuId}' not found`);
    }

    // Get all action permissions for this menu
    const actionPermissions = await this.permissionsRepository.find({
      where: {
        resource: String(menu.name),
        type: 'action' as any,
      },
    });

    // Transform to menu permission format
    const actions = actionPermissions.map((permission) => ({
      id: String(permission.id),
      name: permission.name,
      code:
        permission.action || permission.code.split(':')[1] || permission.code,
      menuId: String(menu.id),
      description: permission.description,
    }));

    return {
      menuId: String(menu.id),
      menuName: menu.name,
      menuTitle: menu.title,
      path: menu.path || '',
      icon: menu.icon,
      orderNum: menu.sortOrder || 0,
      visible: menu.isVisible,
      actions: actions,
    };
  }

  async createMenuAction(menuId: number, createActionDto: any): Promise<any> {
    // Create permission with type ACTION
    const permission = this.permissionsRepository.create({
      code: `${createActionDto.menuName}:${createActionDto.code}`,
      name: createActionDto.name,
      type: 'action' as any,
      description: createActionDto.description,
      resource: createActionDto.menuName,
      action: createActionDto.code,
    });

    const savedPermission = await this.permissionsRepository.save(permission);

    return {
      id: String(savedPermission.id),
      name: savedPermission.name,
      code: savedPermission.action || savedPermission.code,
      menuId: String(menuId),
      description: savedPermission.description,
    };
  }

  async updateMenuAction(
    menuId: number,
    actionId: number,
    updateActionDto: any,
  ): Promise<any> {
    const permission = await this.permissionsRepository.findOne({
      where: { id: actionId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Action permission with ID ${actionId} not found`,
      );
    }

    Object.assign(permission, {
      name: updateActionDto.name,
      code: `${updateActionDto.menuName}:${updateActionDto.code}`,
      description: updateActionDto.description,
      action: updateActionDto.code,
    });

    const updated = await this.permissionsRepository.save(permission);

    return {
      id: String(updated.id),
      name: updated.name,
      code: updated.action || updated.code,
      menuId: String(menuId),
      description: updated.description,
    };
  }

  async deleteMenuAction(menuId: number, actionId: number): Promise<void> {
    const permission = await this.permissionsRepository.findOne({
      where: { id: actionId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Action permission with ID ${actionId} not found`,
      );
    }

    await this.permissionsRepository.remove(permission);
  }

  /**
   * 获取当前用户的所有权限代码列表
   * @param userId 用户ID
   * @returns 权限代码数组，如 ['workflow:create', 'user:view', 'role:update']
   */
  async getCurrentUserPermissions(userId: number): Promise<string[]> {
    // 查找用户及其角色和权限
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 收集所有权限代码，使用 Set 去重
    const permissionCodes = new Set<string>();

    // 遍历用户的所有角色
    for (const role of user.roles) {
      // 遍历角色的所有权限
      for (const permission of role.permissions) {
        if (permission.code) {
          permissionCodes.add(permission.code);
        }
      }
    }

    // 转换为数组并返回
    const permissions = Array.from(permissionCodes);

    console.log(
      `User ${userId} has ${permissions.length} permissions:`,
      permissions,
    );

    return permissions;
  }
}
