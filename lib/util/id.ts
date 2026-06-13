// lib/util/id.ts
import { randomUUID } from 'node:crypto';

export function genId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}
