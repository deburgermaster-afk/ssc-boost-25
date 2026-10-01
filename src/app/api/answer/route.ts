import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { BLOCK } from "@/lib/content"
import { dbKey, getState, parse } from "@/lib/state"

// Records one answer. Only the question at the current position is accepted,
// which keeps the flow forward-only and makes double-taps harmless.
export async function POST(req: Request) {
  const body = await req.json()
  const p = parse(body)
  const { qId, choice } = body
  const q = p?.subject.mcqById.get(qId)
  if (!p || !q || ![0, 1, 2, 3].includes(choice)) {
    return NextResponse.json({ error: "bad input" }, { status: 400 })
  }
  const key = dbKey(p.subject.id, p.deviceId)
  await sql`
    WITH d AS (
      UPDATE devices SET mcq_index = mcq_index + 1, updated_at = now()
      WHERE id = ${key}
        AND q_order[mcq_index + 1] = ${qId}
        AND mcq_index < ${BLOCK} * (break_done + 1)
      RETURNING id
    )
    INSERT INTO answers (device_id, q_id, choice, correct)
    SELECT id, ${qId}, ${choice}, ${choice === q.a} FROM d
    ON CONFLICT DO NOTHING`
  return NextResponse.json(await getState(p.subject, p.deviceId))
}
