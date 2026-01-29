import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter {
  async save(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  async load(key, defaultValue) {
    try {
      const saved = await AsyncStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.warn('Storage error:', e);
      return defaultValue;
    }
  }
}

