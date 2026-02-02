import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './menu.dto';
import { Permission } from '../permissions/permission.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menusRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async findAll(
    page = 1,
    limit = 100,
  ): Promise<{ data: Menu[]; total: number }> {
    // 获取所有菜单
    const allMenus = await this.menusRepository.find({
      relations: ['permissions'],
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    // 构建树形结构
    const menuTree = this.buildMenuTree(allMenus);

    // 返回树形结构和总数
    return {
      data: menuTree,
      total: allMenus.length,
    };
  }

  // 辅助方法：构建菜单树
  private buildMenuTree(menus: Menu[]): any[] {
    const menuMap = new Map<number, any>();
    const rootMenus: any[] = [];

    // 初始化所有菜单
    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        ...menu,
        children: [],
      });
    });

    // 构建树形结构
    menus.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuWithChildren);
        }
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    // 清理空的children数组
    const cleanEmptyChildren = (items: any[]): any[] => {
      return items.map((item) => {
        if (item.children && item.children.length === 0) {
          const { children, ...rest } = item;
          return rest;
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: cleanEmptyChildren(item.children),
          };
        }
        return item;
      });
    };

    return cleanEmptyChildren(rootMenus);
  }

  async findTree(): Promise<Menu[]> {
    // Get all active menus
    const allMenus = await this.menusRepository.find({
      relations: ['permissions'],
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    // Build tree structure
    const menuMap = new Map<number, Menu & { children: Menu[] }>();
    const rootMenus: (Menu & { children: Menu[] })[] = [];

    // Initialize all menus in map
    allMenus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    // Build tree
    allMenus.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuWithChildren);
        }
      } else {
        rootMenus.push(menuWithChildren);
      }
    });

    return rootMenus;
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menusRepository.findOne({
      where: { id },
      relations: ['permissions', 'parent'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async findByPermission(permissionId: number): Promise<Menu[]> {
    return this.menusRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.permissions', 'permission')
      .where('permission.id = :permissionId', { permissionId })
      .orderBy('menu.sortOrder', 'ASC')
      .getMany();
  }

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const menu = this.menusRepository.create({
      name: createMenuDto.name,
      title: createMenuDto.title,
      description: createMenuDto.description,
      path: createMenuDto.path,
      icon: createMenuDto.icon,
      component: createMenuDto.component,
      type: createMenuDto.type,
      status: createMenuDto.status,
      parentId: createMenuDto.parentId,
      sortOrder: createMenuDto.sortOrder,
      isVisible: createMenuDto.isVisible,
      isCached: createMenuDto.isCached,
      externalLink: createMenuDto.externalLink,
      meta: createMenuDto.meta,
    });

    const savedMenu = await this.menusRepository.save(menu);

    // Handle permission associations
    if (createMenuDto.permissionIds && createMenuDto.permissionIds.length > 0) {
      const permissions = await this.permissionsRepository.findBy({
        id: In(createMenuDto.permissionIds),
      });

      await this.menusRepository
        .createQueryBuilder()
        .relation(Menu, 'permissions')
        .of(savedMenu)
        .add(permissions);
    }

    return this.findOne(savedMenu.id);
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);

    Object.assign(menu, {
      name: updateMenuDto.name ?? menu.name,
      title: updateMenuDto.title ?? menu.title,
      description: updateMenuDto.description ?? menu.description,
      path: updateMenuDto.path ?? menu.path,
      icon: updateMenuDto.icon ?? menu.icon,
      component: updateMenuDto.component ?? menu.component,
      type: updateMenuDto.type ?? menu.type,
      status: updateMenuDto.status ?? menu.status,
      parentId: updateMenuDto.parentId ?? menu.parentId,
      sortOrder: updateMenuDto.sortOrder ?? menu.sortOrder,
      isVisible: updateMenuDto.isVisible ?? menu.isVisible,
      isCached: updateMenuDto.isCached ?? menu.isCached,
      externalLink: updateMenuDto.externalLink ?? menu.externalLink,
      meta: updateMenuDto.meta ?? menu.meta,
    });

    await this.menusRepository.save(menu);

    // Handle permission associations
    if (updateMenuDto.permissionIds !== undefined) {
      const permissions = await this.permissionsRepository.findBy({
        id: In(updateMenuDto.permissionIds),
      });

      const currentPermissions = menu.permissions || [];

      await this.menusRepository
        .createQueryBuilder()
        .relation(Menu, 'permissions')
        .of(menu)
        .addAndRemove(
          permissions.map((p) => p.id),
          currentPermissions.map((p) => p.id),
        );
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);

    // Check if menu has children
    const childrenCount = await this.menusRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new Error(
        `Cannot delete menu with ID ${id} because it has ${childrenCount} child menu(s)`,
      );
    }

    await this.menusRepository.remove(menu);
  }

  async updateSortOrder(
    menuOrders: Array<{ id: number; sortOrder: number }>,
  ): Promise<void> {
    await this.menusRepository.manager.transaction(
      async (transactionalEntityManager) => {
        for (const order of menuOrders) {
          await transactionalEntityManager.update(
            Menu,
            { id: order.id },
            { sortOrder: order.sortOrder },
          );
        }
      },
    );
  }
}
