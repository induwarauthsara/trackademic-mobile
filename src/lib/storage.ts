import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { createChunkedStorage, type KeyValueStore } from './storage-core';

const nativeStore: KeyValueStore = {
  getItem: key => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: key => SecureStore.deleteItemAsync(key),
};

const webStore: KeyValueStore = {
  async getItem(key) { return typeof window === 'undefined' ? null : window.sessionStorage.getItem(key); },
  async setItem(key, value) { if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value); },
  async removeItem(key) { if (typeof window !== 'undefined') window.sessionStorage.removeItem(key); },
};

// Web is a development preview. Native credentials use OS-protected SecureStore.
export const sessionStorage = Platform.OS === 'web' ? webStore : createChunkedStorage(nativeStore, Crypto.randomUUID);
