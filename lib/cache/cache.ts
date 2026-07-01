import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

export async function getOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  const client = getRedis();

  if (!client) {
    return fetchFunction();
  }

  const cached = await client.get<T>(key);

  if (cached) return cached;

  const fresh = await fetchFunction();

  if (fresh !== undefined && fresh !== null) {
    await client.set(key, fresh, {
      ex: ttlSeconds,
    });
  }

  return fresh;
}

export async function invalidateCache(key: string) {
  const client = getRedis();

  if (!client) return;

  await client.del(key);
}