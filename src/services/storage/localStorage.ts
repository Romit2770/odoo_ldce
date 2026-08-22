/**
 * Typed Local Storage Wrapper
 */

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`globetrotter_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`globetrotter_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(`globetrotter_${key}`);
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }
  },

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('globetrotter_'))
        .forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  },
};
