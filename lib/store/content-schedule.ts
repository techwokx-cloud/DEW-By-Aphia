const state: { lastGeneratedAt: string | null } = { lastGeneratedAt: null };

export function getLastGeneratedAt(): string | null {
  return state.lastGeneratedAt;
}

export function markGenerated() {
  state.lastGeneratedAt = new Date().toISOString();
}

export function isDue(cadenceDays: number): boolean {
  if (!state.lastGeneratedAt) return true;
  const elapsedDays = (Date.now() - new Date(state.lastGeneratedAt).getTime()) / 86400000;
  return elapsedDays >= cadenceDays;
}
