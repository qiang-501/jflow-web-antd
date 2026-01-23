import { Pipe, PipeTransform } from '@angular/core';

/**
 * 高亮搜索词管道
 * 用法: {{ text | highlight:searchTerm }}
 */
@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchTerm: string): string {
    if (!searchTerm || !value) {
      return value;
    }

    const regex = new RegExp(searchTerm, 'gi');
    return value.replace(regex, (match) => `<mark>${match}</mark>`);
  }
}
