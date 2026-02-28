import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { MenuItem } from '../../models/menu.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { firstValueFrom } from 'rxjs';

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
  constructor(
    private menuService: MenuService,
    private cdr: ChangeDetectorRef,
  ) {}
  isCollapsed = false;
  menus: MenuItem[] = [];

  ngOnInit() {
    this.loadMenus();
  }

  async loadMenus() {
    try {
      const response = await firstValueFrom(
        this.menuService.getMenus({ page: 1 }),
      );
      console.log('Loaded menus:', response.data);
      // 使用 setTimeout 避免 ExpressionChangedAfterItHasBeenCheckedError
      this.menus = this.convertToMenuItem(response.data);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading menus:', error);
    }
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
