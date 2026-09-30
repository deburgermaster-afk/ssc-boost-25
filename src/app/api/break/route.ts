import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { BLOCK, BREAKS } from "@/lib/content"
import { getState, validId } from "@/lib/state"

export async function POST(req: Request) {
  const { deviceId, k } = await req.json()
  if (!validId(deviceId) || !Number.isInteger(k) || k < 1 || k > BREAKS) {
    return NextResponse.json({ error: "bad input" }, { status: 400 })
  }
  await sql`
    UPDATE devices
    SET break_done = ${k}, updated_at = now(),
        finished_at = CASE WHEN ${k} = ${BREAKS} THEN now() ELSE finished_at END
    WHERE id = ${deviceId} AND break_done = ${k - 1} AND mcq_index >= ${BLOCK * k}`
  return NextResponse.json(await getState(deviceId))
}
