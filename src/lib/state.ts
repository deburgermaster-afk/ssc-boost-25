import { sql } from "@/lib/db"
import { isSubject, subjectById, type Subject, type SubjectId } from "@/lib/content"

export type DeviceState = {
  order: number[]
  mcqIndex: number
  breakDone: number
  finished: boolean
  answers: Record<number, number>
}

// Each subject keeps its own progress row, keyed "<subject>:<device>".
export const dbKey = (subject: SubjectId, deviceId: string) => `${subject}:${deviceId}`

export async function getState(subject: Subject, deviceId: string): Promise<DeviceState> {
  const key = dbKey(subject.id, deviceId)
  let rows = await sql`SELECT q_order, mcq_index, break_done, finished_at FROM devices WHERE id = ${key}`
  if (rows.length === 0) {
    rows = await sql`
      INSERT INTO devices (id, q_order) VALUES (${key}, ${subject.order})
      ON CONFLICT (id) DO UPDATE SET updated_at = devices.updated_at
      RETURNING q_order, mcq_index, break_done, finished_at`
  }
  const d = rows[0]
  const ans = await sql`SELECT q_id, choice FROM answers WHERE device_id = ${key}`
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

// Parses the common { subject, deviceId } part of every request body.
export function parse(body: { subject?: unknown; deviceId?: unknown }) {
  if (!validId(body.deviceId) || !isSubject(body.subject)) return null
  return { subject: subjectById.get(body.subject)!, deviceId: body.deviceId }
}
