// lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // وہی Upstash credentials استعمال کرے گا

const DEFAULT_TTL = 300; // 5 منٹ

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return data as T;
}

export async function setCache(key: string, value: any, ttlSeconds: number = DEFAULT_TTL) {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

// خاص keys بنانے کے لیے helpers
export function dashboardKey(tenantId: string) {
  return `dashboard:${tenantId}`;
}

export function studentListKey(tenantId: string) {
  return `students:list:${tenantId}`;
}

export function feeListKey(tenantId: string, studentId?: string) {
  return `fees:list:${tenantId}${studentId ? `:${studentId}` : ''}`;
}

export function attendanceKey(tenantId: string, date: string) {
  return `attendance:${tenantId}:${date}`;
}
