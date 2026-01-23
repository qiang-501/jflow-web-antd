import { Pipe, PipeTransform } from '@angular/core';

/**
 * 安全HTML管道 - 标记HTML字符串为安全
 * 用法: <div [innerHTML]="htmlString | safeHtml"></div>
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  transform(value: string): string {
    // 简单的XSS防护，实际项目中应该使用DomSanitizer
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '');
  }
}
