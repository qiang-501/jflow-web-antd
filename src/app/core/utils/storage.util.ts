/**
 * 本地存储工具类 - 提供类型安全的localStorage操作
 */
export class StorageUtil {
  /**
   * 保存数据到localStorage
   */
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  }

  /**
   * 从localStorage获取数据
   */
  static getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return defaultValue ?? null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return defaultValue ?? null;
    }
  }

  /**
   * 从localStorage删除数据
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
    }
  }

  /**
   * 清空localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  }

  /**
   * 检查key是否存在
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
