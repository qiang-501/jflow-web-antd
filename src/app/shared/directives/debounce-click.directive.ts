import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * 防抖指令 - 防止按钮重复点击
 * 用法: <button appDebounceClick (debounceClick)="onClick()" [debounceTime]="300">Click me</button>
 */
@Directive({
  selector: '[appDebounceClick]',
  standalone: true,
})
export class DebounceClickDirective {
  @Input() debounceTime = 300;
  @Input() debounceClick: () => void = () => {};
  private timeoutId: any;

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.debounceClick();
    }, this.debounceTime);
  }
}
