import { sql } from "@/lib/db"
import { mcqs, MCQ_TOTAL } from "@/lib/content"

export type DeviceState = {
  order: number[]
  mcqIndex: number
  breakDone: number
  finished: boolean
  answers: Record<number, number>
}

function shuffled(): number[] {
  const ids = mcqs.map((m) => m.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids.slice(0, MCQ_TOTAL)
}

export async function getState(deviceId: string): Promise<DeviceState> {
  let rows = await sql`SELECT q_order, mcq_index, break_done, finished_at FROM devices WHERE id = ${deviceId}`
  if (rows.length === 0) {
    rows = await sql`
      INSERT INTO devices (id, q_order) VALUES (${deviceId}, ${shuffled()})
      ON CONFLICT (id) DO UPDATE SET updated_at = devices.updated_at
      RETURNING q_order, mcq_index, break_done, finished_at`
  }
  const d = rows[0]
  const ans = await sql`SELECT q_id, choice FROM answers WHERE device_id = ${deviceId}`
  return {
    order: d.q_order,
    mcqIndex: d.mcq_index,
    breakDone: d.break_done,
    finished: d.finished_at !== null,
    answers: Object.fromEntries(ans.map((r) => [r.q_id, r.choice])),
  }
}

export function validId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(id)
}
