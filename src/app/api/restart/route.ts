import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getState, validId } from "@/lib/state"

export async function POST(req: Request) {
  const { deviceId } = await req.json()
  if (!validId(deviceId)) return NextResponse.json({ error: "bad id" }, { status: 400 })
  await sql`DELETE FROM devices WHERE id = ${deviceId}`
  return NextResponse.json(await getState(deviceId))
}
