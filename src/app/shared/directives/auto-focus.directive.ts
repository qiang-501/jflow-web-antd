import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * 自动聚焦指令
 * 用法: <input appAutoFocus />
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements OnInit {
  @Input() appAutoFocus = true;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.appAutoFocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, 0);
    }
  }
}
