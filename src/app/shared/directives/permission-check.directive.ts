// permission-check.directive.ts
import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { selectAllPermissions } from '../../store/selectors/permission.selectors';
import { selectAllUsers } from '../../store/selectors/user.selectors';

/**
 * 权限检查指令
 * 用法：*appHasPermission="'user:create'"
 *      *appHasPermission="['user:create', 'user:edit']"
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class PermissionCheckDirective implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  @Input() appHasPermission: string | string[] = [];
  @Input() appPermissionOperator: 'AND' | 'OR' = 'OR';

  ngOnInit(): void {
    this.checkPermission();
  }

  private checkPermission(): void {
    // TODO: 在实际应用中，应该从当前用户的权限列表中检查
    // 这里简化处理，从store获取所有权限
    this.store
      .select(selectAllPermissions)
      .pipe(
        map((permissions) => {
          const codes = permissions.map((p) => p.code);
          return this.hasPermission(codes);
        }),
      )
      .subscribe((hasPermission) => {
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          this.viewContainer.clear();
        }
      });
  }

  private hasPermission(userPermissions: string[]): boolean {
    if (!this.appHasPermission || this.appHasPermission.length === 0) {
      return true;
    }

    const requiredPermissions = Array.isArray(this.appHasPermission)
      ? this.appHasPermission
      : [this.appHasPermission];

    if (this.appPermissionOperator === 'AND') {
      return requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
    } else {
      return requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );
    }
  }
}
