// rbac.helper.ts
import { Role, RoleInheritance } from '../../models/role.model';
import { Permission } from '../../models/permission.model';

/**
 * RBAC辅助工具类
 * 处理角色继承和权限计算
 */
export class RbacHelper {
  /**
   * 计算角色的所有权限（包括继承的权限）
   * @param role 当前角色
   * @param allRoles 所有角色列表
   * @returns 所有权限ID数组
   */
  static calculateRolePermissions(role: Role, allRoles: Role[]): string[] {
    const permissions = new Set<string>(role.permissionIds);

    // 递归获取父角色的权限
    if (role.parentId) {
      const parentRole = allRoles.find((r) => r.id === role.parentId);
      if (parentRole) {
        const parentPermissions = this.calculateRolePermissions(
          parentRole,
          allRoles,
        );
        parentPermissions.forEach((p) => permissions.add(p));
      }
    }

    return Array.from(permissions);
  }

  /**
   * 计算用户的所有权限（基于用户的所有角色）
   * @param userRoleIds 用户的角色ID列表
   * @param allRoles 所有角色列表
   * @returns 所有权限ID数组
   */
  static calculateUserPermissions(
    userRoleIds: string[],
    allRoles: Role[],
  ): string[] {
    const permissions = new Set<string>();

    userRoleIds.forEach((roleId) => {
      const role = allRoles.find((r) => r.id === roleId);
      if (role) {
        const rolePermissions = this.calculateRolePermissions(role, allRoles);
        rolePermissions.forEach((p) => permissions.add(p));
      }
    });

    return Array.from(permissions);
  }

  /**
   * 获取角色的所有父角色链
   * @param role 当前角色
   * @param allRoles 所有角色列表
   * @returns 父角色链数组（从根到当前角色）
   */
  static getRoleHierarchy(role: Role, allRoles: Role[]): Role[] {
    const hierarchy: Role[] = [role];
    let currentRole = role;

    while (currentRole.parentId) {
      const parentRole = allRoles.find((r) => r.id === currentRole.parentId);
      if (parentRole) {
        hierarchy.unshift(parentRole);
        currentRole = parentRole;
      } else {
        break;
      }
    }

    return hierarchy;
  }

  /**
   * 获取角色的所有子角色
   * @param roleId 角色ID
   * @param allRoles 所有角色列表
   * @returns 所有子角色数组
   */
  static getChildRoles(roleId: string, allRoles: Role[]): Role[] {
    const children: Role[] = [];

    const findChildren = (parentId: string) => {
      const directChildren = allRoles.filter((r) => r.parentId === parentId);
      directChildren.forEach((child) => {
        children.push(child);
        findChildren(child.id); // 递归查找子角色的子角色
      });
    };

    findChildren(roleId);
    return children;
  }

  /**
   * 检查角色继承是否会造成循环
   * @param roleId 当前角色ID
   * @param parentId 要设置的父角色ID
   * @param allRoles 所有角色列表
   * @returns 是否会造成循环继承
   */
  static hasCircularInheritance(
    roleId: string,
    parentId: string,
    allRoles: Role[],
  ): boolean {
    if (roleId === parentId) {
      return true;
    }

    // 检查父角色的所有祖先是否包含当前角色
    const parentRole = allRoles.find((r) => r.id === parentId);
    if (!parentRole) {
      return false;
    }

    const ancestors = this.getRoleHierarchy(parentRole, allRoles);
    return ancestors.some((ancestor) => ancestor.id === roleId);
  }

  /**
   * 获取角色继承关系详情
   * @param roleId 角色ID
   * @param allRoles 所有角色列表
   * @returns 继承关系详情
   */
  static getRoleInheritanceDetails(
    roleId: string,
    allRoles: Role[],
  ): RoleInheritance[] {
    const role = allRoles.find((r) => r.id === roleId);
    if (!role) {
      return [];
    }

    const inheritances: RoleInheritance[] = [];
    const hierarchy = this.getRoleHierarchy(role, allRoles);

    // 构建继承关系，排除自身
    hierarchy
      .filter((r) => r.id !== roleId)
      .forEach((inheritedRole) => {
        inheritances.push({
          roleId: role.id,
          inheritedRoleId: inheritedRole.id,
          inheritedPermissions: inheritedRole.permissionIds,
        });
      });

    return inheritances;
  }

  /**
   * 检查权限代码
   * @param userPermissionCodes 用户拥有的权限代码列表
   * @param requiredPermissions 需要的权限代码列表
   * @param operator 操作符：AND（所有权限都需要）或 OR（任意权限即可）
   * @returns 是否拥有权限
   */
  static checkPermissions(
    userPermissionCodes: string[],
    requiredPermissions: string[],
    operator: 'AND' | 'OR' = 'OR',
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    if (operator === 'AND') {
      return requiredPermissions.every((permission) =>
        userPermissionCodes.includes(permission),
      );
    } else {
      return requiredPermissions.some((permission) =>
        userPermissionCodes.includes(permission),
      );
    }
  }

  /**
   * 根据权限ID列表获取权限代码列表
   * @param permissionIds 权限ID列表
   * @param allPermissions 所有权限列表
   * @returns 权限代码列表
   */
  static getPermissionCodes(
    permissionIds: string[],
    allPermissions: Permission[],
  ): string[] {
    return permissionIds
      .map((id) => {
        const permission = allPermissions.find((p) => p.id === id);
        return permission ? permission.code : null;
      })
      .filter((code): code is string => code !== null);
  }

  /**
   * 构建角色树结构
   * @param roles 所有角色列表
   * @returns 角色树
   */
  static buildRoleTree(roles: Role[]): any[] {
    const roleMap = new Map<string, any>();
    const roots: any[] = [];

    // 创建所有节点
    roles.forEach((role) => {
      roleMap.set(role.id, {
        ...role,
        key: role.id,
        title: role.name,
        children: [],
      });
    });

    // 构建树结构
    roles.forEach((role) => {
      const node = roleMap.get(role.id);
      if (role.parentId) {
        const parent = roleMap.get(role.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
