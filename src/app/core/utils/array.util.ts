/**
 * 数组操作工具类
 */
export class ArrayUtil {
  /**
   * 数组去重
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * 根据对象属性去重
   */
  static uniqueBy<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  /**
   * 数组分组
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  }

  /**
   * 数组分页
   */
  static paginate<T>(array: T[], page: number, pageSize: number): T[] {
    const startIndex = (page - 1) * pageSize;
    return array.slice(startIndex, startIndex + pageSize);
  }

  /**
   * 数组求和
   */
  static sum(array: number[]): number {
    return array.reduce((sum, num) => sum + num, 0);
  }

  /**
   * 数组平均值
   */
  static average(array: number[]): number {
    if (array.length === 0) return 0;
    return this.sum(array) / array.length;
  }

  /**
   * 打乱数组顺序
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * 数组扁平化
   */
  static flatten<T>(array: any[]): T[] {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }
}
