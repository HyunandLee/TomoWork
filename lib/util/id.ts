import { randomUUID } from 'node:crypto';

/** prefix 付きの一意ID（例: hire_3f9a...）。 */
export function genId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}
