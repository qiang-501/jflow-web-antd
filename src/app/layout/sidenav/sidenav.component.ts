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
      this.menus = this.buildMenuTree(menus);
    });
  }

  buildMenuTree(menu: readonly MenuNode[]): MenuItem[] {
    const map = new Map<string, MenuItem & { parent_id?: string }>();
    const roots: MenuItem[] = [];
    for (const item of menu) {
      map.set(item.id, {
        id: item.id,
        title: item.title,
        icon: item.icon,
        link: item.link,
        level: item.level,
        children: [],
        parent_id: item.parent_id,
      });
    }
    for (const item of map.values()) {
      if (item.parent_id && map.has(item.parent_id)) {
        const parent = map.get(item.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(item);
      } else {
        roots.push(item);
      }
      delete item.parent_id;
      if (item.children && item.children.length === 0) {
        delete item.children;
      }
    }
    return roots;
  }
}
