export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function safeInt(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function safeNum(value: unknown, fallback = 0): number {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function toNumericOvers(balls: number): number {
  const overs = Math.floor(balls / 6);
  const rem = balls % 6;
  return overs + rem / 10;
}

export function toBalls(overs: number): number {
  const whole = Math.floor(overs);
  const frac = Math.round((overs - whole) * 10);
  return whole * 6 + frac;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
