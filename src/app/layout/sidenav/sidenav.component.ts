import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { MENU, MenuItem, MenuNode } from '../../models/menu.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuState } from '../../store/reducers/menu.reducer';
import { selectAllMenus } from '../../store/selectors/menu.selectors';
import { MenuActions } from '../../store/actions/menu.actions';
@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  constructor(private menuStore: Store<{ menus: MenuState }>) {}
  isCollapsed = false;
  menus: MenuItem[] = [];
  ngOnInit() {
    this.menuStore.dispatch(MenuActions.loadMenus({ page: 1 }));
    this.menuStore.select(selectAllMenus).subscribe((menus) => {
      console.log('Loaded menus from store:', menus);
      this.menus = this.buildMenuTree(menus);
    });
  }

  buildMenuTree(menu: readonly MenuNode[]): MenuItem[] {
    const map = new Map<number, MenuItem & { parentId?: number }>();
    const roots: MenuItem[] = [];

    // 计算层级
    const calculateLevel = (
      menuId: number,
      menuMap: Map<number, MenuNode>,
    ): number => {
      const menuNode = menuMap.get(menuId);
      if (!menuNode || !menuNode.parentId) return 1;
      return calculateLevel(menuNode.parentId, menuMap) + 1;
    };

    // 创建 menuMap 用于层级计算
    const menuMap = new Map<number, MenuNode>();
    menu.forEach((item) => menuMap.set(item.id, item));

    for (const item of menu) {
      map.set(item.id, {
        id: String(item.id),
        title: item.title || item.name,
        icon: item.icon,
        link: item.path,
        level: calculateLevel(item.id, menuMap),
        children: [],
        parentId: item.parentId,
      });
    }

    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        roots.push(item);
      }
      delete item.parentId;
      if (item.children && item.children.length === 0) {
        delete item.children;
      }
    }

    console.log('Built menu tree:', roots);
    return roots;
  }
}
