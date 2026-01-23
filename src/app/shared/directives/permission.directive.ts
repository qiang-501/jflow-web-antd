import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * 权限控制指令 - 根据用户权限显示/隐藏元素
 * 用法: <button *appPermission="'admin'">Admin Only</button>
 */
@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class PermissionDirective {
  @Input() appPermission: string | string[] = '';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.checkPermission();
  }

  private checkPermission() {
    // TODO: 实现实际的权限检查逻辑
    // 这里是示例，实际应该从AuthService获取用户权限
    const hasPermission = this.mockCheckPermission();

    if (!hasPermission) {
      this.el.nativeElement.style.display = 'none';
    }
  }

  private mockCheckPermission(): boolean {
    // 示例：从localStorage获取用户角色
    const userRole = localStorage.getItem('userRole') || 'guest';
    const requiredPermissions = Array.isArray(this.appPermission)
      ? this.appPermission
      : [this.appPermission];

    return requiredPermissions.includes(userRole);
  }
}
