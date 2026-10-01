import { NextResponse } from "next/server"
import { getState, parse } from "@/lib/state"

export async function POST(req: Request) {
  const p = parse(await req.json())
  if (!p) return NextResponse.json({ error: "bad input" }, { status: 400 })
  return NextResponse.json(await getState(p.subject, p.deviceId))
}
