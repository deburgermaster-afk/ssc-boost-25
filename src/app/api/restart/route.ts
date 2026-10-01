import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { dbKey, getState, parse } from "@/lib/state"

export async function POST(req: Request) {
  const p = parse(await req.json())
  if (!p) return NextResponse.json({ error: "bad input" }, { status: 400 })
  await sql`DELETE FROM devices WHERE id = ${dbKey(p.subject.id, p.deviceId)}`
  return NextResponse.json(await getState(p.subject, p.deviceId))
}
