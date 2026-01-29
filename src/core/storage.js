export class StorageAdapter {
  // eslint-disable-next-line no-unused-vars
  save(key, data) {
    throw new Error('Not implemented');
  }
  // eslint-disable-next-line no-unused-vars
  load(key, defaultValue) {
    throw new Error('Not implemented');
  }
}

export class WebLocalStorageAdapter extends StorageAdapter {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // Best-effort persistence; app should still function without it.
      console.error('Storage error:', e);
    }
  }
  load(key, defaultValue) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error('Storage error:', e);
      return defaultValue;
    }
  }
}

