/**
 * 日期格式化工具类
 */
export class DateUtil {
  /**
   * 格式化日期
   * @param date 日期对象或时间戳
   * @param format 格式字符串，如 'YYYY-MM-DD HH:mm:ss'
   */
  static format(
    date: Date | string | number,
    format: string = 'YYYY-MM-DD',
  ): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 获取日期差异（天数）
   */
  static getDaysDiff(date1: Date | string, date2: Date | string): number {
    const d1 = new Date(date1).getTime();
    const d2 = new Date(date2).getTime();
    const diff = Math.abs(d1 - d2);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * 检查日期是否在范围内
   */
  static isInRange(
    date: Date | string,
    start: Date | string,
    end: Date | string,
  ): boolean {
    const d = new Date(date).getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return d >= s && d <= e;
  }

  /**
   * 获取今天的开始时间
   */
  static getStartOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取今天的结束时间
   */
  static getEndOfDay(date: Date = new Date()): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}
