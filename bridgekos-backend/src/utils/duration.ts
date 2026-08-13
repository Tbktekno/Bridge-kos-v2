const UNIT_TO_MS: Record<'s' | 'm' | 'h' | 'd', number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parses a duration string such as "15m", "7d", "3600s" or "5000" into milliseconds.
 * Defaults to seconds when no unit suffix is provided.
 */
export function parseDurationToMs(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])?$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid duration value: "${value}"`);
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 's') as keyof typeof UNIT_TO_MS;
  return amount * UNIT_TO_MS[unit];
}
