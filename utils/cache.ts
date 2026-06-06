/**
 * Lightweight AsyncStorage-backed cache with TTL.
 *
 * All fetched PokéAPI responses are stored here so the app never hits the
 * same endpoint twice within the TTL window — respecting PokéAPI's Fair Use
 * Policy which explicitly asks clients to cache locally instead of spamming.
 *
 * Keys are URL-based so they're self-documenting and collision-free.
 * Errors are swallowed silently: a cache miss is always safe — the app just
 * falls back to a live fetch.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/** How long a cache entry is considered fresh (24 hours). */
const TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Read a cached value. Returns `null` if the entry is missing or expired.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > TTL_MS) {
      // Expired — evict so stale data never accumulates
      AsyncStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    return null; // JSON parse error or storage unavailable — safe to ignore
  }
}

/**
 * Write a value to the cache with the current timestamp.
 * Silently no-ops if storage is full or unavailable.
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Storage quota exceeded or unavailable — the app still works fine
  }
}
