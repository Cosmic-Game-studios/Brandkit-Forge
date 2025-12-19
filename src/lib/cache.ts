import { createHash } from 'crypto';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CacheEntry, BrandConfig } from '../types.js';

const CACHE_FILE = '.brandkit-cache.json';

function getCachePath(): string {
  return join(process.cwd(), CACHE_FILE);
}

function loadCache(): Map<string, CacheEntry> {
  const cachePath = getCachePath();
  if (!existsSync(cachePath)) {
    return new Map();
  }

  try {
    const data = readFileSync(cachePath, 'utf-8');
    const entries: CacheEntry[] = JSON.parse(data);
    return new Map(entries.map((e) => [e.hash, e]));
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, CacheEntry>): void {
  const cachePath = getCachePath();
  const entries = Array.from(cache.values());
  writeFileSync(cachePath, JSON.stringify(entries, null, 2), 'utf-8');
}

export function hashConfig(config: Partial<BrandConfig>, prompt: string): string {
  const data = JSON.stringify({ config, prompt });
  return createHash('sha256').update(data).digest('hex').substring(0, 16);
}

export function getCachedPath(
  hash: string,
  config: BrandConfig
): string | null {
  if (!config.cache) {
    return null;
  }

  const cache = loadCache();
  const entry = cache.get(hash);
  if (entry && existsSync(entry.path)) {
    console.log(`  Cache hit: ${entry.path}`);
    return entry.path;
  }

  return null;
}

export function setCachedPath(
  hash: string,
  path: string,
  config: Partial<BrandConfig>
): void {
  if (!config.cache) {
    return;
  }

  const cache = loadCache();
  cache.set(hash, {
    hash,
    path,
    timestamp: new Date().toISOString(),
    config: config as Record<string, unknown>,
  });
  saveCache(cache);
}
