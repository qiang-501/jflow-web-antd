import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { MenuItem } from '../../models/menu.model';
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
      // API现在直接返回带children的树形结构，不需要再构建树
      this.menus = this.convertToMenuItem(menus);
    });
  }

  // 将API返回的菜单数据转换为MenuItem格式
  convertToMenuItem(menus: readonly any[]): MenuItem[] {
    return menus.map((menu) => ({
      id: String(menu.id),
      title: menu.title || menu.name,
      icon: menu.icon,
      link: menu.link || menu.path,
      level: menu.level || 1,
      children: menu.children
        ? this.convertToMenuItem(menu.children)
        : undefined,
    }));
  }
}
