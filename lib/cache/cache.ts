// lib/cache/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  const fresh = await fetchFunction();
  if (fresh !== null && fresh !== undefined) {
    await redis.set(key, fresh, { ex: ttlSeconds });
  }
  return fresh;
}

export async function invalidateCache(key: string) {
  await redis.del(key);
}
