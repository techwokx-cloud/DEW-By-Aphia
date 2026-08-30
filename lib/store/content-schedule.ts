import { queryOne } from "@/lib/db";

interface ScheduleRow {
  last_generated_at: string | null;
}

async function ensureRow(): Promise<ScheduleRow> {
  const row = await queryOne<ScheduleRow>(
    `INSERT INTO content_schedule (id, last_generated_at) VALUES (1, NULL)
     ON CONFLICT (id) DO NOTHING
     RETURNING last_generated_at`
  );
  if (row) return row;
  return (await queryOne<ScheduleRow>(`SELECT last_generated_at FROM content_schedule WHERE id = 1`))!;
}

export async function getLastGeneratedAt(): Promise<string | null> {
  const row = await ensureRow();
  return row.last_generated_at ? new Date(row.last_generated_at).toISOString() : null;
}

export async function markGenerated(): Promise<void> {
  await queryOne(
    `INSERT INTO content_schedule (id, last_generated_at) VALUES (1, now())
     ON CONFLICT (id) DO UPDATE SET last_generated_at = now()`
  );
}

export async function isDue(cadenceDays: number): Promise<boolean> {
  const last = await getLastGeneratedAt();
  if (!last) return true;
  const elapsedDays = (Date.now() - new Date(last).getTime()) / 86400000;
  return elapsedDays >= cadenceDays;
}
