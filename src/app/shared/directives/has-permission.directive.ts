import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  inject,
  OnDestroy,
} from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * 权限控制指令 - 基于缓存的权限检查
 *
 * 用法示例：
 * 1. 字符串格式：*appHasPermission="'workflow:create'"
 * 2. 对象格式：*appHasPermission="{ resource: 'workflow', action: 'create' }"
 * 3. 带 else 模板：
 *    <ng-container *appHasPermission="'workflow:create'; else noPermission">
 *      <button>创建工作流</button>
 *    </ng-container>
 *    <ng-template #noPermission>
 *      <button disabled>创建工作流（无权限）</button>
 *    </ng-template>
 *
 * 注意：权限数据从缓存中读取，应用启动时会自动加载一次
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private permissionService = inject(PermissionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  @Input() appHasPermission!: string | { resource: string; action: string };
  @Input() appHasPermissionElse?: TemplateRef<any>;

  ngOnInit(): void {
    this.checkPermission();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermission(): void {
    if (!this.appHasPermission) {
      // 如果没有指定权限，默认显示
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }

    // 使用缓存的权限进行检查（不发送网络请求）
    this.permissionService
      .hasPermission(this.appHasPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hasPermission) => {
          this.viewContainer.clear();
          if (hasPermission) {
            this.viewContainer.createEmbeddedView(this.templateRef);
          } else if (this.appHasPermissionElse) {
            this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
          }
        },
        error: (error) => {
          console.error('Permission check failed:', error);
          // 权限检查失败时默认不显示
          this.viewContainer.clear();
          if (this.appHasPermissionElse) {
            this.viewContainer.createEmbeddedView(this.appHasPermissionElse);
          }
        },
      });
  }
}
